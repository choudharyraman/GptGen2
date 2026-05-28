# GptGen2 — AI Chat Assistant

A production-quality ChatGPT-style AI chat application built for portfolio showcase.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## ✨ Features

- **Streaming AI Responses** — Real-time token streaming via OpenRouter
- **5 AI Personas** — Default, Product Manager, Engineer, Teacher, Security Expert
- **4 Free AI Models** — Google Gemma, Llama 4, Mistral 7B, DeepSeek R1
- **Prompt Templates** — Quick-start templates for common tasks
- **Markdown + Code Highlighting** — Full GFM with syntax-highlighted code blocks
- **Chat History** — Persistent storage via Supabase + localStorage
- **Rename/Delete/Export Chats** — Full CRUD with markdown export
- **Voice Input** — Browser Web Speech API
- **Dark/Light Mode** — System-aware with localStorage persistence
- **Keyboard Shortcuts** — Ctrl+K (new chat), Ctrl+/ (toggle sidebar)
- **Responsive Design** — Desktop, tablet, mobile

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Custom CSS |
| Animations | Framer Motion |
| State | Zustand (with localStorage persistence) |
| AI | OpenRouter API |
| Database | Supabase |
| Markdown | react-markdown + react-syntax-highlighter |
| Icons | SVG inline |

## 📁 Project Structure

```
src/
├── app/
│   ├── api/chat/route.ts    # AI streaming endpoint
│   ├── chat/page.tsx        # Chat page
│   ├── page.tsx             # Landing page
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Design system
├── components/
│   ├── chat/
│   │   ├── ChatLayout.tsx   # Main layout
│   │   ├── Sidebar.tsx      # Chat history sidebar
│   │   ├── ChatWindow.tsx   # Messages area
│   │   ├── MessageBubble.tsx
│   │   ├── InputBox.tsx     # Input with tools
│   │   └── MarkdownRenderer.tsx
│   └── ui/
│       └── ThemeToggle.tsx
├── hooks/
│   ├── useChat.ts           # Streaming logic
│   └── useChats.ts          # Chat management
├── lib/
│   ├── constants.ts         # Personas, models, templates
│   ├── supabase.ts          # DB client
│   └── utils.ts             # Helpers
├── stores/
│   └── chatStore.ts         # Zustand store
└── types/
    └── index.ts             # TypeScript types
```

## 🌍 Environment Variables

```env
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_DEFAULT_MODEL=google/gemma-4-26b-a4b-it:free
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_APP_NAME=GptGen2
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🚢 Deploy to Vercel

1. Push to GitHub
2. Connect repo at [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

## 🎯 AI Models Available (All Free via OpenRouter)

| Model | Provider | Best For |
|---|---|---|
| Gemma 4 26B | Google | General purpose |
| Llama 4 Maverick | Meta | Complex reasoning |
| Mistral 7B | Mistral AI | Fast responses |
| DeepSeek R1 | DeepSeek | Technical problems |

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+K` | New chat |
| `Ctrl+/` | Toggle sidebar |
| `Enter` | Send message |
| `Shift+Enter` | New line in message |
| Right-click chat | Rename/Delete/Export |

---

Built with ❤️ as a portfolio showcase | Powered by OpenRouter + Supabase
