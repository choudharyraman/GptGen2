import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      chats: {
        Row: {
          id: string;
          session_id: string;
          title: string;
          model: string;
          persona: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          title?: string;
          model?: string;
          persona?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          model?: string;
          persona?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          chat_id: string;
          role: "user" | "assistant" | "system";
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          role: "user" | "assistant" | "system";
          content: string;
          created_at?: string;
        };
      };
    };
  };
};
