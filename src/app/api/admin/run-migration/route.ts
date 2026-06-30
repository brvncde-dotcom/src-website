import { NextRequest, NextResponse } from "next/server";
import { prisma, validateAdminKey } from "@/lib/db";

// One-time admin endpoint to apply missing column migrations when the
// _prisma_migrations table is absent (DB was restored without it).
// Run this once, then remove the file.
export async function POST(request: NextRequest) {
  if (!validateAdminKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Add design sign-off columns (from 20250630140000_add_design_signoff)
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "designSignedOffBy" TEXT;`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "designSignedOffAt" TIMESTAMP(3);`
    );

    // Add content code column (from 20250630145000_add_content_code)
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "code" TEXT;`
    );

    // Re-create _prisma_migrations table so future prisma migrate deploy runs work
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        "id" VARCHAR(36) PRIMARY KEY,
        "checksum" VARCHAR(64) NOT NULL,
        "finished_at" TIMESTAMP(3) WITH TIME ZONE,
        "migration_name" VARCHAR(255) NOT NULL,
        "logs" TEXT,
        "rolled_back_at" TIMESTAMP(3) WITH TIME ZONE,
        "started_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "applied_steps_count" INTEGER NOT NULL DEFAULT 0
      );
    `);

    // Mark existing migrations as applied so prisma migrate deploy won't try to re-run them
    const migrations = [
      "0_init",
      "20250630140000_add_design_signoff",
      "20250630145000_add_content_code",
    ];

    for (const name of migrations) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "applied_steps_count")
        VALUES (gen_random_uuid(), 'manual', NOW(), '${name}', 1)
        ON CONFLICT ("migration_name") DO NOTHING;
      `);
    }

    return NextResponse.json({
      success: true,
      message: "Missing columns added and _prisma_migrations seeded. Future builds will use prisma migrate deploy normally.",
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Migration run failed:", error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
