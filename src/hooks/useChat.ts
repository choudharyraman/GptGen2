"use client";

import { useCallback, useRef } from "react";
import { useChatStore } from "@/stores/chatStore";
import { Message } from "@/types";
import { generateId, generateChatTitle } from "@/lib/utils";
import { PERSONAS } from "@/lib/constants";
import { supabase } from "@/lib/supabase";

export function useChat() {
  const {
    currentChatId,
    messages,
    isStreaming,
    currentModel,
    currentPersona,
    chats,
    addMessage,
    updateLastMessage,
    updateChat,
    setStreaming,
    setCurrentChatId,
    addChat,
  } = useChatStore();

  const abortControllerRef = useRef<AbortController | null>(null);

  const currentMessages = currentChatId ? messages[currentChatId] || [] : [];

  const sendMessage = useCallback(
    async (content: string) => {
      if (!currentChatId || isStreaming || !content.trim()) return;

      const persona = PERSONAS.find((p) => p.id === currentPersona);

      // Determine if this is the first message before adding the user message to store
      const existingMessages = messages[currentChatId] || [];
      const isFirstMessage = existingMessages.length === 0;

      // Add user message
      const userMsg: Message = {
        id: generateId(),
        chat_id: currentChatId,
        role: "user",
        content: content.trim(),
        created_at: new Date().toISOString(),
      };
      addMessage(currentChatId, userMsg);

      // Save user message to Supabase
      supabase.from("messages").insert({
        id: userMsg.id,
        chat_id: userMsg.chat_id,
        role: userMsg.role,
        content: userMsg.content,
      }).then(() => {});

      // Update chat title if it's the first message
      if (isFirstMessage) {
        const title = generateChatTitle(content);
        updateChat(currentChatId, { title, updated_at: new Date().toISOString() });
        supabase
          .from("chats")
          .update({ title, updated_at: new Date().toISOString() })
          .eq("id", currentChatId)
          .then(() => {});
      }

      // Add placeholder assistant message
      const assistantMsg: Message = {
        id: generateId(),
        chat_id: currentChatId,
        role: "assistant",
        content: "",
        created_at: new Date().toISOString(),
      };
      addMessage(currentChatId, assistantMsg);
      setStreaming(true);

      // Build messages for API
      const allMessages = [...(messages[currentChatId] || []), userMsg];
      const apiMessages = [
        ...(persona ? [{ role: "system", content: persona.systemPrompt }] : []),
        ...allMessages
          .filter((m) => m.role !== "system")
          .map((m) => ({ role: m.role, content: m.content })),
      ];

      try {
        abortControllerRef.current = new AbortController();

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: apiMessages,
            model: currentModel,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to get response");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") break;
                try {
                  const parsed = JSON.parse(data);
                  const delta = parsed.choices?.[0]?.delta?.content || "";
                  if (delta) {
                    fullContent += delta;
                    updateLastMessage(currentChatId, fullContent);
                  }
                } catch {
                  // Skip invalid JSON chunks
                }
              }
            }
          }
        }

        // Save assistant message to Supabase
        supabase.from("messages").insert({
          id: assistantMsg.id,
          chat_id: assistantMsg.chat_id,
          role: "assistant",
          content: fullContent,
        }).then(() => {});

        // Update chat's updated_at
        supabase
          .from("chats")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", currentChatId)
          .then(() => {});

      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
          // User stopped generation - that's fine
        } else {
          updateLastMessage(
            currentChatId,
            "⚠️ Sorry, I encountered an error. Please try again."
          );
        }
      } finally {
        setStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [currentChatId, isStreaming, currentModel, currentPersona, messages, addMessage, updateLastMessage, updateChat, setStreaming]
  );

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    messages: currentMessages,
    isStreaming,
    sendMessage,
    stopGeneration,
  };
}
