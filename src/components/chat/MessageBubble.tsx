"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Message } from "@/types";
import { formatDate, copyToClipboard } from "@/lib/utils";
import MarkdownRenderer from "./MarkdownRenderer";
import { toast } from "sonner";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export default function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isEmpty = !message.content && isStreaming;

  const handleCopy = async () => {
    await copyToClipboard(message.content);
    toast.success("Copied to clipboard!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex gap-3 group px-4 py-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-1">
        {isUser ? (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6c63ff, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "white",
              flexShrink: 0,
            }}
          >
            U
          </div>
        ) : (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1a1a2e, #2d2d44)",
              border: "1px solid rgba(108,99,255,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
              flexShrink: 0,
            }}
          >
            ✨
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className={`flex flex-col gap-1 max-w-[85%] ${isUser ? "items-end" : "items-start"}`}
      >
        <div
          style={{
            background: isUser ? "linear-gradient(135deg, #6c63ff, #8b5cf6)" : "var(--ai-bubble)",
            color: isUser ? "white" : "var(--text-primary)",
            borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
            padding: "0.75rem 1rem",
            border: isUser ? "none" : "1px solid var(--border)",
            fontSize: "0.925rem",
            lineHeight: "1.65",
            wordBreak: "break-word",
          }}
        >
          {isEmpty ? (
            <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "0.25rem 0" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", animation: "blink 1.2s 0s infinite" }} />
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", animation: "blink 1.2s 0.2s infinite" }} />
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", animation: "blink 1.2s 0.4s infinite" }} />
            </div>
          ) : isUser ? (
            <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{message.content}</p>
          ) : (
            <MarkdownRenderer content={message.content} isStreaming={isStreaming} />
          )}
        </div>

        {/* Actions row */}
        <div
          className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
        >
          <span>{formatDate(message.created_at)}</span>
          {message.content && (
            <button
              onClick={handleCopy}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                gap: 3,
                padding: "2px 6px",
                borderRadius: 4,
                fontSize: "0.75rem",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              Copy
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
