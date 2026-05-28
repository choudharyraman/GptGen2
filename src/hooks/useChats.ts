"use client";

import { useCallback } from "react";
import { useChatStore } from "@/stores/chatStore";
import { Chat } from "@/types";
import { generateId, getSessionId } from "@/lib/utils";
import { DEFAULT_MODEL, DEFAULT_PERSONA } from "@/lib/constants";
import { supabase } from "@/lib/supabase";

export function useChats() {
  const {
    chats,
    currentChatId,
    currentModel,
    currentPersona,
    addChat,
    updateChat,
    deleteChat,
    setCurrentChatId,
    setMessages,
    messages,
  } = useChatStore();

  const createNewChat = useCallback(async () => {
    const sessionId = getSessionId();
    const newChat: Chat = {
      id: generateId(),
      session_id: sessionId,
      title: "New Chat",
      model: currentModel,
      persona: currentPersona,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addChat(newChat);
    setCurrentChatId(newChat.id);
    setMessages(newChat.id, []);

    // Persist to Supabase
    supabase
      .from("chats")
      .insert({
        id: newChat.id,
        session_id: newChat.session_id,
        title: newChat.title,
        model: newChat.model,
        persona: newChat.persona,
      })
      .then(() => {});

    return newChat.id;
  }, [currentModel, currentPersona, addChat, setCurrentChatId, setMessages]);

  const renameChat = useCallback(
    async (id: string, title: string) => {
      updateChat(id, { title });
      supabase
        .from("chats")
        .update({ title })
        .eq("id", id)
        .then(() => {});
    },
    [updateChat]
  );

  const removechat = useCallback(
    async (id: string) => {
      deleteChat(id);
      supabase.from("chats").delete().eq("id", id).then(() => {});
    },
    [deleteChat]
  );

  const selectChat = useCallback(
    (id: string) => {
      setCurrentChatId(id);
    },
    [setCurrentChatId]
  );

  const exportChat = useCallback(
    (id: string) => {
      const chat = chats.find((c) => c.id === id);
      const chatMessages = messages[id] || [];
      if (!chat) return;

      let md = `# ${chat.title}\n\n`;
      md += `*Exported from GptGen2 on ${new Date().toLocaleDateString()}*\n\n---\n\n`;
      chatMessages.forEach((msg) => {
        const role = msg.role === "user" ? "**You**" : "**GptGen2**";
        md += `${role}:\n\n${msg.content}\n\n---\n\n`;
      });

      const blob = new Blob([md], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${chat.title.replace(/[^a-z0-9]/gi, "_")}.md`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [chats, messages]
  );

  return {
    chats,
    currentChatId,
    createNewChat,
    renameChat,
    removeChat: removechat,
    selectChat,
    exportChat,
  };
}
