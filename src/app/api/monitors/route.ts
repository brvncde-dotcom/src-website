import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, getUserTier } from "@/lib/db";

const MAX_MONITORS = 10;

async function getAuthorizedUser(request: NextRequest): Promise<
  { userId: string; error?: never } | { userId?: never; error: NextResponse }
> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;
  if (!userId) {
    return { error: NextResponse.json({ error: "Authentication required" }, { status: 401 }) };
  }
  const tier = await getUserTier(userId);
  if ((tier?.sortOrder ?? 0) < 2) {
    return { error: NextResponse.json({ error: "Professional membership required" }, { status: 403 }) };
  }
  return { userId };
}

// GET /api/monitors — list user's monitors with unread match counts
export async function GET(request: NextRequest) {
  const auth = await getAuthorizedUser(request);
  if (auth.error) return auth.error;
  const { userId } = auth;

  const monitors = await prisma.contentMonitor.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { matches: true } },
      matches: {
        where: { isRead: false },
        select: { id: true },
      },
    },
  });

  const result = monitors.map((m) => ({
    id: m.id,
    name: m.name,
    keywords: m.keywords,
    sections: m.sections,
    types: m.types,
    languages: m.languages,
    isActive: m.isActive,
    totalMatches: m._count.matches,
    unreadMatches: m.matches.length,
    createdAt: m.createdAt,
  }));

  return NextResponse.json({ monitors: result });
}

// POST /api/monitors — create a monitor
export async function POST(request: NextRequest) {
  const auth = await getAuthorizedUser(request);
  if (auth.error) return auth.error;
  const { userId } = auth;

  const existing = await prisma.contentMonitor.count({ where: { userId } });
  if (existing >= MAX_MONITORS) {
    return NextResponse.json(
      { error: `You can have at most ${MAX_MONITORS} active monitors.` },
      { status: 422 }
    );
  }

  let body: { name?: string; keywords?: unknown; sections?: unknown; types?: unknown; languages?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = (body.name ?? "").toString().trim();
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const toStringArray = (v: unknown): string[] =>
    Array.isArray(v) ? v.map(String).filter(Boolean) : [];

  const monitor = await prisma.contentMonitor.create({
    data: {
      userId,
      name,
      keywords: toStringArray(body.keywords),
      sections: toStringArray(body.sections),
      types: toStringArray(body.types),
      languages: toStringArray(body.languages),
    },
  });

  return NextResponse.json({ monitor }, { status: 201 });
}
