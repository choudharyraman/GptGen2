import { v4 as uuidv4 } from "uuid";

export function generateId(): string {
  return uuidv4();
}

export function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  let sessionId = localStorage.getItem("gptgen2_session_id");
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem("gptgen2_session_id", sessionId);
  }
  return sessionId;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function generateChatTitle(firstMessage: string): string {
  const cleaned = firstMessage.trim().replace(/\s+/g, " ");
  if (!cleaned) return "New Chat";
  
  const words = cleaned.split(" ");
  if (words.length <= 5) {
    return cleaned;
  }
  
  return words.slice(0, 5).join(" ") + "...";
}

export function downloadAsMarkdown(title: string, content: string): void {
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]/gi, "_")}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(" ");
};
