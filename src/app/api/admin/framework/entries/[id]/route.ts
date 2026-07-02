import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminRequest } from "@/lib/admin-auth";
import { prisma, logAdminAction } from "@/lib/db";

async function actor(): Promise<string> {
  const session = await getServerSession(authOptions);
  return (session?.user?.email as string | undefined) ?? "admin";
}

// PATCH /api/admin/framework/entries/[id] — edit topic/position/confidence/rationale/isActive.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const { topic, position, confidence, rationale, isActive } = body;
  const entry = await prisma.worldviewEntry.update({
    where: { id },
    data: {
      ...(topic !== undefined && { topic }),
      ...(position !== undefined && { position }),
      ...(confidence !== undefined && { confidence }),
      ...(rationale !== undefined && { rationale }),
      ...(isActive !== undefined && { isActive }),
    },
  });
  await logAdminAction({ actor: await actor(), action: "cqr_matrix_entry_updated", targetType: "worldview_entry", targetId: id, detail: entry.topic });
  return NextResponse.json({ entry }, { status: 200 });
}

// DELETE /api/admin/framework/entries/[id]
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await prisma.worldviewEntry.delete({ where: { id } });
  await logAdminAction({ actor: await actor(), action: "cqr_matrix_entry_deleted", targetType: "worldview_entry", targetId: id });
  return NextResponse.json({ ok: true }, { status: 200 });
}
