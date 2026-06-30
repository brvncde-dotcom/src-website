import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma, getUserTier } from "@/lib/db";
import { HL_START, HL_END, type SearchHit } from "@/lib/search";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  title: string;
  summary: string | null;
  section: string;
  type: string;
  language: string;
  sourceRef: string | null;
  publishedAt: Date | null;
  minTierId: string | null;
  minTierSort: number | null;
  minTierName: string | null;
  snippet: string | null;
  rank: number;
};

// GET /api/search?q=…&lang=&section=&type=&limit=
//
// Access model: titles + summaries are public and searchable by everyone.
// Full report content is searched + snippeted ONLY for the rows the requester
// is entitled to (their tier sortOrder >= the report's minTier sortOrder, or
// the report is ungated). Enforced per-row in the SQL via a CASE expression so
// a non-member's query never matches — or snippets — locked content.
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") || "").trim();
    const lang = (url.searchParams.get("lang") || "").trim().toLowerCase();
    const section = (url.searchParams.get("section") || "").trim();
    const type = (url.searchParams.get("type") || "").trim();
    const limit = Math.min(
      Math.max(parseInt(url.searchParams.get("limit") || "20", 10) || 20, 1),
      50,
    );

    // Need at least 2 chars to search — avoids scanning on a single keystroke.
    if (q.length < 2) {
      return NextResponse.json({ results: [], query: q });
    }

    // Resolve the requester's content entitlement as a single sortOrder.
    // Admins see everything; anonymous/unknown get -1 so they never clear any
    // gate (Observer is 0, the lowest real tier, gated reports start at 1).
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ?? null;
    const isAdmin = !!(session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;
    let userSort = -1;
    if (isAdmin) {
      userSort = 999999;
    } else if (userId) {
      const tier = await getUserTier(userId);
      userSort = tier?.sortOrder ?? 0;
    }

    // The per-row content fragment: content is folded into the search document
    // only when the requester is entitled to that specific report.
    const contentExpr = Prisma.sql`CASE WHEN (r."minTierId" IS NULL OR ${userSort}::int >= mt."sortOrder") THEN coalesce(r.content,'') ELSE '' END`;
    // The full searchable document (title + summary always; content if allowed).
    const docExpr = Prisma.sql`(coalesce(r.title,'') || ' ' || coalesce(r.summary,'') || ' ' || ${contentExpr})`;
    // The snippet source (summary always; content if allowed) — never includes
    // title so highlights read like prose, not a heading echo.
    const snippetExpr = Prisma.sql`(coalesce(r.summary,'') || ' ' || ${contentExpr})`;

    const tsquery = Prisma.sql`websearch_to_tsquery('simple', ${q})`;
    const like = `%${q}%`;
    const langFrag = lang ? Prisma.sql`AND r.language = ${lang}` : Prisma.empty;
    const sectionFrag = section ? Prisma.sql`AND r.section = ${section}` : Prisma.empty;
    const typeFrag = type ? Prisma.sql`AND r.type = ${type}` : Prisma.empty;

    const rows = await prisma.$queryRaw<Row[]>`
      SELECT
        r.id, r.title, r.summary, r.section, r.type, r.language,
        r."sourceRef" AS "sourceRef", r."publishedAt" AS "publishedAt",
        r."minTierId" AS "minTierId",
        mt."sortOrder" AS "minTierSort",
        mt.name AS "minTierName",
        ts_rank(to_tsvector('simple', ${docExpr}), ${tsquery}) AS rank,
        ts_headline(
          'simple', ${snippetExpr}, ${tsquery},
          ${`StartSel=${HL_START},StopSel=${HL_END},MaxFragments=1,MaxWords=32,MinWords=10,ShortWord=2`}
        ) AS snippet
      FROM "Report" r
      LEFT JOIN "Tier" mt ON mt.id = r."minTierId"
      WHERE r.status = 'published'
        ${langFrag}
        ${sectionFrag}
        ${typeFrag}
        AND (
          to_tsvector('simple', ${docExpr}) @@ ${tsquery}
          OR r.title ILIKE ${like}
          OR r.summary ILIKE ${like}
        )
      ORDER BY rank DESC, r."publishedAt" DESC NULLS LAST
      LIMIT ${limit}
    `;

    const results: SearchHit[] = rows.map((r) => {
      const gated =
        r.minTierId != null &&
        r.minTierSort != null &&
        userSort < r.minTierSort;
      return {
        id: r.id,
        title: r.title,
        summary: r.summary,
        section: r.section,
        type: r.type,
        language: r.language,
        sourceRef: r.sourceRef,
        publishedAt: r.publishedAt ? r.publishedAt.toISOString() : null,
        snippet: r.snippet,
        rank: typeof r.rank === "number" ? r.rank : Number(r.rank) || 0,
        gated,
        requiredTier: gated ? r.minTierName : null,
      };
    });

    return NextResponse.json({ results, query: q, count: results.length });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
