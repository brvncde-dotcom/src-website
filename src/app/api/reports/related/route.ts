import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/reports/related?id=<reportId>&limit=4
//
// Returns up to `limit` published reports whose embedding is closest to the
// target report by cosine distance, excluding the target itself. Falls back to
// same-section recency if the target has no embedding.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim();
  const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "4", 10), 1), 8);

  if (!id) {
    return NextResponse.json({ related: [] });
  }

  try {
    type EmbedRow = { embedding: string | null; section: string };
    const [target] = await prisma.$queryRaw<EmbedRow[]>`
      SELECT embedding::text, section
      FROM "Report"
      WHERE id = ${id}
        AND status = 'published'
      LIMIT 1
    `;

    if (!target) {
      return NextResponse.json({ related: [] });
    }

    type RelatedRow = {
      id: string;
      title: string;
      summary: string | null;
      type: string;
      section: string;
      language: string;
      publishedAt: Date | null;
    };

    if (target.embedding) {
      const rows = await prisma.$queryRaw<RelatedRow[]>`
        SELECT id, title, summary, type, section, language, "publishedAt"
        FROM "Report"
        WHERE id != ${id}
          AND status = 'published'
          AND embedding IS NOT NULL
        ORDER BY embedding <=> ${target.embedding}::vector
        LIMIT ${limit}
      `;
      return NextResponse.json({ related: rows });
    }

    // Fallback: same section, most recent
    const rows = await prisma.report.findMany({
      where: { id: { not: id }, status: "published", section: target.section },
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: { id: true, title: true, summary: true, type: true, section: true, language: true, publishedAt: true },
    });
    return NextResponse.json({ related: rows });
  } catch (e) {
    console.error("[related] error:", e);
    return NextResponse.json({ related: [] });
  }
}
