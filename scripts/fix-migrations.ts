#!/usr/bin/env tsx
/**
 * Pre-build fix: ensure _prisma_migrations exists and mark already-applied
 * migrations so that prisma migrate deploy does not try to re-run them.
 *
 * This handles the case where the DB was restored from a dump that omitted
 * the _prisma_migrations table (e.g. collision recovery).
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Check if _prisma_migrations exists
    const check = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = '_prisma_migrations'
      ) as exists
    `);

    const hasTable = check[0]?.exists ?? false;

    if (!hasTable) {
      console.log("[_prisma_migrations] missing — creating and seeding...");

      await prisma.$executeRawUnsafe(`
        CREATE TABLE "_prisma_migrations" (
          "id" VARCHAR(36) PRIMARY KEY,
          "checksum" VARCHAR(64) NOT NULL,
          "finished_at" TIMESTAMP(3) WITH TIME ZONE,
          "migration_name" VARCHAR(255) NOT NULL UNIQUE,
          "logs" TEXT,
          "rolled_back_at" TIMESTAMP(3) WITH TIME ZONE,
          "started_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "applied_steps_count" INTEGER NOT NULL DEFAULT 0
        );
      `);

      const migrations = [
        "0_init",
        "20250630140000_add_design_signoff",
        "20250630145000_add_content_code",
      ];

      for (const name of migrations) {
        await prisma.$executeRawUnsafe(`
          INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "applied_steps_count")
          VALUES (gen_random_uuid(), 'manual-fix', NOW(), '${name}', 1)
          ON CONFLICT ("migration_name") DO NOTHING;
        `);
      }

      console.log("[_prisma_migrations] seeded.");
    } else {
      console.log("[_prisma_migrations] already exists.");
    }

    // 2. Ensure missing columns exist (idempotent)
    const addIfMissing = async (col: string, type: string) => {
      try {
        await prisma.$executeRawUnsafe(
          `ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "${col}" ${type};`
        );
        console.log(`[Report.${col}] ensured.`);
      } catch (e: unknown) {
        console.error(`[Report.${col}] failed:`, e instanceof Error ? e.message : String(e));
      }
    };

    await addIfMissing("designSignedOffBy", "TEXT");
    await addIfMissing("designSignedOffAt", "TIMESTAMP(3)");
    await addIfMissing("code", "TEXT");

    console.log("Pre-build DB fix complete.");
  } catch (error: unknown) {
    console.error("Pre-build DB fix failed:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
