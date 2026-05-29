import type { Metadata } from "next";
import ChatLayout from "@/components/chat/ChatLayout";

export const metadata: Metadata = {
  title: "ChatGPT Clone",
  description: "A clone of the ChatGPT interface",
};

export default function RootPage() {
  return <ChatLayout />;
}
