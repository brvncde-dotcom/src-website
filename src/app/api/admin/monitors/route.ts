import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const monitors = await prisma.contentMonitor.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      _count: { select: { matches: true } },
      matches: {
        where: { isRead: false },
        select: { id: true },
      },
    },
  });

  const rows = monitors.map((m) => ({
    id: m.id,
    name: m.name,
    keywords: m.keywords,
    sections: m.sections,
    types: m.types,
    languages: m.languages,
    isActive: m.isActive,
    createdAt: m.createdAt.toISOString(),
    user: m.user,
    _count: m._count,
    unread: m.matches.length,
  }));

  const stats = {
    totalMonitors: monitors.length,
    activeMonitors: monitors.filter((m) => m.isActive).length,
    totalMatches: monitors.reduce((s, m) => s + m._count.matches, 0),
    unreadMatches: monitors.reduce((s, m) => s + m.matches.length, 0),
    usersWithMonitors: new Set(monitors.map((m) => m.userId)).size,
  };

  return NextResponse.json({ monitors: rows, stats });
}
