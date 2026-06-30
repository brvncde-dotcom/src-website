import { NextRequest, NextResponse } from "next/server";
import { prisma, logAdminAction } from "@/lib/db";
import { sendEmail, buildGrantExpiringEmail, buildGrantExpiredEmail } from "@/lib/email";

const REMINDER_WINDOW_DAYS = 7;

function tierName(grant: { tier?: { name: string } | null }) {
  return grant.tier?.name || "membership";
}

// GET /api/cron/expire-grants — daily maintenance (Vercel Cron).
// Secured by CRON_SECRET (Vercel sends it as a Bearer token for scheduled runs).
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const summary = { expiredGrants: 0, reminded: 0, expiredInvitations: 0 };

  try {
    // 1. Expire grants whose time is up.
    const toExpire = await prisma.accessGrant.findMany({
      where: { status: "active", isPermanent: false, expiresAt: { lt: now } },
      select: { id: true, user: { select: { email: true } }, tier: { select: { name: true } } },
    });
    for (const g of toExpire) {
      await prisma.accessGrant.update({ where: { id: g.id }, data: { status: "expired" } });
      summary.expiredGrants++;
      await logAdminAction({ actor: "system", action: "grant_expired", targetType: "grant", targetId: g.id });
      if (g.user?.email) {
        const { subject, html } = buildGrantExpiredEmail({ tierName: tierName(g) });
        await sendEmail({ to: g.user.email, subject, html });
      }
    }

    // 2. Remind for grants expiring within the window (once).
    const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const toRemind = await prisma.accessGrant.findMany({
      where: {
        status: "active",
        isPermanent: false,
        reminderSentAt: null,
        expiresAt: { gt: now, lte: windowEnd },
      },
      select: { id: true, expiresAt: true, user: { select: { email: true } }, tier: { select: { name: true } } },
    });
    for (const g of toRemind) {
      await prisma.accessGrant.update({ where: { id: g.id }, data: { reminderSentAt: now } });
      summary.reminded++;
      if (g.user?.email && g.expiresAt) {
        const { subject, html } = buildGrantExpiringEmail({
          tierName: tierName(g),
          expiresOn: g.expiresAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
        });
        await sendEmail({ to: g.user.email, subject, html });
      }
    }

    // 3. Expire stale pending invitations.
    const inv = await prisma.invitation.updateMany({
      where: { status: "pending", expiresAt: { lt: now } },
      data: { status: "expired" },
    });
    summary.expiredInvitations = inv.count;

    return NextResponse.json({ ok: true, ...summary, ranAt: now.toISOString() });
  } catch (error) {
    console.error("Error in expire-grants cron:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
