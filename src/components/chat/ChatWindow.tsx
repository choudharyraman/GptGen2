"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { motion, AnimatePresence } from "framer-motion";

import { useChats } from "@/hooks/useChats";
import { useChatStore } from "@/stores/chatStore";
import InputBox from "@/components/chat/InputBox";
import { MODELS, PERSONAS, DEFAULT_MODEL } from "@/lib/constants";
import { generateChatTitle } from "@/lib/utils";

export default function ChatWindow() {
  const { currentChatId, chats, createNewChat, renameChat } = useChats();
  const { toggleSidebar, sidebarOpen, currentModel, currentPersona, setModel, setPersona, addMessage, updateLastMessage, messages: storeMessages } = useChatStore();
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [activeThoughtMessageId, setActiveThoughtMessageId] = useState<string | null>(null);

  const chat = chats.find((c) => c.id === currentChatId);
  const messages = currentChatId ? storeMessages[currentChatId] || [] : [];

  // Fallback to DEFAULT_MODEL if currentModel is no longer in MODELS
  const validModel = MODELS.some(m => m.id === currentModel) ? currentModel : DEFAULT_MODEL;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (content: string) => {
    if (!content.trim()) return;

    let targetChatId = currentChatId;
    let isFirstMessage = false;

    if (!targetChatId) {
      targetChatId = await createNewChat();
      isFirstMessage = true;
    } else {
      const existing = storeMessages[targetChatId] || [];
      if (existing.length === 0) {
        isFirstMessage = true;
      }
    }
    
    if (!targetChatId) return;

    // Add user message
    const userMsgId = crypto.randomUUID();
    await addMessage(targetChatId, {
      id: userMsgId,
      chat_id: targetChatId,
      role: "user",
      content,
      created_at: new Date().toISOString(),
    });

    // Rename chat dynamically on first message
    if (isFirstMessage) {
      const title = generateChatTitle(content);
      renameChat(targetChatId, title);
    }

    // Add empty assistant message
    const assistantMsgId = crypto.randomUUID();
    await addMessage(targetChatId, {
      id: assistantMsgId,
      chat_id: targetChatId,
      role: "assistant",
      content: "",
      created_at: new Date().toISOString(),
    });

    setIsStreaming(true);
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({ 
              role: m.role, 
              content: m.content ? m.content.replace(/<think>[\s\S]*?(<\/think>|$)/, '').trim() : "" 
            })), 
            { role: "user", content }
          ],
          modelId: validModel,
          personaId: currentPersona,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        let errorMsg = "Failed to fetch response";
        try {
          const errData = await response.json();
          errorMsg = errData.error || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullThinking = "";
      let fullContent = "";
      let buffer = "";
      
      const thinkingStartTime = Date.now();
      let thinkingDuration = 0;
      let thinkingEnded = false;
      let sourcesList: Array<{ name: string; content?: string }> = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        
        // Save the last incomplete line to parse with next chunk
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ") && trimmed !== "data: [DONE]") {
            try {
              const data = JSON.parse(trimmed.slice(6));
              
              if (data.type === "sources") {
                 sourcesList = data.sources;
                 const formattedMessage = (fullThinking ? `<think>\n${fullThinking}\n</think>\n\n` : "") + fullContent;
                 updateLastMessage(targetChatId, formattedMessage, sourcesList, thinkingDuration || undefined);
                 continue;
              }
              
              const delta = data.choices?.[0]?.delta || {};
              
              if (delta.reasoning) {
                 fullThinking += delta.reasoning;
              }
              if (delta.content) {
                 if (fullThinking && !thinkingEnded) {
                   thinkingEnded = true;
                   thinkingDuration = Math.round((Date.now() - thinkingStartTime) / 1000) || 1;
                 }
                 fullContent += delta.content;
              }
              
              const formattedMessage = (fullThinking ? `<think>\n${fullThinking}\n</think>\n\n` : "") + fullContent;
              updateLastMessage(targetChatId, formattedMessage, sourcesList, thinkingDuration || undefined);
            } catch (e: unknown) {
              // Ignore incomplete JSON chunks
            }
          }
        }
      }

      // Process any leftover content in buffer
      if (buffer.trim()) {
        const trimmed = buffer.trim();
        if (trimmed.startsWith("data: ") && trimmed !== "data: [DONE]") {
          try {
            const data = JSON.parse(trimmed.slice(6));
            
            if (data.type === "sources") {
               sourcesList = data.sources;
               const formattedMessage = (fullThinking ? `<think>\n${fullThinking}\n</think>\n\n` : "") + fullContent;
               updateLastMessage(targetChatId, formattedMessage, sourcesList, thinkingDuration || undefined);
               return; // leftover content processed
            }
            
            const delta = data.choices?.[0]?.delta || {};
            
            if (delta.reasoning) {
               fullThinking += delta.reasoning;
            }
            if (delta.content) {
               if (fullThinking && !thinkingEnded) {
                 thinkingEnded = true;
                 thinkingDuration = Math.round((Date.now() - thinkingStartTime) / 1000) || 1;
               }
               fullContent += delta.content;
            }
            
            const formattedMessage = (fullThinking ? `<think>\n${fullThinking}\n</think>\n\n` : "") + fullContent;
            updateLastMessage(targetChatId, formattedMessage, sourcesList, thinkingDuration || undefined);
          } catch (e: unknown) {
            // Ignore
          }
        }
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (err.name !== "AbortError") {
        updateLastMessage(
          targetChatId,
          err.message || "Sorry, I encountered an error generating the response."
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handlePillClick = (prompt: string) => {
    handleSend(prompt);
  };

  // Find the currently active thought message if it exists
  const activeThoughtMessage = messages.find(m => m.id === activeThoughtMessageId);

  return (
    <div style={{ flex: 1, display: "flex", height: "100%", width: "100%", overflow: "hidden" }}>
      {/* Left Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", position: "relative", overflow: "hidden" }}>
        {/* Top Header */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 1rem",
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {!sidebarOpen && (
              <button
                onClick={toggleSidebar}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                  padding: "0.5rem",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="9" y1="3" x2="9" y2="21"/>
                </svg>
              </button>
            )}

            {/* Model Dropdown styled like ChatGPT */}
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <select
                value={validModel}
                onChange={(e) => setModel(e.target.value)}
                style={{
                  appearance: "none",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-primary)",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: "0.5rem 1.5rem 0.5rem 0.5rem",
                  outline: "none",
                }}
              >
                {MODELS.map((m) => (
                  <option key={m.id} value={m.id} style={{ background: "var(--bg-secondary)" }}>
                    {m.name.includes("Gemma") ? "ChatGPT" : m.name} v
                  </option>
                ))}
              </select>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ position: "absolute", right: "0.25rem", pointerEvents: "none" }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>

          {/* Persona Selector (Subtle) */}
          <select
            value={currentPersona}
            onChange={(e) => setPersona(e.target.value)}
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "0.35rem 0.5rem",
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {PERSONAS.map((p) => (
              <option key={p.id} value={p.id} style={{ background: "var(--bg-secondary)" }}>
                {p.icon} {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Messages Area */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "60px 1rem 0", // Space for header
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {messages.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                maxWidth: 768,
                padding: "2rem",
              }}
            >
              <h1
                style={{
                  fontSize: "2rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: "2rem",
                  textAlign: "center"
                }}
              >
                What can I help with?
              </h1>
              
              <div style={{ width: "100%", marginBottom: "1.5rem" }}>
                <InputBox onSend={handleSend} onStop={handleStop} isStreaming={isStreaming} />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center", maxWidth: 600 }}>
                <button
                  onClick={() => handlePillClick("Create an image for a presentation")}
                  style={{
                    background: "transparent",
                    border: "1px solid var(--border)",
                    borderRadius: 20,
                    padding: "0.5rem 1rem",
                    color: "var(--text-secondary)",
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                  }}
                >
                  <span style={{ color: "#84cc16" }}>🖼️</span> Create image
                </button>
                <button
                  onClick={() => handlePillClick("Make a plan to learn a new language")}
                  style={{
                    background: "transparent",
                    border: "1px solid var(--border)",
                    borderRadius: 20,
                    padding: "0.5rem 1rem",
                    color: "var(--text-secondary)",
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                  }}
                >
                  <span style={{ color: "#3b82f6" }}>📋</span> Make a plan
                </button>
                <button
                  onClick={() => handlePillClick("Help me code a website")}
                  style={{
                    background: "transparent",
                    border: "1px solid var(--border)",
                    borderRadius: 20,
                    padding: "0.5rem 1rem",
                    color: "var(--text-secondary)",
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                  }}
                >
                  <span style={{ color: "#eab308" }}>💻</span> Code
                </button>
                <button
                  onClick={() => handlePillClick("Help me analyze some data")}
                  style={{
                    background: "transparent",
                    border: "1px solid var(--border)",
                    borderRadius: 20,
                    padding: "0.5rem 1rem",
                    color: "var(--text-secondary)",
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                  }}
                >
                  <span style={{ color: "#ec4899" }}>📈</span> Analyze data
                </button>
                <button
                  onClick={() => handlePillClick("Brainstorm ideas for a project")}
                  style={{
                    background: "transparent",
                    border: "1px solid var(--border)",
                    borderRadius: 20,
                    padding: "0.5rem 1rem",
                    color: "var(--text-secondary)",
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                  }}
                >
                  <span style={{ color: "#a855f7" }}>💡</span> Brainstorm
                </button>
                <button
                  style={{
                    background: "transparent",
                    border: "1px solid var(--border)",
                    borderRadius: 20,
                    padding: "0.5rem 1rem",
                    color: "var(--text-secondary)",
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                  }}
                >
                  More
                </button>
              </div>
            </div>
          ) : (
            <div style={{ width: "100%", maxWidth: 768, display: "flex", flexDirection: "column", paddingBottom: "2rem" }}>
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  style={{
                    padding: "1rem 0",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: message.role === "user" ? "flex-end" : "flex-start",
                      gap: "1rem",
                    }}
                  >
                    {message.role === "assistant" && (
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          border: "1px solid var(--border)",
                          background: "var(--bg-secondary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: 4,
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                      </div>
                    )}

                    <div
                      style={{
                        background: message.role === "user" ? "var(--user-bubble)" : "var(--ai-bubble)",
                        color: "var(--text-primary)",
                        padding: message.role === "user" ? "0.75rem 1.25rem" : "0",
                        borderRadius: message.role === "user" ? 24 : 0,
                        maxWidth: "100%",
                        fontSize: "0.95rem",
                        lineHeight: "1.6",
                      }}
                      className="prose prose-invert max-w-none"
                    >
                      {(() => {
                        if (!message.content) {
                          return (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, height: 24 }}>
                              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--text-muted)", animation: "pulse 1.5s infinite" }} />
                              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--text-muted)", animation: "pulse 1.5s infinite 0.2s" }} />
                              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--text-muted)", animation: "pulse 1.5s infinite 0.4s" }} />
                            </div>
                          );
                        }

                        const thinkMatch = message.content.match(/<think>([\s\S]*?)<\/think>/);
                        const isThinking = message.content.includes('<think>') && !message.content.includes('</think>');
                        const openThinkMatch = isThinking ? message.content.match(/<think>([\s\S]*)$/) : null;
                        
                        const thinkContent = thinkMatch ? thinkMatch[1] : (openThinkMatch ? openThinkMatch[1] : null);
                        const cleanContent = message.content.replace(/<think>[\s\S]*?(<\/think>|$)/, '').trim();

                        return (
                          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
                            {thinkContent && (
                              <button
                                onClick={() => setActiveThoughtMessageId(message.id)}
                                style={{
                                  cursor: "pointer",
                                  fontSize: "0.85rem",
                                  color: "var(--text-secondary)",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.35rem",
                                  padding: "0.25rem 0.5rem",
                                  borderRadius: "8px",
                                  border: "1px solid var(--border)",
                                  background: "var(--bg-secondary)",
                                  width: "fit-content",
                                  fontWeight: 500,
                                  transition: "all 0.15s ease",
                                  outline: "none",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = "var(--text-muted)";
                                  e.currentTarget.style.background = "var(--bg-hover)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = "var(--border)";
                                  e.currentTarget.style.background = "var(--bg-secondary)";
                                }}
                              >
                                {isThinking ? (
                                  <>
                                    <span style={{ display: "flex", alignItems: "center", gap: "0.2rem", height: 12 }}>
                                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--text-secondary)", animation: "pulse 1.2s infinite" }} />
                                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--text-secondary)", animation: "pulse 1.2s infinite 0.2s" }} />
                                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--text-secondary)", animation: "pulse 1.2s infinite 0.4s" }} />
                                    </span>
                                    <span>Thinking...</span>
                                  </>
                                ) : (
                                  <span>Thought for {message.thinkingDuration ?? 5}s</span>
                                )}
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 2 }}>
                                  <polyline points="9 18 15 12 9 6"/>
                                </svg>
                              </button>
                            )}
                            
                            {cleanContent && (
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  code({ inline, className, children, ...props }: React.ComponentPropsWithoutRef<"code"> & { inline?: boolean }) {
                                    const match = /language-(\w+)/.exec(className || "");
                                    return !inline && match ? (
                                      <div style={{ margin: "1rem 0", borderRadius: 8, overflow: "hidden" }}>
                                        <div style={{ background: "#2d2d2d", padding: "0.5rem 1rem", fontSize: "0.75rem", color: "#a1a1aa", display: "flex", justifyContent: "space-between" }}>
                                          <span>{match[1]}</span>
                                          <button style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}>Copy</button>
                                        </div>
                                        <SyntaxHighlighter
                                          {...props as Record<string, unknown>}
                                          style={vscDarkPlus}
                                          language={match[1]}
                                          PreTag="div"
                                          customStyle={{ margin: 0, borderRadius: "0 0 8px 8px" }}
                                        >
                                          {String(children).replace(/\n$/, "")}
                                        </SyntaxHighlighter>
                                      </div>
                                    ) : (
                                      <code {...props} className={className} style={{ background: "var(--bg-tertiary)", padding: "0.2rem 0.4rem", borderRadius: 4, fontSize: "0.85em" }}>
                                        {children}
                                      </code>
                                    );
                                  },
                                }}
                              >
                                {cleanContent}
                              </ReactMarkdown>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Box for when not empty */}
        {messages.length > 0 && (
          <div
            style={{
              width: "100%",
              maxWidth: 768,
              margin: "0 auto",
            }}
          >
            <InputBox onSend={handleSend} onStop={handleStop} isStreaming={isStreaming} />
          </div>
        )}
      </div>

      {/* Right Activity / Thought Panel Sidebar */}
      <AnimatePresence>
        {activeThoughtMessage && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 360, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              height: "100%",
              background: "var(--bg-secondary)",
              borderLeft: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              flexShrink: 0,
              zIndex: 10,
            }}
          >
            {/* Thought Panel Header */}
            <div
              style={{
                padding: "0.75rem 1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: 60,
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)" }}>
                Activity {activeThoughtMessage.thinkingDuration ? `· ${activeThoughtMessage.thinkingDuration}s` : ""}
              </span>
              <button
                onClick={() => setActiveThoughtMessageId(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                  padding: "0.4rem",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background-color 0.15s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "none"}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Thought Panel Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <span style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-primary)" }}>Thinking</span>
                <span 
                  onClick={() => setActiveThoughtMessageId(null)}
                  style={{ fontSize: "0.85rem", color: "var(--text-secondary)", cursor: "pointer", textDecoration: "underline" }}
                >
                  Answer now
                </span>
              </div>

              {/* Timeline list of thinking steps parsed from message content */}
              {(() => {
                const content = activeThoughtMessage.content || "";
                const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);
                const isThinking = content.includes('<think>') && !content.includes('</think>');
                const openThinkMatch = isThinking ? content.match(/<think>([\s\S]*)$/) : null;
                
                const thinkContent = thinkMatch ? thinkMatch[1] : (openThinkMatch ? openThinkMatch[1] : "");
                
                if (!thinkContent.trim()) {
                  return (
                    <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontStyle: "italic", textAlign: "center", marginTop: "2rem" }}>
                      No detailed activity log recorded.
                    </div>
                  );
                }

                const steps = thinkContent.split("\n").map(s => s.trim()).filter(Boolean);

                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", position: "relative", paddingLeft: "1.25rem", borderLeft: "2px solid var(--border)", marginLeft: "0.5rem" }}>
                    {steps.map((step, idx) => {
                      const isSearch = step.toLowerCase().includes("browsing") || step.toLowerCase().includes("retriever") || step.toLowerCase().includes("evidence") || step.toLowerCase().includes("retrieved");
                      
                      return (
                        <div key={idx} style={{ position: "relative", marginBottom: "0.25rem" }}>
                          {/* Timeline node icon */}
                          <div
                            style={{
                              position: "absolute",
                              left: "-1.85rem",
                              top: "0.2rem",
                              width: "1.1rem",
                              height: "1.1rem",
                              borderRadius: "50%",
                              background: isSearch ? "#3b82f6" : "var(--bg-tertiary)",
                              border: "2px solid var(--border)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                            }}
                          >
                            {isSearch ? (
                              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="2" y1="12" x2="22" y2="12"/>
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                              </svg>
                            ) : (
                              <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--text-primary)" }} />
                            )}
                          </div>

                          {/* Step Content */}
                          <div style={{ fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: 500, lineHeight: "1.4" }}>
                            {step}
                          </div>

                          {/* Source pills inside search step! */}
                          {isSearch && activeThoughtMessage.sources && activeThoughtMessage.sources.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem", marginBottom: "0.5rem" }}>
                              {activeThoughtMessage.sources.map((source, sIdx) => (
                                <div
                                  key={sIdx}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.35rem",
                                    padding: "0.25rem 0.5rem",
                                    borderRadius: "12px",
                                    background: "var(--bg-tertiary)",
                                    border: "1px solid var(--border)",
                                    fontSize: "0.75rem",
                                    color: "var(--text-primary)",
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    transition: "border-color 0.15s ease",
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--text-muted)"}
                                  onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
                                >
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="2" y1="12" x2="22" y2="12"/>
                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                                  </svg>
                                  <span>{source.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
