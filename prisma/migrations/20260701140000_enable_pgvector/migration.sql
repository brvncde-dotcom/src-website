-- Enable pgvector extension (available on all Neon plans)
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to Report (1536 dims = OpenAI text-embedding-3-small)
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- HNSW index for fast approximate nearest-neighbour search (cosine distance).
-- HNSW is preferred over IVFFlat on Neon: no training step, better recall,
-- and handles small corpora well. ef_construction=128 is a solid default.
CREATE INDEX IF NOT EXISTS "Report_embedding_hnsw_idx"
  ON "Report" USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 128);
