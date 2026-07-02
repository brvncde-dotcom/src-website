import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, getUserTier } from "@/lib/db";

// GET /api/monitors/matches
// ?monitorId=... — filter by a specific monitor
// ?unreadOnly=true — unread only
// ?countOnly=true — return just { unread: number } for badge
// ?page=1&pageSize=20 — pagination
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  const tier = await getUserTier(userId);
  if ((tier?.sortOrder ?? 0) < 2) {
    return NextResponse.json({ error: "Professional membership required" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const monitorId = searchParams.get("monitorId") ?? undefined;
  const unreadOnly = searchParams.get("unreadOnly") === "true";
  const countOnly = searchParams.get("countOnly") === "true";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10)));

  // Find the user's monitor ids (optionally scoped to one)
  const userMonitors = await prisma.contentMonitor.findMany({
    where: { userId, ...(monitorId ? { id: monitorId } : {}) },
    select: { id: true },
  });
  const monitorIds = userMonitors.map((m) => m.id);

  if (countOnly) {
    const unread = await prisma.monitorMatch.count({
      where: { monitorId: { in: monitorIds }, isRead: false },
    });
    return NextResponse.json({ unread });
  }

  const where = {
    monitorId: { in: monitorIds },
    ...(unreadOnly ? { isRead: false } : {}),
  };

  const [total, matches] = await Promise.all([
    prisma.monitorMatch.count({ where }),
    prisma.monitorMatch.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        monitor: { select: { id: true, name: true } },
        report: {
          select: {
            id: true,
            title: true,
            summary: true,
            type: true,
            section: true,
            language: true,
            publishedAt: true,
            code: true,
          },
        },
      },
    }),
  ]);

  return NextResponse.json({
    matches: matches.map((m) => ({
      id: m.id,
      monitorId: m.monitorId,
      monitorName: m.monitor.name,
      reportId: m.reportId,
      matchedOn: m.matchedOn,
      isRead: m.isRead,
      createdAt: m.createdAt,
      report: m.report,
    })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
}
