import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

// POST /api/invitations/accept — public: accept an invitation.
// Creates the account (or applies access to an existing one) and the granted
// access, then marks the invitation accepted.
// Body: { token, name, password }
export async function POST(request: NextRequest) {
  try {
    const { token, name, password } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Invalid invitation." }, { status: 400 });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const invitation = await prisma.invitation.findUnique({ where: { token } });
    if (!invitation || invitation.status !== "pending" || invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: "This invitation is invalid or has expired." }, { status: 400 });
    }

    // Resolve the granted access from the invitation.
    let grantData: {
      grantType: string;
      grantedTierId: string | null;
      expiresAt: Date | null;
      isPermanent: boolean;
    } | null = null;

    if (invitation.grantType) {
      let grantedTierId: string | null = null;
      if (invitation.tierSlug) {
        const tier = await prisma.tier.findUnique({ where: { slug: invitation.tierSlug } });
        grantedTierId = tier?.id ?? null;
      }
      if (invitation.grantType === "complimentary_period") {
        const days = invitation.durationDays || 30;
        grantData = {
          grantType: "complimentary_period",
          grantedTierId,
          expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
          isPermanent: false,
        };
      } else {
        // free_tier
        grantData = { grantType: "free_tier", grantedTierId, expiresAt: null, isPermanent: true };
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const existing = await prisma.user.findUnique({ where: { email: invitation.email } });

    const userId = await prisma.$transaction(async (tx) => {
      let uid: string;
      if (existing) {
        // Existing account: keep their password, just record membership.
        uid = existing.id;
        await tx.user.update({
          where: { id: uid },
          data: grantData ? { isMember: true } : {},
        });
      } else {
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 10);
        const created = await tx.user.create({
          data: {
            email: invitation.email,
            name: name?.trim() || invitation.email.split("@")[0],
            passwordHash,
            trialStart: new Date(),
            trialEnd,
            isMember: !!grantData,
          },
        });
        uid = created.id;
      }

      if (grantData) {
        await tx.accessGrant.create({
          data: {
            userId: uid,
            grantType: grantData.grantType,
            grantedTierId: grantData.grantedTierId,
            startsAt: new Date(),
            expiresAt: grantData.expiresAt,
            isPermanent: grantData.isPermanent,
            grantedBy: "invitation",
            reason: invitation.reason || "Invitation grant",
            status: "active",
          },
        });
      }

      await tx.invitation.update({
        where: { id: invitation.id },
        data: { status: "accepted", acceptedAt: new Date() },
      });

      return uid;
    });

    return NextResponse.json({ ok: true, existing: !!existing, userId });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json({ error: "Could not accept invitation. Please try again." }, { status: 500 });
  }
}
