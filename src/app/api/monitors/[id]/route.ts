import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, getUserTier } from "@/lib/db";

async function getAuthorizedUser(
  request: NextRequest,
  monitorId: string
): Promise<
  { userId: string; monitor: { id: string; userId: string }; error?: never } |
  { userId?: never; monitor?: never; error: NextResponse }
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
  const monitor = await prisma.contentMonitor.findUnique({
    where: { id: monitorId },
    select: { id: true, userId: true },
  });
  if (!monitor || monitor.userId !== userId) {
    return { error: NextResponse.json({ error: "Monitor not found" }, { status: 404 }) };
  }
  return { userId, monitor };
}

// PATCH /api/monitors/[id] — update name/keywords/sections/types/languages/isActive
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getAuthorizedUser(request, id);
  if (auth.error) return auth.error;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const toStringArray = (v: unknown): string[] =>
    Array.isArray(v) ? v.map(String).filter(Boolean) : [];

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = (body.name as string).trim();
  if (body.keywords !== undefined) data.keywords = toStringArray(body.keywords);
  if (body.sections !== undefined) data.sections = toStringArray(body.sections);
  if (body.types !== undefined) data.types = toStringArray(body.types);
  if (body.languages !== undefined) data.languages = toStringArray(body.languages);
  if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const updated = await prisma.contentMonitor.update({ where: { id }, data });
  return NextResponse.json({ monitor: updated });
}

// DELETE /api/monitors/[id] — delete monitor + cascade matches
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getAuthorizedUser(request, id);
  if (auth.error) return auth.error;

  await prisma.contentMonitor.delete({ where: { id } });
  return NextResponse.json({ message: "Monitor deleted." });
}
