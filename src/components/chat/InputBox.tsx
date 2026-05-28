"use client";

import { useRef, useEffect, useState, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "@/stores/chatStore";
import { MODELS, PERSONAS, PROMPT_TEMPLATES } from "@/lib/constants";

interface InputBoxProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export default function InputBox({ onSend, onStop, isStreaming, disabled }: InputBoxProps) {
  const [input, setInput] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { currentModel, currentPersona, setModel, setPersona } = useChatStore();

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

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

  const handleTemplateClick = (prompt: string) => {
    setInput(prompt);
    setShowTemplates(false);
    textareaRef.current?.focus();
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

  const currentPersonaObj = PERSONAS.find((p) => p.id === currentPersona);

  return (
    <div
      style={{
        padding: "0.75rem 1rem 1rem",
        borderTop: "1px solid var(--border)",
        background: "var(--bg-primary)",
      }}
    >
      {/* Prompt templates */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              marginBottom: "0.75rem",
            }}
          >
            {PROMPT_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateClick(template.prompt)}
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "0.375rem 0.75rem",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                <span>{template.icon}</span>
                {template.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main input container */}
      <div
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          overflow: "hidden",
          transition: "border-color 0.2s, box-shadow 0.2s",
          boxShadow: "var(--shadow-sm)",
        }}
        onFocusCapture={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px var(--accent-glow)";
        }}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
            (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)";
          }
        }}
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${currentPersonaObj?.name || "GptGen2"}...`}
          disabled={disabled}
          rows={1}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            outline: "none",
            padding: "0.875rem 1rem 0",
            fontSize: "0.925rem",
            color: "var(--text-primary)",
            resize: "none",
            lineHeight: "1.6",
            fontFamily: "var(--font-inter)",
            maxHeight: 160,
            overflowY: "auto",
          }}
        />

        {/* Bottom toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.5rem 0.75rem",
          }}
        >
          {/* Left tools */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            {/* Templates button */}
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              title="Prompt templates"
              style={{
                background: showTemplates ? "var(--accent-glow)" : "none",
                border: "none",
                cursor: "pointer",
                color: showTemplates ? "var(--accent)" : "var(--text-muted)",
                padding: "0.375rem",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <line x1="10" y1="9" x2="8" y2="9"/>
              </svg>
            </button>

            {/* Voice input */}
            <button
              onClick={handleVoiceInput}
              title="Voice input"
              style={{
                background: isListening ? "rgba(239,68,68,0.15)" : "none",
                border: "none",
                cursor: "pointer",
                color: isListening ? "#ef4444" : "var(--text-muted)",
                padding: "0.375rem",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </button>

            {/* Model selector */}
            <select
              value={currentModel}
              onChange={(e) => setModel(e.target.value)}
              style={{
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "0.25rem 0.5rem",
                fontSize: "0.75rem",
                color: "var(--text-secondary)",
                cursor: "pointer",
                outline: "none",
                maxWidth: 130,
              }}
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.isFree ? "🆓" : ""}
                </option>
              ))}
            </select>

            {/* Persona selector */}
            <select
              value={currentPersona}
              onChange={(e) => setPersona(e.target.value)}
              style={{
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "0.25rem 0.5rem",
                fontSize: "0.75rem",
                color: "var(--text-secondary)",
                cursor: "pointer",
                outline: "none",
                maxWidth: 120,
              }}
            >
              {PERSONAS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.icon} {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Right: char count + send/stop */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {input.length > 100 && (
              <span style={{ fontSize: "0.7rem", color: input.length > 4000 ? "#ef4444" : "var(--text-muted)" }}>
                {input.length}
              </span>
            )}

            {isStreaming ? (
              <button
                onClick={onStop}
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: 10,
                  padding: "0.375rem 0.75rem",
                  fontSize: "0.8rem",
                  color: "#ef4444",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  transition: "all 0.15s",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="2"/>
                </svg>
                Stop
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim() || disabled}
                style={{
                  background: input.trim() && !disabled
                    ? "linear-gradient(135deg, #6c63ff, #8b5cf6)"
                    : "var(--bg-tertiary)",
                  border: "none",
                  borderRadius: 10,
                  padding: "0.5rem",
                  width: 36,
                  height: 36,
                  cursor: input.trim() && !disabled ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: input.trim() && !disabled ? "white" : "var(--text-muted)",
                  transition: "all 0.2s",
                  transform: input.trim() ? "scale(1)" : "scale(0.95)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <p style={{ textAlign: "center", fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
        GptGen2 can make mistakes. Verify important info. Press Enter to send, Shift+Enter for newline.
      </p>
    </div>
  );
}
