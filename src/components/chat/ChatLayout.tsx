"use client";

import { useEffect } from "react";
import Sidebar from "@/components/chat/Sidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import { useChatStore } from "@/stores/chatStore";
import { useChats } from "@/hooks/useChats";

export default function ChatLayout() {
  const { toggleSidebar } = useChatStore();
  const { currentChatId, createNewChat } = useChats();

  // Create initial chat if none exists
  useEffect(() => {
    if (!currentChatId) {
      createNewChat();
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        createNewChat();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [createNewChat, toggleSidebar]);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        background: "var(--bg-primary)",
      }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        {/* Chat content */}
        <ChatWindow />
      </div>
    </div>
  );
}
