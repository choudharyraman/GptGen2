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

  // Hover states for premium micro-interactions
  const [newChatHovered, setNewChatHovered] = useState(false);
  const [toggleHovered, setToggleHovered] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);

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

  // Menu items list matching the mockup image exactly
  const menuItems = [
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      ),
      label: "Search chats",
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="5" height="18" rx="1.5" />
          <rect x="9.5" y="3" width="5" height="18" rx="1.5" />
          <rect x="16" y="3" width="5" height="18" rx="1.5" />
        </svg>
      ),
      label: "Library",
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          <line x1="12" y1="11" x2="12" y2="17"/>
          <line x1="9" y1="14" x2="15" y2="14"/>
        </svg>
      ),
      label: "Projects",
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="7" cy="7" r="2.5" />
          <circle cx="17" cy="7" r="2.5" />
          <circle cx="7" cy="17" r="2.5" />
          <circle cx="17" cy="17" r="2.5" />
        </svg>
      ),
      label: "Apps",
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22a7 7 0 0 0 7-7c0-1.86-.73-3.55-1.92-4.8A5 5 0 0 0 12 2a5 5 0 0 0-5.08 8.2A7 7 0 0 0 5 15a7 7 0 0 0 7 7Z"/>
          <path d="M9 10l2 2-2 2"/>
          <line x1="12" y1="14" x2="14" y2="14"/>
        </svg>
      ),
      label: "Codex",
    },
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
              borderRight: "1px solid var(--border)",
            }}
          >
            {/* Header: ChatGPT logo (OpenAI spiral) + Panel Toggle Button */}
            <div
              style={{
                padding: "0.75rem 0.85rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: 52,
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
                {/* High-precision OpenAI Spiral Logo */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.35 11.12a4.94 4.94 0 0 0-.47-2.61c-.56-.99-1.5-1.76-2.63-2.14a4.96 4.96 0 0 0-2.31-.05 5.03 5.03 0 0 0-4-3.11c-.55-.09-1.12-.05-1.66.11a5.05 5.05 0 0 0-3.32 3.84 5 5 0 0 0-2.38 1.15c-.85.73-1.44 1.74-1.66 2.85A4.95 4.95 0 0 0 3.4 12.2a4.94 4.94 0 0 0 .47 2.61 5.03 5.03 0 0 0 2.63 2.14c.73.25 1.5.3 2.25.16a5.03 5.03 0 0 0 4.07 3c.55.09 1.12.05 1.66-.11a5.05 5.05 0 0 0 3.32-3.84 5 5 0 0 0 2.38-1.15c.85-.73 1.44-1.74 1.66-2.85a4.95 4.95 0 0 0-.49-1.04zm-8.49 8.65a3.63 3.63 0 0 1-1.72-.44l.09-.05 4.14-2.39a.74.74 0 0 0 .37-.64V10.1l2.12 1.22c.04.02.06.06.06.1v4.83a3.66 3.66 0 0 1-5.06 3.52zm-6.52-3.4a3.63 3.63 0 0 1-.36-1.74V9.8l.09.05 4.14 2.39a.74.74 0 0 0 .74 0l5.41-3.12V6.63L14.28 7.8c-.04.02-.08.02-.12 0l-4.18-2.42a3.65 3.65 0 0 1-1.3-4.99c.73-1.26 2.23-1.84 3.57-1.4a3.63 3.63 0 0 1 1.72.44l-.09.05L9.8 5.87a.74.74 0 0 0-.37.64v6.15L7.31 11.44a.09.09 0 0 1-.06-.1V6.51A3.66 3.66 0 0 1 12.31 3a3.66 3.66 0 0 1 1.3 4.99c-.73 1.26-2.23 1.84-3.57 1.4a3.63 3.63 0 0 1-.36 1.74v4.83l-.09-.05-4.14-2.39a.74.74 0 0 0-.74 0L4.81 16.64v2.49L6.93 17.9c.04-.02.08-.02.12 0l4.18 2.42a3.65 3.65 0 0 1 1.3 4.99c-.73 1.26-2.23 1.84-3.57 1.4a3.63 3.63 0 0 1-1.72-.44l.09-.05L11 20.31a.74.74 0 0 0 .37-.64v-6.15l2.12 1.22c.04.02.06.06.06.1v4.83a3.66 3.66 0 0 1-5.06 3.52c-.73-.25-1.34-.73-1.74-1.34zm-.54-6.38a3.63 3.63 0 0 1 2.08-3.06l.09.05 4.14 2.39a.74.74 0 0 0 .37.64v6.15l-2.12-1.22a.09.09 0 0 1-.06-.1v-4.83a3.66 3.66 0 0 1 5.06-3.52 3.66 3.66 0 0 1 1.74 1.34 3.63 3.63 0 0 1 .36 1.74v4.83l-.09-.05-4.14-2.39a.74.74 0 0 0-.74 0l-5.41 3.12v2.49l2.12-1.22c.04-.02.08-.02.12 0l4.18 2.42a3.65 3.65 0 0 1-2.27 3.59c-.55.16-1.12.18-1.66.05A3.66 3.66 0 0 1 8.8 18.6a3.66 3.66 0 0 1-1.3-4.99c.73-1.26 2.23-1.84 3.57-1.4z"/>
                </svg>
              </div>

              <div style={{ display: "flex", gap: "0.25rem" }}>
                <button
                  onClick={toggleSidebar}
                  onMouseEnter={() => setToggleHovered(true)}
                  onMouseLeave={() => setToggleHovered(false)}
                  style={{
                    background: toggleHovered ? "var(--bg-hover)" : "none",
                    border: "none",
                    color: toggleHovered ? "var(--text-primary)" : "var(--text-secondary)",
                    cursor: "pointer",
                    padding: "0.4rem",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background-color 0.15s ease, color 0.15s ease",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="9" y1="3" x2="9" y2="21"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Scrollable container for menu and chats */}
            <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem 0.75rem", display: "flex", flexDirection: "column" }}>
              
              {/* Premium New Chat Button */}
              <button
                onClick={handleNewChat}
                onMouseEnter={() => setNewChatHovered(true)}
                onMouseLeave={() => setNewChatHovered(false)}
                style={{
                  width: "100%",
                  background: newChatHovered ? "var(--bg-tertiary)" : "var(--bg-hover)",
                  border: "none",
                  borderRadius: 12,
                  padding: "0.6rem 0.9rem",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  marginBottom: "1rem",
                  transition: "background-color 0.15s ease",
                  fontFamily: "var(--font-inter)",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.375 2.625a2.122 2.122 0 1 1 3 3L12 15l-4 1 1-4Z"/>
                  </svg>
                  New chat
                </span>
              </button>

              {/* Static Menu Matching Figure */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "1.25rem" }}>
                {menuItems.map((item, i) => {
                  const isHovered = hoveredIdx === i;
                  return (
                    <button
                      key={i}
                      onMouseEnter={() => setHoveredIdx(i)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      style={{
                        width: "100%",
                        background: isHovered ? "var(--bg-hover)" : "none",
                        border: "none",
                        borderRadius: 8,
                        padding: "0.55rem 0.75rem",
                        color: "var(--text-primary)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        fontSize: "0.875rem",
                        textAlign: "left",
                        transition: "background-color 0.15s ease, color 0.15s ease",
                        fontFamily: "var(--font-inter)",
                      }}
                    >
                      <span 
                        style={{ 
                          width: 18, 
                          height: 18, 
                          display: "flex", 
                          justifyContent: "center", 
                          alignItems: "center", 
                          color: isHovered ? "var(--text-primary)" : "var(--text-secondary)",
                          transition: "color 0.15s ease",
                        }}
                      >
                        {item.icon}
                      </span>
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Separation and Recent Chats */}
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <div 
                  style={{ 
                    fontSize: "0.75rem", 
                    fontWeight: 500, 
                    color: "var(--text-muted)", 
                    padding: "0.5rem 0.75rem 0.35rem", 
                    textTransform: "uppercase", 
                    letterSpacing: "0.05em",
                    borderTop: "1px solid var(--border)",
                    paddingTop: "1rem",
                    marginTop: "0.25rem",
                  }}
                >
                  Recent Chats
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  {chats.length === 0 ? (
                    <div style={{ padding: "0.5rem 0.75rem", color: "var(--text-muted)", fontSize: "0.85rem", fontStyle: "italic" }}>
                      No recent chats
                    </div>
                  ) : (
                    chats.map((chat) => {
                      const isSelected = currentChatId === chat.id;
                      const isHovered = hoveredChatId === chat.id;
                      
                      return (
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
                                padding: "0.55rem 0.75rem",
                                fontSize: "0.875rem",
                                color: "var(--text-primary)",
                                outline: "none",
                                margin: "1px 0",
                              }}
                            />
                          ) : (
                            <button
                              onClick={() => selectChat(chat.id)}
                              onContextMenu={(e) => handleContextMenu(e, chat.id)}
                              onMouseEnter={() => setHoveredChatId(chat.id)}
                              onMouseLeave={() => setHoveredChatId(null)}
                              style={{
                                width: "100%",
                                background: isSelected ? "var(--bg-hover)" : isHovered ? "rgba(255,255,255,0.05)" : "transparent",
                                border: "none",
                                borderRadius: 8,
                                padding: "0.55rem 0.75rem",
                                textAlign: "left",
                                cursor: "pointer",
                                color: isSelected || isHovered ? "var(--text-primary)" : "var(--text-secondary)",
                                fontSize: "0.875rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                marginBottom: "2px",
                                transition: "background-color 0.15s ease, color 0.15s ease",
                                fontFamily: "var(--font-inter)",
                              }}
                            >
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>
                                {chat.title || "New Chat"}
                              </span>
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Profile Footer */}
            <div
              style={{
                padding: "0.6rem 0.8rem",
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                cursor: "pointer",
                borderRadius: 12,
                margin: "0.5rem",
                transition: "background-color 0.15s ease",
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
