import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/db";
import { briefEmailHtml, briefEmailText } from "@/lib/brief-email";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://www.src-advisory.ch";
const FROM_EMAIL = process.env.BRIEF_FROM_EMAIL ?? "brief@src-advisory.ch";
const BATCH_SIZE = 90; // Resend batch limit is 100; stay under it

// Vercel calls cron routes with an Authorization: Bearer <CRON_SECRET> header.
// If CRON_SECRET is not set we allow only in non-production (local dev testing).
function authorised(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorised(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
  }

  // Fetch today's Daily Brief (published in the last 24 hours, most recent)
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const brief = await prisma.report.findFirst({
    where: {
      type: "Daily Brief",
      status: "published",
      publishedAt: { gte: since },
    },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true, title: true, summary: true, content: true,
      publishedAt: true, minTierId: true,
    },
  });

  if (!brief || !brief.publishedAt) {
    return NextResponse.json({ skipped: true, reason: "No Daily Brief published today" });
  }

  // Resolve the Essential tier's sortOrder so we can gate per-user
  const essentialTier = await prisma.tier.findFirst({
    where: { slug: "essential" },
    select: { sortOrder: true },
  });
  const essentialSort = essentialTier?.sortOrder ?? 1;

  // Fetch all users with an email who haven't opted out, including their
  // effective tier. We use currentTierId + the most recently active subscription
  // to determine sortOrder inline rather than calling getUserTier() per-user.
  type UserRow = {
    id: string;
    email: string;
    name: string | null;
    languagePref: string;
    tierSort: number | null;
  };
  const users = await prisma.$queryRaw<UserRow[]>`
    SELECT
      u.id,
      u.email,
      u.name,
      u."languagePref",
      COALESCE(
        ct."sortOrder",
        (
          SELECT t2."sortOrder"
          FROM "Subscription" s
          JOIN "Tier" t2 ON t2.id = s."tierId"
          WHERE s."userId" = u.id
            AND s.status = 'active'
            AND s."currentPeriodEnd" >= NOW()
          ORDER BY t2."sortOrder" DESC
          LIMIT 1
        ),
        0
      ) AS "tierSort"
    FROM "User" u
    LEFT JOIN "Tier" ct ON ct.id = u."currentTierId"
    WHERE u."briefEmailOptOut" = false
      AND u.email IS NOT NULL
      AND u.email <> ''
  `;

  if (users.length === 0) {
    return NextResponse.json({ sent: 0, reason: "No subscribers" });
  }

  const resend = new Resend(apiKey);
  let sent = 0;
  let failed = 0;

  // Split users into batches and send via Resend batch API
  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);

    const emails = batch.map((user) => {
      const tierSort = user.tierSort ?? 0;
      const accessLevel: "full" | "preview" = tierSort >= essentialSort ? "full" : "preview";
      const lang = ["en", "de", "fr", "it"].includes(user.languagePref) ? user.languagePref : "en";

      return {
        from: `SRC Daily Brief <${FROM_EMAIL}>`,
        to: user.email,
        subject: brief.title,
        html: briefEmailHtml({
          title: brief.title,
          publishedAt: brief.publishedAt!,
          summary: brief.summary,
          content: brief.content,
          accessLevel,
          userId: user.id,
          lang,
          siteUrl: SITE_URL,
        }),
        text: briefEmailText({
          title: brief.title,
          publishedAt: brief.publishedAt!,
          summary: brief.summary,
          content: brief.content,
          accessLevel,
          lang,
          siteUrl: SITE_URL,
          userId: user.id,
        }),
      };
    });

    try {
      await resend.batch.send(emails);
      sent += batch.length;
    } catch (e) {
      console.error(`[daily-brief cron] batch ${i}–${i + BATCH_SIZE} failed:`, e);
      failed += batch.length;
    }
  }

  console.log(`[daily-brief cron] sent=${sent} failed=${failed} briefId=${brief.id}`);
  return NextResponse.json({ sent, failed, briefId: brief.id });
}
