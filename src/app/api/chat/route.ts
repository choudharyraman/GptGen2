import { NextRequest, NextResponse } from "next/server";
import { OPENROUTER_BASE_URL, DEFAULT_MODEL, MAX_TOKENS, TEMPERATURE, PERSONAS } from "@/lib/constants";

export const runtime = "edge";

const RATE_LIMIT_MAP = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW = 60 * 1000;

function getRateLimitKey(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "unknown";
  return ip;
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = RATE_LIMIT_MAP.get(key);
  if (!entry || now > entry.resetTime) {
    RATE_LIMIT_MAP.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const rateLimitKey = getRateLimitKey(req);
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { messages, modelId = DEFAULT_MODEL, personaId } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    // Fix: use systemPrompt not prompt
    const persona = PERSONAS.find(p => p.id === personaId);
    const personaPrompt = persona?.systemPrompt ?? "You are GptGen2, a helpful, harmless, and honest AI assistant.";

    const systemPrompt = {
      role: "system",
      content: `${personaPrompt}

FORMATTING INSTRUCTIONS:
- Provide a clear, well-structured response.
- At the end of your response, add a "---\\n**References & Sources:**" section and list any key facts, frameworks, or concepts you drew upon.`,
    };

    const finalMessages = [systemPrompt, ...messages];

    const upstreamRes = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "GptGen2",
      },
      body: JSON.stringify({
        model: modelId,
        messages: finalMessages,
        stream: true,
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE,
      }),
    });

    if (!upstreamRes.ok) {
      const errorText = await upstreamRes.text();
      console.error("OpenRouter error:", errorText);
      let errMsg = "AI service error. Please try again.";
      try {
        const parsed = JSON.parse(errorText);
        errMsg = parsed.error?.metadata?.raw || parsed.error?.message || errMsg;
      } catch (e) {}
      return NextResponse.json(
        { error: errMsg },
        { status: upstreamRes.status }
      );
    }

    // Transform the OpenRouter SSE stream into our own structured SSE stream.
    // This properly handles both:
    //   1. Native reasoning models (delta.reasoning + delta.content)
    //   2. Standard models (delta.content only)
    const transformedStream = new TransformStream({
      start(controller) {
        (this as any).buffer = "";
        (this as any).reasoningDone = false;
        (this as any).hasNativeReasoning = false;
        (this as any).sentThinkOpen = false;
        (this as any).sentThinkClose = false;
      },

      transform(chunk: Uint8Array, controller) {
        const self = this as any;
        const text = new TextDecoder().decode(chunk);
        self.buffer += text;

        const lines = self.buffer.split("\n");
        self.buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ") || trimmed === "data: [DONE]") continue;

          let parsed: any;
          try {
            parsed = JSON.parse(trimmed.slice(6));
          } catch {
            continue;
          }

          const delta = parsed.choices?.[0]?.delta;
          if (!delta) continue;

          const reasoningChunk: string = delta.reasoning ?? "";
          const contentChunk: string = delta.content ?? "";

          // --- Handle native reasoning tokens ---
          if (reasoningChunk) {
            self.hasNativeReasoning = true;
            if (!self.sentThinkOpen) {
              controller.enqueue(encode("data: " + JSON.stringify({ type: "thinking", content: "<think>" }) + "\n\n"));
              self.sentThinkOpen = true;
            }
            controller.enqueue(encode("data: " + JSON.stringify({ type: "thinking", content: reasoningChunk }) + "\n\n"));
          }

          // --- Handle regular content tokens ---
          if (contentChunk) {
            // If this model used native reasoning and we haven't closed think yet, do it now
            if (self.hasNativeReasoning && !self.sentThinkClose) {
              controller.enqueue(encode("data: " + JSON.stringify({ type: "thinking", content: "</think>" }) + "\n\n"));
              self.sentThinkClose = true;
            }
            controller.enqueue(encode("data: " + JSON.stringify({ type: "content", content: contentChunk }) + "\n\n"));
          }
        }
      },

      flush(controller) {
        const self = this as any;
        // Close any open think tag
        if (self.hasNativeReasoning && !self.sentThinkClose) {
          controller.enqueue(encode("data: " + JSON.stringify({ type: "thinking", content: "</think>" }) + "\n\n"));
        }
        controller.enqueue(encode("data: [DONE]\n\n"));
      },
    });

    upstreamRes.body!.pipeTo(transformedStream.writable);

    return new Response(transformedStream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function encode(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}
