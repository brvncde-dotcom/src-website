import { NextRequest, NextResponse } from "next/server";
import { prisma, VALID_LANGUAGES } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang");

  try {
    const where: Record<string, unknown> = { status: "published" };

    if (lang && VALID_LANGUAGES.includes(lang as typeof VALID_LANGUAGES[number])) {
      where.language = lang;
    }

    const counts = await prisma.report.groupBy({
      by: ["section"],
      where,
      _count: { id: true },
    });

    const total = counts.reduce((sum, c) => sum + c._count.id, 0);

    const bySection: Record<string, number> = {};
    for (const c of counts) {
      bySection[c.section] = c._count.id;
    }

    return NextResponse.json({ total, bySection });
  } catch {
    return NextResponse.json({ total: 0, bySection: {} });
  }
}
