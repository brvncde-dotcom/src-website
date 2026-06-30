import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const results: Record<string, unknown> = {};

  try {
    const migrations = await prisma.$queryRawUnsafe<
      { migration_name: string; finished_at: string | null }[]
    >(
      `SELECT migration_name, finished_at FROM "_prisma_migrations" ORDER BY migration_name`
    );
    results.migrations = migrations;
  } catch (err: unknown) {
    results.migrationsError = err instanceof Error ? err.message : String(err);
  }

  try {
    const cols = await prisma.$queryRawUnsafe<
      { column_name: string; data_type: string }[]
    >(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Report' ORDER BY column_name`
    );
    results.reportColumns = cols;
  } catch (err: unknown) {
    results.reportColumnsError = err instanceof Error ? err.message : String(err);
  }

  try {
    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where: { status: "published" },
        orderBy: { publishedAt: "desc" },
        take: 1,
        select: { id: true, title: true },
      }),
      prisma.report.count({ where: { status: "published" } }),
    ]);
    results.findManyNoCode = { reports, total };
  } catch (err: unknown) {
    results.findManyNoCodeError = err instanceof Error ? err.message : String(err);
  }

  try {
    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where: { status: "published" },
        orderBy: { publishedAt: "desc" },
        take: 1,
        select: { id: true, title: true, code: true },
      }),
      prisma.report.count({ where: { status: "published" } }),
    ]);
    results.findManyWithCode = { reports, total };
  } catch (err: unknown) {
    results.findManyWithCodeError = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json(results);
}
