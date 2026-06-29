import { NextRequest, NextResponse } from "next/server";
import { prisma, validateAdminKey } from "@/lib/db";
import { randomUUID } from "crypto";

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

    // Check for RLS policies
    const rls = await prisma.$queryRaw`
      SELECT polname, polcmd, polpermissive
      FROM pg_policy
      WHERE polrelid = '"Report"'::regclass
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

    // Test Prisma create
    const testId1 = randomUUID();
    const prismaReport = await prisma.report.create({
      data: {
        id: testId1,
        title: "PRISMA-TEST",
        section: "digital-power-ai",
        type: "Brief",
        content: "prisma create test",
      },
    });
    const prismaImmediate = await prisma.report.findUnique({ where: { id: testId1 } });

    // Test raw SQL insert
    const testId2 = randomUUID();
    await prisma.$queryRaw`
      INSERT INTO "Report" (id, title, section, type, content, status, language)
      VALUES (${testId2}, 'RAW-TEST', 'digital-power-ai', 'Brief', 'raw sql test', 'pending', 'en')
    `;
    const rawImmediate = await prisma.$queryRaw`
      SELECT id, title FROM "Report" WHERE id = ${testId2}
    `;

    // Wait 2 seconds and check again
    await new Promise((r) => setTimeout(r, 2000));

    const prismaDelayed = await prisma.report.findUnique({ where: { id: testId1 } });
    const rawDelayed = await prisma.$queryRaw`
      SELECT id, title FROM "Report" WHERE id = ${testId2}
    `;

    // Clean up test reports if they exist
    try { await prisma.report.delete({ where: { id: testId1 } }); } catch {}
    try { await prisma.report.delete({ where: { id: testId2 } }); } catch {}

    return NextResponse.json({
      triggers,
      rules,
      rls,
      columns,
      tableKind,
      prismaTest: { id: testId1, immediate: !!prismaImmediate, delayed: !!prismaDelayed },
      rawTest: { id: testId2, immediate: (rawImmediate as any[]).length > 0, delayed: (rawDelayed as any[]).length > 0 },
    });
  } catch (error) {
    console.error("Diag error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
