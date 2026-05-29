import { NextRequest, NextResponse } from "next/server";
import { ingestDocuments } from "@/lib/retriever";

// Disable edge runtime here if Transformers.js requires Node.js features
export const runtime = "nodejs"; 

// Simple text splitter function
function splitText(text: string, chunkSize = 500, chunkOverlap = 50): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSize));
    i += chunkSize - chunkOverlap;
  }
  return chunks;
}

export async function POST(req: NextRequest) {
  try {
    const { text, sourceName } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: "Text payload is required" }, { status: 400 });
    }

    const chunks = splitText(text);
    const metadatas = chunks.map((_, i) => ({
      source_name: sourceName || "Upload",
      chunk_index: i,
      source_id: `src_${Date.now()}_${i}`
    }));

    const numIngested = await ingestDocuments(chunks, metadatas);

    return NextResponse.json({ 
      success: true, 
      message: `Successfully ingested ${numIngested} chunks.` 
    });
  } catch (error: unknown) {
    console.error("Ingestion error:", error);
    const errorMsg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
