import { NextRequest, NextResponse } from "next/server";
import { prisma, validateIngestionKey } from "@/lib/db";

export async function POST(request: NextRequest) {
  if (!validateIngestionKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, section } = body;

    // Step 1: Create report
    const report = await prisma.report.create({
      data: {
        title: title?.trim() || "Debug test",
        section: section || "digital-power-ai",
        status: "pending",
      },
    });

    // Step 2: Immediate verify
    const immediate = await prisma.report.findUnique({
      where: { id: report.id },
    });

    // Step 3: Wait and verify again
    await new Promise((r) => setTimeout(r, 3000));
    const delayed = await prisma.report.findUnique({
      where: { id: report.id },
    });

    // Step 4: List count
    const count = await prisma.report.count();

    // Step 5: Clean up
    try {
      await prisma.report.delete({ where: { id: report.id } });
    } catch {}

    return NextResponse.json({
      created: report,
      immediateFound: !!immediate,
      delayedFound: !!delayed,
      totalCount: count,
    });
  } catch (error: any) {
    console.error("diag-post error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
