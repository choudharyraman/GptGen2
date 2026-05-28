import { Persona, Model, PromptTemplate } from "@/types";

export const PERSONAS: Persona[] = [
  {
    id: "default",
    name: "GptGen2 AI",
    icon: "✨",
    description: "Balanced and helpful assistant",
    systemPrompt:
      "You are GptGen2, a helpful, harmless, and honest AI assistant. You provide clear, accurate, and thoughtful responses. Format your responses using markdown when appropriate.",
  },
  {
    id: "pm",
    name: "Product Manager",
    icon: "📊",
    description: "Strategic product thinking",
    systemPrompt:
      "You are an expert Product Manager with 10+ years of experience at top tech companies. You think in terms of user needs, business value, and technical feasibility. Use frameworks like RICE, OKRs, user stories, and PRDs. Format your responses with clear structure using markdown.",
  },
  {
    id: "engineer",
    name: "Software Engineer",
    icon: "💻",
    description: "Code-first technical expert",
    systemPrompt:
      "You are a senior full-stack software engineer with expertise in modern web technologies, system design, and best practices. Provide code examples, explain trade-offs, and suggest optimal architectural patterns. Format code with proper markdown code blocks.",
  },
  {
    id: "teacher",
    name: "Teacher",
    icon: "🎓",
    description: "Clear explanations for everyone",
    systemPrompt:
      "You are a patient, engaging teacher who excels at explaining complex topics simply. Use analogies, examples, and step-by-step explanations. Adapt your language to the learner's level. Use markdown for structure.",
  },
  {
    id: "security",
    name: "Security Expert",
    icon: "🔒",
    description: "Cybersecurity and privacy focus",
    systemPrompt:
      "You are a cybersecurity expert with deep knowledge of threat modeling, secure coding practices, vulnerability assessment, and privacy compliance (GDPR, SOC2). Provide actionable security advice with concrete examples. Use markdown for formatting.",
  },
];

export const MODELS: Model[] = [
  {
    id: "google/gemma-4-26b-a4b-it:free",
    name: "Gemma 4 26B",
    provider: "Google",
    description: "Fast & free",
    isFree: true,
  },
  {
    id: "meta-llama/llama-4-maverick:free",
    name: "Llama 4 Maverick",
    provider: "Meta",
    description: "Powerful open model",
    isFree: true,
  },
  {
    id: "mistralai/mistral-7b-instruct:free",
    name: "Mistral 7B",
    provider: "Mistral AI",
    description: "Efficient & capable",
    isFree: true,
  },
  {
    id: "deepseek/deepseek-r1:free",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    description: "Reasoning powerhouse",
    isFree: true,
  },
];

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: "summarize",
    label: "Summarize",
    icon: "📝",
    prompt: "Please summarize the following text in bullet points:\n\n",
  },
  {
    id: "explain_code",
    label: "Explain Code",
    icon: "🔍",
    prompt: "Please explain this code step by step:\n\n```\n\n```",
  },
  {
    id: "generate_prd",
    label: "Generate PRD",
    icon: "📋",
    prompt:
      "Create a Product Requirements Document (PRD) for the following feature:\n\n",
  },
  {
    id: "brainstorm",
    label: "Brainstorm",
    icon: "💡",
    prompt: "Help me brainstorm creative ideas for:\n\n",
  },
  {
    id: "debug",
    label: "Debug Code",
    icon: "🐛",
    prompt: "Help me debug this code and identify the issue:\n\n```\n\n```",
  },
  {
    id: "write_email",
    label: "Write Email",
    icon: "✉️",
    prompt: "Write a professional email for the following situation:\n\n",
  },
];

export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
export const DEFAULT_MODEL = "google/gemma-4-26b-a4b-it:free";
export const DEFAULT_PERSONA = "default";
export const MAX_TOKENS = 4096;
export const TEMPERATURE = 0.7;
