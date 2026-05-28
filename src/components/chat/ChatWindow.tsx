"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useChatStore } from "@/stores/chatStore";
import { useChat } from "@/hooks/useChat";
import MessageBubble from "./MessageBubble";
import InputBox from "./InputBox";
import { PERSONAS } from "@/lib/constants";

export default function ChatWindow() {
  const { messages, isStreaming, sendMessage, stopGeneration } = useChat();
  const { currentChatId, currentPersona } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const persona = PERSONAS.find((p) => p.id === currentPersona);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!currentChatId) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✨</div>
        <h2 style={{ color: "var(--text-primary)", marginBottom: "0.5rem", fontSize: "1.25rem" }}>
          No chat selected
        </h2>
        <p style={{ fontSize: "0.9rem" }}>Create a new chat from the sidebar to get started</p>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        background: "var(--bg-primary)",
      }}
    >
      {/* Messages area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1rem 0",
        }}
      >
        {messages.length === 0 ? (
          <EmptyState persona={persona} />
        ) : (
          <div style={{ maxWidth: 860, margin: "0 auto", width: "100%" }}>
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isStreaming={isStreaming && index === messages.length - 1 && message.role === "assistant"}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ maxWidth: 860, margin: "0 auto", width: "100%" }}>
        <InputBox
          onSend={sendMessage}
          onStop={stopGeneration}
          isStreaming={isStreaming}
          disabled={!currentChatId}
        />
      </div>
    </div>
  );
}

function EmptyState({ persona }: { persona?: { name: string; icon: string; description: string } | undefined }) {
  const suggestions = [
    "Explain quantum computing in simple terms",
    "Write a Python function to sort a list",
    "Help me brainstorm a product roadmap",
    "What are best practices for REST APIs?",
    "Draft a professional email to my team",
    "Explain the concept of microservices",
  ];

  const { isStreaming } = useChatStore();
  const { sendMessage } = useChat();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 2rem",
        maxWidth: 680,
        margin: "0 auto",
        textAlign: "center",
        minHeight: "60vh",
      }}
    >
      <div
        style={{
          fontSize: "3.5rem",
          marginBottom: "1rem",
          filter: "drop-shadow(0 0 20px rgba(108,99,255,0.3))",
        }}
      >
        {persona?.icon || "✨"}
      </div>
      <h2
        style={{
          fontSize: "1.75rem",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: "0.5rem",
        }}
      >
        How can I help you?
      </h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: "2.5rem", fontSize: "0.95rem" }}>
        {persona?.description || "Ask me anything — I'm here to help"}
      </p>

      {/* Suggestion chips */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "0.75rem",
          width: "100%",
        }}
      >
        {suggestions.map((suggestion, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => sendMessage(suggestion)}
            disabled={isStreaming}
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "0.875rem 1rem",
              textAlign: "left",
              cursor: "pointer",
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              transition: "all 0.2s",
              lineHeight: 1.4,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.color = "var(--text-primary)";
              e.currentTarget.style.background = "var(--accent-glow)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text-secondary)";
              e.currentTarget.style.background = "var(--bg-secondary)";
            }}
          >
            {suggestion}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
