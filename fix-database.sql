-- SRC Website Database Fix for SRC-519
-- Issue: Prisma schema mismatch - missing columns in Report table
-- Root cause: Migrations were committed but not applied to production database

-- Step 1: Add missing columns to Report table (idempotent - safe to run multiple times)
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "designSignedOffBy" TEXT;
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "designSignedOffAt" TIMESTAMP(3);
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "code" TEXT;

-- Step 2: Create _prisma_migrations table if it doesn't exist (tracks migration state)
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) PRIMARY KEY,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMP(3) WITH TIME ZONE,
    "migration_name" VARCHAR(255) NOT NULL UNIQUE,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMP(3) WITH TIME ZONE,
    "started_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);

-- Step 3: Record migrations as applied so Prisma doesn't try to re-run them
INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "applied_steps_count")
VALUES
    (gen_random_uuid(), 'manual-fix', NOW(), '0_init', 1),
    (gen_random_uuid(), 'manual-fix', NOW(), '20250630140000_add_design_signoff', 1),
    (gen_random_uuid(), 'manual-fix', NOW(), '20250630145000_add_content_code', 1)
ON CONFLICT ("migration_name") DO NOTHING;

-- Step 4: Verify the fix
SELECT
    (SELECT COUNT(*) FROM "Report") as total_reports,
    (SELECT COUNT(*) FROM "Report" WHERE "status" = 'published') as published_count,
    (SELECT COUNT(*) FROM "Report" WHERE "status" = 'pending') as pending_count,
    (SELECT COUNT(*) FROM "Report" WHERE "status" = 'rejected') as rejected_count,
    (SELECT COUNT(*) FROM "Report" WHERE "code" IS NOT NULL) as reports_with_code,
    (SELECT COUNT(*) FROM "Report" WHERE "designSignedOffBy" IS NOT NULL) as design_signed_off_count;
