import { NextResponse } from "next/server";
import { prisma, VALID_SECTIONS, VALID_LANGUAGES, validateAdminKey } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const results: Record<string, unknown> = {};

  // Basic queries
  try {
    const count = await prisma.report.count({ where: { status: "published" } });
    results.count = count;
  } catch (err: unknown) {
    results.countError = err instanceof Error ? err.message : String(err);
  }

  try {
    const group = await prisma.report.groupBy({
      by: ["section"],
      where: { status: "published" },
      _count: { id: true },
    });
    results.groupBy = group;
  } catch (err: unknown) {
    results.groupByError = err instanceof Error ? err.message : String(err);
  }

  try {
    const findOne = await prisma.report.findFirst({
      where: { status: "published" },
      select: { id: true, title: true },
    });
    results.findFirst = findOne;
  } catch (err: unknown) {
    results.findFirstError = err instanceof Error ? err.message : String(err);
  }

  try {
    const findMany = await prisma.report.findMany({
      where: { status: "published" },
      take: 1,
      select: { id: true, title: true, publishedAt: true },
    });
    results.findMany = findMany;
  } catch (err: unknown) {
    results.findManyError = err instanceof Error ? err.message : String(err);
  }

  try {
    const findUnique = await prisma.report.findUnique({
      where: { id: "cmqz7lqfz0000ib04axb4go6t" },
      select: { id: true, title: true },
    });
    results.findUnique = findUnique;
  } catch (err: unknown) {
    results.findUniqueError = err instanceof Error ? err.message : String(err);
  }

  try {
    const raw = await prisma.$queryRawUnsafe(
      `SELECT id, title, "publishedAt" FROM "Report" WHERE status = 'published' LIMIT 1`
    );
    results.rawQuery = raw;
  } catch (err: unknown) {
    results.rawQueryError = err instanceof Error ? err.message : String(err);
  }

  // Exact replica of /api/reports GET query
  try {
    const select = {
      id: true,
      title: true,
      summary: true,
      type: true,
      section: true,
      status: true,
      language: true,
      sourceRef: true,
      author: true,
      code: true,
      publishedAt: true,
      createdAt: true,
    };
    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where: { status: "published" },
        orderBy: { publishedAt: "desc" },
        take: 2,
        skip: 0,
        select,
      }),
      prisma.report.count({ where: { status: "published" } }),
    ]);
    results.exactReportsQuery = { reports, total };
  } catch (err: unknown) {
    results.exactReportsQueryError = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json(results);
}
