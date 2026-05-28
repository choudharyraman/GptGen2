import type { Metadata } from "next";
import ChatLayout from "@/components/chat/ChatLayout";

export const metadata: Metadata = {
  title: "Chat — GptGen2",
  description: "Chat with your AI assistant powered by Google Gemma",
};

export default function ChatPage() {
  return <ChatLayout />;
}
