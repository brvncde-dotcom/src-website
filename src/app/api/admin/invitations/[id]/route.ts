import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin-auth";

// DELETE /api/admin/invitations/[id] — revoke a pending invitation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    await prisma.invitation.update({ where: { id }, data: { status: "revoked" } });
    return NextResponse.json({ ok: true, message: "Invitation revoked." });
  } catch (error) {
    console.error("Error revoking invitation:", error);
    return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  }
}
