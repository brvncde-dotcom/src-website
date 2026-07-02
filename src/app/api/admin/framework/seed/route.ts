import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { prisma, logAdminAction } from "@/lib/db";
import { seedFramework } from "@/lib/cqr-seed-data";

// POST /api/admin/framework/seed
// One-time (idempotent) seed of the Worldview Matrix v1.0 + FrameworkConfig v1.
// Runs server-side where DATABASE_URL is populated. Admin session only.
export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const result = await seedFramework(prisma);
  await logAdminAction({ actor: "admin", action: "cqr_framework_seeded", targetType: "framework_config", detail: `${result.domains} domains, ${result.entries} entries` });
  return NextResponse.json({ ok: true, ...result }, { status: 200 });
}
