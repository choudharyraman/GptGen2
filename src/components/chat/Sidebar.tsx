"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChats } from "@/hooks/useChats";
import { useChatStore } from "@/stores/chatStore";
import { formatDate, truncate } from "@/lib/utils";
import { toast } from "sonner";

export default function Sidebar() {
  const { chats, currentChatId, createNewChat, renameChat, removeChat, selectChat, exportChat } =
    useChats();
  const { sidebarOpen } = useChatStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [contextMenu, setContextMenu] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);

  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewChat = async () => {
    await createNewChat();
    toast.success("New chat created!");
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

  // Group chats by time
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const todayChats = filteredChats.filter((c) => new Date(c.created_at) >= today);
  const yesterdayChats = filteredChats.filter(
    (c) => new Date(c.created_at) >= yesterday && new Date(c.created_at) < today
  );
  const olderChats = filteredChats.filter((c) => new Date(c.created_at) < yesterday);

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
              width: 280,
              minWidth: 280,
              background: "var(--bg-secondary)",
              borderRight: "1px solid var(--border)",
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
                padding: "1rem",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {/* Logo */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: "linear-gradient(135deg, #6c63ff, #8b5cf6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem",
                  }}
                >
                  ✨
                </div>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "1rem",
                    background: "linear-gradient(135deg, #6c63ff, #8b5cf6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  GptGen2
                </span>
              </div>

              {/* New Chat button */}
              <button
                onClick={handleNewChat}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #6c63ff, #8b5cf6)",
                  border: "none",
                  borderRadius: 10,
                  padding: "0.625rem 1rem",
                  color: "white",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.9rem",
                  transition: "all 0.2s",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.9";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(108,99,255,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New Chat
              </button>
            </div>

            {/* Search */}
            <div style={{ padding: "0.75rem 1rem 0.5rem" }}>
              <div style={{ position: "relative" }}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{
                    position: "absolute",
                    left: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                    pointerEvents: "none",
                  }}
                >
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    background: "var(--bg-tertiary)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "0.5rem 0.75rem 0.5rem 2.25rem",
                    fontSize: "0.85rem",
                    color: "var(--text-primary)",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Chat list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "0.25rem 0.5rem" }}>
              {filteredChats.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "2rem 1rem",
                    color: "var(--text-muted)",
                    fontSize: "0.85rem",
                  }}
                >
                  {searchQuery ? "No chats found" : "No chats yet"}
                </div>
              ) : (
                <>
                  <ChatGroup label="Today" chats={todayChats} currentChatId={currentChatId} onSelect={selectChat} onContextMenu={handleContextMenu} renamingId={renamingId} renameValue={renameValue} onRenameChange={setRenameValue} onRenameSubmit={handleRenameSubmit} />
                  <ChatGroup label="Yesterday" chats={yesterdayChats} currentChatId={currentChatId} onSelect={selectChat} onContextMenu={handleContextMenu} renamingId={renamingId} renameValue={renameValue} onRenameChange={setRenameValue} onRenameSubmit={handleRenameSubmit} />
                  <ChatGroup label="Older" chats={olderChats} currentChatId={currentChatId} onSelect={selectChat} onContextMenu={handleContextMenu} renamingId={renamingId} renameValue={renameValue} onRenameChange={setRenameValue} onRenameSubmit={handleRenameSubmit} />
                </>
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "0.75rem 1rem",
                borderTop: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.8rem",
                color: "var(--text-muted)",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #6c63ff, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "white",
                }}
              >
                G2
              </div>
              <div>
                <div style={{ fontWeight: 600, color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                  GptGen2 User
                </div>
                <div style={{ fontSize: "0.7rem" }}>Guest Mode</div>
              </div>
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
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "0.375rem",
                boxShadow: "var(--shadow-lg)",
                minWidth: 160,
              }}
            >
              {[
                {
                  icon: "✏️",
                  label: "Rename",
                  action: () => {
                    const chat = chats.find((c) => c.id === contextMenu.id);
                    if (chat) handleRenameStart(contextMenu.id, chat.title);
                  },
                },
                {
                  icon: "📥",
                  label: "Export",
                  action: () => handleExport(contextMenu.id),
                },
                {
                  icon: "🗑️",
                  label: "Delete",
                  action: () => handleDelete(contextMenu.id),
                  danger: true,
                },
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
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = item.danger
                      ? "rgba(239,68,68,0.1)"
                      : "var(--bg-hover)";
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

function ChatGroup({
  label,
  chats,
  currentChatId,
  onSelect,
  onContextMenu,
  renamingId,
  renameValue,
  onRenameChange,
  onRenameSubmit,
}: {
  label: string;
  chats: {id: string; title: string; updated_at: string}[];
  currentChatId: string | null;
  onSelect: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
  renamingId: string | null;
  renameValue: string;
  onRenameChange: (v: string) => void;
  onRenameSubmit: (id: string) => void;
}) {
  if (chats.length === 0) return null;

  return (
    <div style={{ marginBottom: "0.5rem" }}>
      <div
        style={{
          fontSize: "0.7rem",
          fontWeight: 600,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          padding: "0.5rem 0.5rem 0.25rem",
        }}
      >
        {label}
      </div>
      {chats.map((chat) => (
        <div key={chat.id}>
          {renamingId === chat.id ? (
            <input
              autoFocus
              value={renameValue}
              onChange={(e) => onRenameChange(e.target.value)}
              onBlur={() => onRenameSubmit(chat.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onRenameSubmit(chat.id);
                if (e.key === "Escape") onRenameChange("");
              }}
              style={{
                width: "100%",
                background: "var(--bg-tertiary)",
                border: "1px solid var(--accent)",
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
              onClick={() => onSelect(chat.id)}
              onContextMenu={(e) => onContextMenu(e, chat.id)}
              style={{
                width: "100%",
                background:
                  currentChatId === chat.id ? "var(--accent-glow)" : "transparent",
                border: `1px solid ${currentChatId === chat.id ? "var(--accent)" : "transparent"}`,
                borderRadius: 8,
                padding: "0.5rem 0.75rem",
                textAlign: "left",
                cursor: "pointer",
                color:
                  currentChatId === chat.id
                    ? "var(--text-primary)"
                    : "var(--text-secondary)",
                fontSize: "0.85rem",
                transition: "all 0.15s",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                marginBottom: "2px",
              }}
              onMouseEnter={(e) => {
                if (currentChatId !== chat.id) {
                  e.currentTarget.style.background = "var(--bg-hover)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (currentChatId !== chat.id) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }
              }}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: currentChatId === chat.id ? 500 : 400 }}>
                {truncate(chat.title, 30)}
              </span>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                {formatDate(chat.updated_at)}
              </span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
