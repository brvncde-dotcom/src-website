import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

// POST /api/admin/purge-brief-duplicates
// Keeps the most recently ingested Daily Brief per calendar day, deletes the rest.
export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const briefs = await prisma.report.findMany({
    where: { type: "Daily Brief" },
    select: { id: true, publishedAt: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  // Group by calendar day (UTC). The first entry in each group (desc sort) is the keeper.
  const keepIds = new Set<string>();
  const seenDays = new Set<string>();

  for (const b of briefs) {
    const day = (b.publishedAt ?? b.createdAt).toISOString().slice(0, 10);
    if (!seenDays.has(day)) {
      seenDays.add(day);
      keepIds.add(b.id);
    }
  }

  const deleteIds = briefs.map((b) => b.id).filter((id) => !keepIds.has(id));

  if (deleteIds.length === 0) {
    return NextResponse.json({ deleted: 0, message: "No duplicates found." });
  }

  const result = await prisma.report.deleteMany({
    where: { id: { in: deleteIds } },
  });

  return NextResponse.json({
    deleted: result.count,
    kept: keepIds.size,
    message: `Deleted ${result.count} duplicate Daily Brief(s). Kept ${keepIds.size} (one per day).`,
  });
}
