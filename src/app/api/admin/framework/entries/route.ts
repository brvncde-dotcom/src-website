import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminRequest } from "@/lib/admin-auth";
import { prisma, logAdminAction } from "@/lib/db";

async function actor(): Promise<string> {
  const session = await getServerSession(authOptions);
  return (session?.user?.email as string | undefined) ?? "admin";
}

// POST /api/admin/framework/entries — create a Worldview Matrix entry.
export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const { domainId, topic, position, confidence, rationale } = body ?? {};
  if (!domainId || !topic || !position || !rationale) {
    return NextResponse.json({ error: "domainId, topic, position, rationale required" }, { status: 400 });
  }

  const entry = await prisma.worldviewEntry.create({
    data: { domainId, topic, position, confidence: confidence || "Medium", rationale },
  });
  await logAdminAction({ actor: await actor(), action: "cqr_matrix_entry_created", targetType: "worldview_entry", targetId: entry.id, detail: topic });
  return NextResponse.json({ entry }, { status: 201 });
}
