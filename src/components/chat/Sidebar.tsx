"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChats } from "@/hooks/useChats";
import { useChatStore } from "@/stores/chatStore";
import { formatDate, truncate } from "@/lib/utils";
import { toast } from "sonner";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function Sidebar() {
  const { chats, currentChatId, createNewChat, renameChat, removeChat, selectChat, exportChat } =
    useChats();
  const { sidebarOpen, toggleSidebar } = useChatStore();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [contextMenu, setContextMenu] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);

  const handleNewChat = async () => {
    await createNewChat();
  };

  const handleRenameStart = (id: string, title: string) => {
    setRenamingId(id);
    setRenameValue(title);
    setContextMenu(null);
  };

  const handleRenameSubmit = async (id: string) => {
    if (renameValue.trim()) {
      await renameChat(id, renameValue.trim());
      toast.success("Chat renamed!");
    }
    setRenamingId(null);
  };

  const handleDelete = async (id: string) => {
    await removeChat(id);
    setContextMenu(null);
    toast.success("Chat deleted");
  };

  const handleExport = (id: string) => {
    exportChat(id);
    setContextMenu(null);
    toast.success("Chat exported as Markdown!");
  };

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setContextMenu({ id, x: e.clientX, y: e.clientY });
  };

  const menuItems = [
    { icon: "🔍", label: "Search chats" },
    { icon: "📁", label: "Projects" },
    { icon: "📚", label: "Library" },
    { icon: "⊞", label: "Apps" },
    { icon: "💻", label: "Codex" },
    { icon: "•••", label: "More" },
  ];

  const gpts = [
    { icon: "📊", label: "Slide Maker: PowerPoints, Pr...", color: "#ef4444" },
    { icon: "🎬", label: "AI Video Generator - VideoG...", color: "#84cc16" },
    { icon: "🧩", label: "Explore GPTs", color: "transparent" },
  ];

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              width: 260,
              minWidth: 260,
              background: "var(--bg-secondary)",
              display: "flex",
              flexDirection: "column",
              height: "100vh",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "0.75rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  color: "var(--text-primary)",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>

              <div style={{ display: "flex", gap: "0.25rem" }}>
                <button
                  onClick={toggleSidebar}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    padding: "0.25rem",
                    borderRadius: 6,
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="9" y1="3" x2="9" y2="21"/>
                  </svg>
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "0 0.75rem" }}>
              {/* New Chat */}
              <button
                onClick={handleNewChat}
                style={{
                  width: "100%",
                  background: "var(--bg-tertiary)",
                  border: "none",
                  borderRadius: 8,
                  padding: "0.5rem 0.75rem",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.85rem",
                  marginBottom: "1rem",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  New chat
                </span>
              </button>

              {/* Static Menu */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "1.5rem" }}>
                {menuItems.map((item, i) => (
                  <button
                    key={i}
                    style={{
                      width: "100%",
                      background: "none",
                      border: "none",
                      borderRadius: 8,
                      padding: "0.5rem 0.75rem",
                      color: "var(--text-primary)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.85rem",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--bg-hover)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "none";
                    }}
                  >
                    <span style={{ width: 16, display: "flex", justifyContent: "center" }}>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>

              {/* GPTs Section */}
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", padding: "0 0.75rem", marginBottom: "0.5rem" }}>
                  GPTs
                </div>
                {gpts.map((gpt, i) => (
                  <button
                    key={i}
                    style={{
                      width: "100%",
                      background: "none",
                      border: "none",
                      borderRadius: 8,
                      padding: "0.5rem 0.75rem",
                      color: "var(--text-primary)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.85rem",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--bg-hover)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "none";
                    }}
                  >
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: gpt.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px" }}>
                      {gpt.icon}
                    </div>
                    {gpt.label}
                  </button>
                ))}
              </div>

              {/* Recents */}
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", padding: "0 0.75rem", marginBottom: "0.5rem" }}>
                  Recents
                </div>
                {chats.length === 0 ? (
                  <div style={{ padding: "0.5rem 0.75rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    No recent chats
                  </div>
                ) : (
                  chats.map((chat) => (
                    <div key={chat.id}>
                      {renamingId === chat.id ? (
                        <input
                          autoFocus
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={() => handleRenameSubmit(chat.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRenameSubmit(chat.id);
                            if (e.key === "Escape") setRenamingId(null);
                          }}
                          style={{
                            width: "100%",
                            background: "var(--bg-hover)",
                            border: "none",
                            borderRadius: 8,
                            padding: "0.5rem 0.75rem",
                            fontSize: "0.85rem",
                            color: "var(--text-primary)",
                            outline: "none",
                            margin: "1px 0",
                          }}
                        />
                      ) : (
                        <button
                          onClick={() => selectChat(chat.id)}
                          onContextMenu={(e) => handleContextMenu(e, chat.id)}
                          style={{
                            width: "100%",
                            background: currentChatId === chat.id ? "var(--bg-hover)" : "transparent",
                            border: "none",
                            borderRadius: 8,
                            padding: "0.5rem 0.75rem",
                            textAlign: "left",
                            cursor: "pointer",
                            color: "var(--text-primary)",
                            fontSize: "0.85rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            marginBottom: "2px",
                          }}
                          onMouseEnter={(e) => {
                            if (currentChatId !== chat.id) e.currentTarget.style.background = "var(--bg-hover)";
                          }}
                          onMouseLeave={(e) => {
                            if (currentChatId !== chat.id) e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {chat.title || "New Chat"}
                          </span>
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Profile Footer */}
            <div
              style={{
                padding: "0.75rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
                borderRadius: 8,
                margin: "0.5rem",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--bg-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #f59e0b, #ea580c)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  overflow: "hidden"
                }}
              >
                {/* Simulated Avatar image via emoji for simplicity */}
                👱‍♂️
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  Test User
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                  Go
                </div>
              </div>
              <ThemeToggle />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Context menu */}
      <AnimatePresence>
        {contextMenu && (
          <>
            <div
              style={{ position: "fixed", inset: 0, zIndex: 99 }}
              onClick={() => setContextMenu(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                position: "fixed",
                left: contextMenu.x,
                top: contextMenu.y,
                zIndex: 100,
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "0.375rem",
                boxShadow: "var(--shadow-lg)",
                minWidth: 160,
              }}
            >
              {[
                { icon: "✏️", label: "Rename", action: () => {
                    const chat = chats.find((c) => c.id === contextMenu.id);
                    if (chat) handleRenameStart(contextMenu.id, chat.title);
                  }
                },
                { icon: "📥", label: "Export", action: () => handleExport(contextMenu.id) },
                { icon: "🗑️", label: "Delete", action: () => handleDelete(contextMenu.id), danger: true },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  style={{
                    width: "100%",
                    background: "none",
                    border: "none",
                    borderRadius: 7,
                    padding: "0.5rem 0.75rem",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.85rem",
                    color: item.danger ? "#ef4444" : "var(--text-primary)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = item.danger ? "rgba(239,68,68,0.1)" : "var(--bg-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "none";
                  }}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
