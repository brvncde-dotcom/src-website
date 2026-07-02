import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin-auth";

// GET /api/admin/ingestion-log — every POST /api/reports attempt, newest first.
// This is the observability layer between Paperclip and the review queue:
// when content "disappears", this log says whether it ever arrived and why
// it was turned away (rejected / unauthorized / errored).
// Query params:
//   ?outcome=rejected  — filter by outcome (accepted | rejected | error | unauthorized)
//   ?limit=200         — page size (default 200, max 1000)
export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const outcome = searchParams.get("outcome");
  const limit = Math.min(parseInt(searchParams.get("limit") || "200", 10), 1000);

  const where = outcome ? { outcome } : {};

  const [entries, total, counts] = await Promise.all([
    prisma.ingestionLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.ingestionLog.count({ where }),
    // Outcome totals for the summary chips (independent of the filter)
    prisma.ingestionLog.groupBy({
      by: ["outcome"],
      _count: { id: true },
    }),
  ]);

  return NextResponse.json({
    entries,
    total,
    counts: Object.fromEntries(counts.map((c) => [c.outcome, c._count.id])),
  });
}
