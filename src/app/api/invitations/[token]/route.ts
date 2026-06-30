import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/invitations/[token] — public: validate an invitation token so the
// accept page can show the email + what's being granted.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const invitation = await prisma.invitation.findUnique({ where: { token } });

  if (!invitation || invitation.status !== "pending" || invitation.expiresAt < new Date()) {
    return NextResponse.json({ valid: false });
  }

  let tierName: string | null = null;
  if (invitation.tierSlug) {
    const tier = await prisma.tier.findUnique({
      where: { slug: invitation.tierSlug },
      select: { name: true },
    });
    tierName = tier?.name ?? null;
  }

  return NextResponse.json({
    valid: true,
    email: invitation.email,
    grantType: invitation.grantType,
    tierName,
    durationDays: invitation.durationDays,
  });
}
