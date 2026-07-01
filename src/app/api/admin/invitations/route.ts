import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma, logAdminAction } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin-auth";
import { sendEmail, buildInvitationEmail } from "@/lib/email";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const VALID_GRANT_TYPES = ["free_tier", "complimentary_period"];

function getBaseUrl(req: NextRequest): string {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL.replace(/\/$/, "");
  const origin = req.headers.get("origin");
  if (origin) return origin.replace(/\/$/, "");
  const host = req.headers.get("host");
  return host ? `https://${host}` : "https://www.src-advisory.ch";
}

// GET /api/admin/invitations — list invitations (newest first)
export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const invitations = await prisma.invitation.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ invitations });
}

// POST /api/admin/invitations — create an invitation and email it
// Body: { email, grantType?, tierSlug?, durationDays?, reason?, lang? }
export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { email, grantType, tierSlug, durationDays, reason, lang } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }
    const normalizedEmail = email.trim().toLowerCase();

    if (grantType && !VALID_GRANT_TYPES.includes(grantType)) {
      return NextResponse.json(
        { error: `grantType must be one of: ${VALID_GRANT_TYPES.join(", ")}` },
        { status: 400 }
      );
    }
    if (grantType && tierSlug) {
      const tier = await prisma.tier.findUnique({ where: { slug: tierSlug } });
      if (!tier) return NextResponse.json({ error: "Tier not found" }, { status: 404 });
    }

    // Supersede any outstanding pending invite for this email.
    await prisma.invitation.updateMany({
      where: { email: normalizedEmail, status: "pending" },
      data: { status: "revoked" },
    });

    const token = randomBytes(32).toString("hex");
    const invitation = await prisma.invitation.create({
      data: {
        email: normalizedEmail,
        token,
        grantType: grantType || null,
        tierSlug: tierSlug || null,
        durationDays: grantType === "complimentary_period" ? parseInt(String(durationDays), 10) || 30 : null,
        reason: reason?.trim() || null,
        invitedBy: "admin",
        status: "pending",
        expiresAt: new Date(Date.now() + INVITE_TTL_MS),
      },
    });

    const inviteUrl = `${getBaseUrl(request)}/invite/${token}`;
    const { subject, html } = buildInvitationEmail(inviteUrl, lang || "en");
    const result = await sendEmail({ to: normalizedEmail, subject, html });

    let actor = "admin";
    try {
      const session = await getServerSession(authOptions);
      actor = session?.user?.email || "admin";
    } catch {
      /* keep default */
    }
    await logAdminAction({
      actor,
      action: "invitation_sent",
      targetType: "invitation",
      targetId: invitation.id,
      detail: normalizedEmail,
    });

    return NextResponse.json(
      {
        id: invitation.id,
        email: invitation.email,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        emailSent: result.ok,
        // Surfaced so the admin can copy the link if email delivery is unavailable.
        inviteUrl,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating invitation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
