import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Chat, Message, Persona, Model } from "@/types";
import { DEFAULT_MODEL, DEFAULT_PERSONA } from "@/lib/constants";

interface ChatStore {
  // State
  chats: Chat[];
  currentChatId: string | null;
  messages: Record<string, Message[]>;
  isStreaming: boolean;
  currentModel: string;
  currentPersona: string;
  sidebarOpen: boolean;
  _hasHydrated: boolean;

  // Chat actions
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  updateChat: (id: string, updates: Partial<Chat>) => void;
  deleteChat: (id: string) => void;
  setCurrentChatId: (id: string | null) => void;

  // Message actions
  setMessages: (chatId: string, messages: Message[]) => void;
  addMessage: (chatId: string, message: Message) => void;
  updateLastMessage: (
    chatId: string,
    content: string,
    sources?: Array<{ name: string; content?: string }>,
    thinkingDuration?: number
  ) => void;
  clearMessages: (chatId: string) => void;

  // UI actions
  setStreaming: (streaming: boolean) => void;
  setModel: (model: string) => void;
  setPersona: (persona: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      currentChatId: null,
      messages: {},
      isStreaming: false,
      currentModel: DEFAULT_MODEL,
      currentPersona: DEFAULT_PERSONA,
      sidebarOpen: true,
      _hasHydrated: false,

      setChats: (chats) => set({ chats }),
      addChat: (chat) =>
        set((state) => ({ chats: [chat, ...state.chats] })),
      updateChat: (id, updates) =>
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
      deleteChat: (id) =>
        set((state) => {
          const newMessages = { ...state.messages };
          delete newMessages[id];
          return {
            chats: state.chats.filter((c) => c.id !== id),
            messages: newMessages,
            currentChatId:
              state.currentChatId === id ? null : state.currentChatId,
          };
        }),
      setCurrentChatId: (id) => set({ currentChatId: id }),

      setMessages: (chatId, messages) =>
        set((state) => ({
          messages: { ...state.messages, [chatId]: messages },
        })),
      addMessage: (chatId, message) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [chatId]: [...(state.messages[chatId] || []), message],
          },
        })),
      updateLastMessage: (chatId, content, sources, thinkingDuration) =>
        set((state) => {
          const msgs = state.messages[chatId] || [];
          if (msgs.length === 0) return state;
          const updated = [...msgs];
          const lastMsg = updated[updated.length - 1];
          updated[updated.length - 1] = {
            ...lastMsg,
            content,
            sources: sources !== undefined ? sources : lastMsg.sources,
            thinkingDuration: thinkingDuration !== undefined ? thinkingDuration : lastMsg.thinkingDuration,
          };
          return { messages: { ...state.messages, [chatId]: updated } };
        }),
      clearMessages: (chatId) =>
        set((state) => ({
          messages: { ...state.messages, [chatId]: [] },
        })),

      setStreaming: (streaming) => set({ isStreaming: streaming }),
      setModel: (model) => set({ currentModel: model }),
      setPersona: (persona) => set({ currentPersona: persona }),
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "gptgen2-store",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        chats: state.chats,
        currentChatId: state.currentChatId,
        messages: state.messages,
        currentModel: state.currentModel,
        currentPersona: state.currentPersona,
      }),
    }
  )
);
