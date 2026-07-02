import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, getUserTier } from "@/lib/db";

// POST /api/monitors/matches/read-all — mark all (or one monitor's) matches as read
// Body: { monitorId?: string }
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  const tier = await getUserTier(userId);
  if ((tier?.sortOrder ?? 0) < 2) {
    return NextResponse.json({ error: "Professional membership required" }, { status: 403 });
  }

  let monitorId: string | undefined;
  try {
    const body = await request.json();
    monitorId = body?.monitorId ?? undefined;
  } catch {
    // body optional
  }

  const userMonitors = await prisma.contentMonitor.findMany({
    where: { userId, ...(monitorId ? { id: monitorId } : {}) },
    select: { id: true },
  });
  const monitorIds = userMonitors.map((m) => m.id);

  const result = await prisma.monitorMatch.updateMany({
    where: { monitorId: { in: monitorIds }, isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({ marked: result.count });
}
