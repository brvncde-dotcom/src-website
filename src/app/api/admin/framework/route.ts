import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { DEFAULT_WEIGHTS, DEFAULT_THRESHOLDS } from "@/lib/cqr-score";

// GET /api/admin/framework
// Full editable framework for the admin UI: all domains + entries (incl. inactive)
// and the current published config (or code defaults if none published yet).
export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [domains, config, versions] = await Promise.all([
    prisma.worldviewDomain.findMany({
      orderBy: { sortOrder: "asc" },
      include: { entries: { orderBy: { createdAt: "asc" } } },
    }),
    prisma.frameworkConfig.findFirst({ where: { published: true }, orderBy: { version: "desc" } }),
    prisma.frameworkConfig.findMany({ orderBy: { version: "desc" }, take: 20 }),
  ]);

  return NextResponse.json({
    domains,
    config: config
      ? { version: config.version, weights: config.weights, thresholds: config.thresholds, flagRules: config.flagRules }
      : { version: 0, weights: DEFAULT_WEIGHTS, thresholds: DEFAULT_THRESHOLDS, flagRules: {} },
    versions: versions.map((v) => ({ version: v.version, published: v.published, note: v.note, createdAt: v.createdAt })),
  });
}
