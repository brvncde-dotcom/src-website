import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin-auth";

// GET /api/admin/audit — recent admin activity (audit log)
export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const logs = await prisma.adminAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ logs });
}
