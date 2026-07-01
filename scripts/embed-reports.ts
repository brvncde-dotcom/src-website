/**
 * Backfill script — generate OpenAI embeddings for all published reports
 * that don't have one yet, and store them in Report.embedding.
 *
 * Usage:
 *   npx ts-node --esm scripts/embed-reports.ts
 * or (if bun is available):
 *   bun run scripts/embed-reports.ts
 *
 * Requires DATABASE_URL and OPENAI_API_KEY in the environment.
 * Pull them from Vercel first:
 *   vercel env pull .env.local
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = "text-embedding-3-small";
const BATCH = 20; // OpenAI allows up to 2048 inputs per request; 20 is safe

if (!OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is not set. Run: vercel env pull .env.local");
  process.exit(1);
}

async function embed(texts: string[]): Promise<number[][]> {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: MODEL, input: texts }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${err}`);
  }

  const json = (await res.json()) as { data: { embedding: number[] }[] };
  return json.data.map((d) => d.embedding);
}

function buildText(report: {
  title: string;
  summary: string | null;
  content: string | null;
  author: string | null;
  section: string;
  type: string;
}): string {
  // Combine all meaningful text. Content is included server-side (this script
  // runs with DB access, not in the browser, so tier gating doesn't apply).
  return [
    report.title,
    report.summary,
    report.author ? `Author: ${report.author}` : null,
    `Section: ${report.section}  Type: ${report.type}`,
    report.content,
  ]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, 8000); // stay well under token limits
}

async function main() {
  const reports = await prisma.report.findMany({
    where: {
      status: "published",
      // Only fetch reports without an embedding.
      // Prisma can't filter on Unsupported types directly, so we use raw SQL.
    },
    select: {
      id: true,
      title: true,
      summary: true,
      content: true,
      author: true,
      section: true,
      type: true,
    },
  });

  // Filter out reports that already have embeddings via a raw query
  const embeddedIds = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM "Report" WHERE status = 'published' AND embedding IS NOT NULL
  `;
  const embeddedSet = new Set(embeddedIds.map((r) => r.id));
  const toEmbed = reports.filter((r) => !embeddedSet.has(r.id));

  console.log(
    `${reports.length} published reports, ${embeddedSet.size} already embedded, ${toEmbed.length} to process`
  );

  if (toEmbed.length === 0) {
    console.log("Nothing to do.");
    return;
  }

  let done = 0;
  for (let i = 0; i < toEmbed.length; i += BATCH) {
    const batch = toEmbed.slice(i, i + BATCH);
    const texts = batch.map(buildText);

    const vectors = await embed(texts);

    for (let j = 0; j < batch.length; j++) {
      const { id } = batch[j];
      const vec = vectors[j];
      // Store as a Postgres vector literal: '[0.1,0.2,...]'
      const vecLiteral = `[${vec.join(",")}]`;
      await prisma.$executeRaw`
        UPDATE "Report" SET embedding = ${vecLiteral}::vector WHERE id = ${id}
      `;
    }

    done += batch.length;
    console.log(`  ${done}/${toEmbed.length} embedded`);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
