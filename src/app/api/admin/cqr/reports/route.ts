import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

// GET /api/admin/cqr/reports?scored=only|unscored&flagged=1&page=1&pageSize=20
// Report list for the CQR review surface, each with its latest ContentScore.
export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const url = new URL(request.url);
  const scored = url.searchParams.get("scored"); // "only" | "unscored" | null
  const flaggedOnly = url.searchParams.get("flagged") === "1";
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(url.searchParams.get("pageSize") ?? "20", 10)));

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 300, // scan window; filtered/paged below
    select: {
      id: true,
      title: true,
      type: true,
      section: true,
      status: true,
      createdAt: true,
      contentScores: { orderBy: { frameworkVersion: "desc" }, take: 1 },
    },
  });

  let rows = reports.map((r) => {
    const score = r.contentScores[0] ?? null;
    return {
      id: r.id,
      title: r.title,
      type: r.type,
      section: r.section,
      status: r.status,
      createdAt: r.createdAt,
      score: score
        ? {
            composite: score.composite,
            flags: score.flags,
            recommendedAction: score.recommendedAction,
            recommendedTier: score.recommendedTier,
            scoredBy: score.scoredBy,
            frameworkVersion: score.frameworkVersion,
            value: score.value,
            trustworthiness: score.trustworthiness,
            sourceBias: score.sourceBias,
            worldviewAlignment: score.worldviewAlignment,
            corruptionIndex: score.corruptionIndex,
            actionability: score.actionability,
            rationale: score.rationale,
            contrarianFlag: score.contrarianFlag,
            editorialOverride: score.editorialOverride,
            updatedAt: score.updatedAt,
          }
        : null,
    };
  });

  if (scored === "only") rows = rows.filter((r) => r.score);
  if (scored === "unscored") rows = rows.filter((r) => !r.score);
  if (flaggedOnly) rows = rows.filter((r) => r.score && r.score.flags.length > 0);

  const total = rows.length;
  const start = (page - 1) * pageSize;
  const paged = rows.slice(start, start + pageSize);

  return NextResponse.json({ reports: paged, total, page, pageSize });
}
