import { pipeline, env } from "@xenova/transformers";

// Configure transformers.js to not use local model files if they are not downloaded,
// but to download them to a local cache.
env.allowLocalModels = false;

interface Document {
  pageContent: string;
  metadata: Record<string, any>;
  embedding?: number[];
}

// Global in-memory vector store
const memoryVectors: Document[] = [];

let extractorPromise: Promise<any> | null = null;
function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return extractorPromise;
}

// Helper: Cosine Similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Simple BM25-like sparse keyword retriever
export async function sparseSearch(query: string, k: number = 4): Promise<Document[]> {
  const keywords = query.toLowerCase().split(/\s+/).filter(kw => kw.length > 2);
  
  const scoredDocs = memoryVectors.map(vec => {
    let score = 0;
    const contentLower = vec.pageContent.toLowerCase();
    for (const kw of keywords) {
      if (contentLower.includes(kw)) score++;
    }
    return { doc: vec, score };
  });

  scoredDocs.sort((a, b) => b.score - a.score);
  return scoredDocs.filter(d => d.score > 0).slice(0, k).map(d => d.doc);
}

// Dense Search
export async function denseSearch(query: string, k: number = 4): Promise<Document[]> {
  const extractor = await getExtractor();
  const output = await extractor(query, { pooling: "mean", normalize: true });
  const queryEmbedding = Array.from(output.data) as number[];

  const scoredDocs = memoryVectors.filter(v => v.embedding).map(vec => {
    const score = cosineSimilarity(queryEmbedding, vec.embedding!);
    return { doc: vec, score };
  });

  scoredDocs.sort((a, b) => b.score - a.score);
  return scoredDocs.slice(0, k).map(item => item.doc);
}

export async function hybridSearch(query: string, k: number = 4): Promise<Document[]> {
  const denseResults = await denseSearch(query, k);
  const sparseResults = await sparseSearch(query, k);

  // Reciprocal Rank Fusion (RRF)
  const docScores = new Map<string, { doc: Document; score: number }>();
  
  const addRRF = (results: Document[]) => {
    results.forEach((doc, index) => {
      // Using pageContent as a naive unique ID for deduplication
      const id = doc.pageContent; 
      const rank = index + 1;
      const rrfScore = 1 / (60 + rank);
      
      if (!docScores.has(id)) {
        docScores.set(id, { doc, score: 0 });
      }
      docScores.get(id)!.score += rrfScore;
    });
  };

  addRRF(denseResults);
  addRRF(sparseResults);

  const sorted = Array.from(docScores.values()).sort((a, b) => b.score - a.score);
  return sorted.slice(0, k).map(item => item.doc);
}

export async function ingestDocuments(texts: string[], metadatas?: Record<string, any>[]) {
  const extractor = await getExtractor();
  
  const docs: Document[] = [];
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    const output = await extractor(text, { pooling: "mean", normalize: true });
    docs.push({
      pageContent: text,
      metadata: metadatas ? metadatas[i] : { source_id: `doc_${Date.now()}_${i}` },
      embedding: Array.from(output.data) as number[]
    });
  }
  
  memoryVectors.push(...docs);
  return docs.length;
}
