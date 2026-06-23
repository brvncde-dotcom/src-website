import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const counts = await prisma.report.groupBy({
      by: ["section"],
      where: { status: "published" },
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