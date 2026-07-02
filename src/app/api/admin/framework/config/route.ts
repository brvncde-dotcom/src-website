import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminRequest } from "@/lib/admin-auth";
import { prisma, logAdminAction } from "@/lib/db";
import { Prisma } from "@prisma/client";

async function actor(): Promise<string> {
  const session = await getServerSession(authOptions);
  return (session?.user?.email as string | undefined) ?? "admin";
}

// PUT /api/admin/framework/config
// Publish a NEW FrameworkConfig version (weights/thresholds/flagRules). The new
// version becomes current (highest published version wins). Old versions stay
// for audit — scores keep the version they were computed under.
export async function PUT(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const { weights, thresholds, flagRules, note } = body ?? {};
  if (!weights || !thresholds) {
    return NextResponse.json({ error: "weights and thresholds required" }, { status: 400 });
  }

  const latest = await prisma.frameworkConfig.findFirst({ orderBy: { version: "desc" } });
  const nextVersion = (latest?.version ?? 0) + 1;

  const config = await prisma.frameworkConfig.create({
    data: {
      version: nextVersion,
      weights: weights as Prisma.InputJsonValue,
      thresholds: thresholds as Prisma.InputJsonValue,
      flagRules: (flagRules ?? {}) as Prisma.InputJsonValue,
      published: true,
      note: note ?? null,
    },
  });
  await logAdminAction({ actor: await actor(), action: "cqr_config_published", targetType: "framework_config", targetId: config.id, detail: `v${nextVersion}` });
  return NextResponse.json({ config }, { status: 201 });
}
