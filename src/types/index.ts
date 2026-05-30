export interface Message {
  id: string;
  chat_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
  sources?: Array<{ name: string; content?: string }>;
  thinkingDuration?: number;
}

export interface Chat {
  id: string;
  session_id: string;
  title: string;
  model: string;
  persona: string;
  created_at: string;
  updated_at: string;
  messages?: Message[];
}

export interface Persona {
  id: string;
  name: string;
  icon: string;
  description: string;
  systemPrompt: string;
}

export interface Model {
  id: string;
  name: string;
  provider: string;
  description?: string;
  isFree?: boolean;
  providerId?: string;
}

export interface PromptTemplate {
  id: string;
  label: string;
  icon: string;
  prompt: string;
}

export type Theme = "light" | "dark" | "system";
