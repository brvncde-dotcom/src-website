import { NextRequest, NextResponse } from "next/server";
import { prisma, validateAdminKey } from "@/lib/db";

export async function GET(request: NextRequest) {
  if (!validateAdminKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check for triggers on Report table
    const triggers = await prisma.$queryRaw`
      SELECT tgname, tgtype, proname
      FROM pg_trigger t
      JOIN pg_proc p ON t.tgfoid = p.oid
      WHERE t.tgrelid = '"Report"'::regclass
      AND NOT tgisinternal
    `;

    // Check for rules on Report table
    const rules = await prisma.$queryRaw`
      SELECT rulename, definition
      FROM pg_rules
      WHERE schemaname = 'public' AND tablename = 'Report'
    `;

    // Check table definition
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'Report' AND table_schema = 'public'
      ORDER BY ordinal_position
    `;

    // Check if the table is actually a view or foreign table
    const tableKind = await prisma.$queryRaw`
      SELECT c.relkind, c.relname
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = 'Report' AND n.nspname = 'public'
    `;

    // Test write + immediate read + delayed read
    const testReport = await prisma.report.create({
      data: {
        title: "DIAG-TEST",
        section: "digital-power-ai",
        type: "Brief",
        content: "diagnostic test",
      },
    });

    const immediate = await prisma.report.findUnique({ where: { id: testReport.id } });

    // Raw SQL immediate check
    const rawImmediate = await prisma.$queryRaw`
      SELECT id, title FROM "Report" WHERE id = ${testReport.id}
    `;

    // Wait 2 seconds and check again
    await new Promise((r) => setTimeout(r, 2000));

    const delayed = await prisma.report.findUnique({ where: { id: testReport.id } });
    const rawDelayed = await prisma.$queryRaw`
      SELECT id, title FROM "Report" WHERE id = ${testReport.id}
    `;

    // Clean up test report if it exists
    try {
      await prisma.report.delete({ where: { id: testReport.id } });
    } catch {
      // already gone
    }

    return NextResponse.json({
      triggers,
      rules,
      columns,
      tableKind,
      testId: testReport.id,
      immediate: !!immediate,
      rawImmediate: (rawImmediate as any[]).length > 0,
      delayed: !!delayed,
      rawDelayed: (rawDelayed as any[]).length > 0,
    });
  } catch (error) {
    console.error("Diag error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
