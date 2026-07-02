/**
 * Seed the SRC-CQR Worldview Matrix v1.0 + FrameworkConfig v1 (CLI).
 * Prod DB URLs are masked by `vercel env pull`, so on prod use the admin
 * endpoint POST /api/admin/framework/seed instead. This CLI targets local/dev.
 *
 * Run:  set -a && . ./.env.local && set +a && npx tsx scripts/seed-cqr.ts
 */
import { PrismaClient } from "@prisma/client";
import { seedFramework } from "../src/lib/cqr-seed-data";

const prisma = new PrismaClient();

seedFramework(prisma)
  .then((r) => console.log(`Seeded ${r.domains} domains, ${r.entries} entries, FrameworkConfig v1 (published).`))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
