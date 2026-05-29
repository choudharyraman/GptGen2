"use client";

import { useRef, useEffect, useState, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "@/stores/chatStore";

interface InputBoxProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export default function InputBox({ onSend, onStop, isStreaming, disabled }: InputBoxProps) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, sourceName: file.name }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Successfully ingested ${file.name}`);
      } else {
        alert(`Error ingesting: ${data.error}`);
      }
    } catch (err) {
      alert("Failed to read or upload file");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    setShowPlusMenu(false);
  };

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  // Close plus menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target as Node)) {
        setShowPlusMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = () => {
    if (!input.trim() || isStreaming || disabled) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice input not supported in this browser.");
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev: string) => prev + (prev ? " " : "") + transcript);
    };
    recognition.start();
  };

  const menuItems = [
    { type: "item", label: "Add photos & files", action: () => { fileInputRef.current?.click(); }, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg> },
    { type: "item", label: "Recent files", hasArrow: true, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
    { type: "divider" },
    { type: "item", label: "Create image", action: () => { setInput("Create an image "); setShowPlusMenu(false); textareaRef.current?.focus(); }, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> },
    { type: "item", label: "Thinking", action: () => { setInput("Let's think about "); setShowPlusMenu(false); textareaRef.current?.focus(); }, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/></svg> },
    { type: "item", label: "Deep research", action: () => { setInput("Conduct deep research on "); setShowPlusMenu(false); textareaRef.current?.focus(); }, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><path d="M11 8v3l2 2"/></svg> },
    { type: "item", label: "Web search", action: () => { setInput("Search the web for "); setShowPlusMenu(false); textareaRef.current?.focus(); }, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
    { type: "item", label: "More", hasArrow: true, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg> },
    { type: "divider" },
    { type: "item", label: "Projects", hasArrow: true, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> },
  ];

  return (
    <div
      style={{
        padding: "0.5rem 1rem 1rem",
        background: "var(--bg-primary)",
      }}
    >
      {/* Hidden File Input */}
      <input 
        type="file" 
        accept=".txt,.md,.json,.csv"
        ref={fileInputRef} 
        style={{ display: "none" }} 
        onChange={handleFileUpload} 
      />

      {/* Main input container - Pill shaped */}
      <div
        style={{
          position: "relative",
          background: "var(--bg-tertiary)",
          borderRadius: 24,
          display: "flex",
          alignItems: "flex-end",
          padding: "0.5rem 0.5rem",
          minHeight: 52,
          boxShadow: "var(--shadow-sm)",
          border: "1px solid transparent",
          transition: "border-color 0.2s",
        }}
        onFocusCapture={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
        }}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            (e.currentTarget as HTMLElement).style.borderColor = "transparent";
          }
        }}
      >
        {/* Left icon (+) and Menu */}
        <div ref={plusMenuRef} style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <button
            onClick={() => setShowPlusMenu(!showPlusMenu)}
            style={{
              background: showPlusMenu ? "var(--bg-hover)" : "none",
              border: "none",
              color: "var(--text-primary)",
              padding: "0.5rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              borderRadius: "50%",
              width: 36,
              height: 36,
              marginBottom: 2,
              transition: "background 0.2s"
            }}
            onMouseEnter={(e) => { if (!showPlusMenu) e.currentTarget.style.background = "var(--bg-hover)" }}
            onMouseLeave={(e) => { if (!showPlusMenu) e.currentTarget.style.background = "none" }}
          >
            <motion.div
              animate={{ rotate: showPlusMenu ? 45 : 0 }}
              transition={{ duration: 0.15 }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </motion.div>
          </button>

          {/* Plus Menu Popover */}
          <AnimatePresence>
            {showPlusMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: "absolute",
                  bottom: "calc(100% + 10px)",
                  left: 0,
                  width: 260,
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: "0.5rem",
                  boxShadow: "var(--shadow-lg)",
                  display: "flex",
                  flexDirection: "column",
                  zIndex: 100
                }}
              >
                {menuItems.map((item, idx) => {
                  if (item.type === "divider") {
                    return <div key={idx} style={{ height: 1, background: "var(--border)", margin: "0.25rem 0" }} />;
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (item.action) item.action();
                        else setShowPlusMenu(false); // Default close for unhandled
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.6rem 0.75rem",
                        background: "none",
                        border: "none",
                        borderRadius: 8,
                        color: "var(--text-primary)",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        textAlign: "left",
                        width: "100%",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ display: "flex", alignItems: "center", color: "var(--text-primary)" }}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {item.hasArrow && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      )}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything"
          disabled={disabled}
          rows={1}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            padding: "0.5rem 0.5rem",
            fontSize: "0.95rem",
            color: "var(--text-primary)",
            resize: "none",
            lineHeight: "1.4",
            fontFamily: "var(--font-inter)",
            maxHeight: 160,
            overflowY: "auto",
            marginBottom: 3,
          }}
        />

        {/* Right tools */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0, marginBottom: 2 }}>
          {/* Microphone */}
          <button
            onClick={handleVoiceInput}
            title="Voice input"
            style={{
              background: isListening ? "rgba(239,68,68,0.15)" : "none",
              border: "none",
              cursor: "pointer",
              color: isListening ? "#ef4444" : "var(--text-primary)",
              padding: "0.5rem",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              if(!isListening) e.currentTarget.style.background = "var(--bg-hover)";
            }}
            onMouseLeave={(e) => {
              if(!isListening) e.currentTarget.style.background = "none";
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </button>

          {/* Voice Mode (Orange) or Send button */}
          {isStreaming ? (
            <button
              onClick={onStop}
              style={{
                background: "var(--text-primary)",
                border: "none",
                borderRadius: "50%",
                width: 36,
                height: 36,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--bg-primary)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2"/>
              </svg>
            </button>
          ) : input.trim() ? (
            <button
              onClick={handleSend}
              disabled={disabled}
              style={{
                background: "var(--text-primary)",
                border: "none",
                borderRadius: "50%",
                width: 36,
                height: 36,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--bg-primary)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="19" x2="12" y2="5"/>
                <polyline points="5 12 12 5 19 12"/>
              </svg>
            </button>
          ) : (
            <button
              title="Voice Conversation"
              style={{
                background: "#ea580c", // Orange
                border: "none",
                borderRadius: "50%",
                width: 36,
                height: 36,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
              </svg>
            </button>
          )}
        </div>
      </div>
      
      <p style={{ textAlign: "center", fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
        GptGen2 can make mistakes. Check important info.
      </p>
    </div>
  );
}
