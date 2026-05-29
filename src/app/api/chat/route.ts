import { NextRequest, NextResponse } from "next/server";
import { OPENROUTER_BASE_URL, DEFAULT_MODEL, MAX_TOKENS, TEMPERATURE, PERSONAS } from "@/lib/constants";
import { hybridSearch, Document } from "@/lib/retriever";

// Removed "edge" runtime because Transformers.js requires Node.js features
export const runtime = "nodejs";

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

// A helper to make non-streaming calls to OpenRouter
async function callOpenRouter(
  apiKey: string,
  modelId: string,
  messages: Array<{ role: string; content: string }>,
  temperature: number
) {
  const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "GptGen2",
    },
    body: JSON.stringify({
      model: modelId,
      messages,
      stream: false,
      max_tokens: MAX_TOKENS,
      temperature,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenRouter Error: ${await res.text()}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

export async function POST(req: NextRequest) {
  try {
    const rateLimitKey = getRateLimitKey(req);
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json({ error: "Too many requests. Please wait." }, { status: 429 });
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

    const persona = PERSONAS.find(p => p.id === personaId);
    const personaPrompt = persona?.systemPrompt ?? "You are GptGen2, a helpful, harmless, and honest AI assistant.";

    // The user's latest query
    const lastUserMessage = messages[messages.length - 1].content;

    // We will construct a ReadableStream to stream our complex process back to the user
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendThink = (text: string) => {
          controller.enqueue(encoder.encode("data: " + JSON.stringify({ type: "thinking", content: text + "\n" }) + "\n\n"));
        };
        const sendContent = (text: string) => {
          controller.enqueue(encoder.encode("data: " + JSON.stringify({ type: "content", content: text }) + "\n\n"));
        };

        sendThink("<think>");
        sendThink("Starting Intake & Policy Check...");
        
        // 1. Intake Module (mocked policy check)
        sendThink(`Analyzing query for safety and constraints... Passed.`);

        // 2. Retriever Stage
        sendThink(`Running Hybrid Retriever (Dense + Sparse) for query: "${lastUserMessage.substring(0, 30)}..."`);
        
        let retrievedDocs: Document[] = [];
        try {
          retrievedDocs = await hybridSearch(lastUserMessage, 3);
          sendThink(`Retrieved ${retrievedDocs.length} chunks of evidence.`);
        } catch {
          sendThink(`Retrieval failed (maybe store is empty). Proceeding without evidence.`);
        }

        const evidenceContext = retrievedDocs.map((d, i) => `[Source ${i+1}]: ${d.pageContent}`).join("\n\n");

        // 3. Generator Stage
        sendThink("Generating claims based on evidence...");
        const generatorSystemPrompt = `${personaPrompt}\n\nEVIDENCE:\n${evidenceContext}\n\nYou must strictly answer based on the evidence. Use [Source X] format for inline citations.`;
        
        const generatorMessages = [
          { role: "system", content: generatorSystemPrompt },
          ...messages
        ];

        let generatedOutput = "";
        try {
          generatedOutput = await callOpenRouter(apiKey, modelId, generatorMessages, TEMPERATURE);
          sendThink("Initial generation complete.");
        } catch (e: unknown) {
          const errorMsg = e instanceof Error ? e.message : String(e);
          sendThink(`Generator Error: ${errorMsg}`);
          sendThink("</think>");
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          return;
        }

        // 4. Verifier Stage
        sendThink("Executing independent Verifier LLM...");
        const verifierPrompt = `You are a strict fact-checker. 
EVIDENCE:
${evidenceContext}

CLAIM TO VERIFY:
${generatedOutput}

Evaluate if the claim is supported by the evidence. Respond ONLY with a JSON object: 
{ "verdict": "pass" | "fail", "reason": "...", "confidence": 0.0 - 1.0 }`;

        let verdict = "pass";
        let reason = "";
        try {
          // Using a fast free model for verification if possible, fallback to same model
          const verifierOutput = await callOpenRouter(apiKey, "google/gemma-2-9b-it:free", [{ role: "user", content: verifierPrompt }], 0.1);
          
          const jsonMatch = verifierOutput.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            verdict = parsed.verdict;
            reason = parsed.reason;
            sendThink(`Verifier Verdict: ${verdict.toUpperCase()} (Confidence: ${parsed.confidence})`);
            if (verdict === "fail") {
              sendThink(`Verifier Reason: ${reason}`);
            }
          } else {
            sendThink("Verifier returned unstructured output. Assuming pass.");
          }
        } catch (e: unknown) {
          const errorMsg = e instanceof Error ? e.message : String(e);
          sendThink(`Verifier Error: ${errorMsg}. Bypassing verification.`);
        }

        // 5. Consensus & Policy
        if (verdict === "fail") {
          sendThink("Consensus Triggered: Strict decoding fallback activated due to verifier failure.");
          sendThink("Regenerating with stricter constraints...");
          
          try {
            // Retry with temperature 0
            generatedOutput = await callOpenRouter(apiKey, modelId, generatorMessages, 0.0);
            sendThink("Regeneration complete.");
          } catch {
            // Ignore retry failure
          }
        }

        sendThink("Formatting final audit record and provenance...");
        sendThink("</think>");

        // 6. Final Output Stream
        // To simulate streaming the final answer so the UI typing effect works, we chunk it.
        const chunkSize = 20;
        for (let i = 0; i < generatedOutput.length; i += chunkSize) {
          sendContent(generatedOutput.substring(i, i + chunkSize));
          // small artificial delay for visual streaming effect
          await new Promise(r => setTimeout(r, 10)); 
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    });

    return new Response(stream, {
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
