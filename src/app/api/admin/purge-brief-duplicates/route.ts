import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

type Brief = { id: string; title: string; publishedAt: Date | null; createdAt: Date };

function computeDedup(briefs: Brief[]) {
  // Group by publishedAt day (UTC). Sorted desc by createdAt, so the first
  // entry per day is the most recently ingested — that's the one we keep.
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
  return { keepIds, deleteIds };
}

// GET /api/admin/purge-brief-duplicates
// Preview: returns what would be deleted, without deleting anything.
export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const briefs = await prisma.report.findMany({
    where: { type: "Daily Brief" },
    select: { id: true, title: true, publishedAt: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  if (briefs.length === 0) {
    return NextResponse.json({ total: 0, wouldDelete: 0, wouldKeep: 0, preview: [] });
  }

  const { keepIds, deleteIds } = computeDedup(briefs);

  const preview = briefs
    .filter((b) => deleteIds.includes(b.id))
    .map((b) => ({
      id: b.id,
      title: b.title.slice(0, 80),
      day: (b.publishedAt ?? b.createdAt).toISOString().slice(0, 10),
    }));

  return NextResponse.json({
    total: briefs.length,
    wouldDelete: deleteIds.length,
    wouldKeep: keepIds.size,
    preview,
  });
}

// POST /api/admin/purge-brief-duplicates
// Execute: keeps the most recently ingested Daily Brief per calendar day, deletes the rest.
export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const briefs = await prisma.report.findMany({
    where: { type: "Daily Brief" },
    select: { id: true, title: true, publishedAt: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  if (briefs.length === 0) {
    return NextResponse.json({ deleted: 0, message: "No Daily Briefs found." });
  }

  const { keepIds, deleteIds } = computeDedup(briefs);

  if (deleteIds.length === 0) {
    return NextResponse.json({ deleted: 0, kept: keepIds.size, message: "No duplicates found — each day already has exactly one brief." });
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
