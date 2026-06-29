import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { sendEmail, buildPasswordResetEmail } from "@/lib/email";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 60 minutes

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function getBaseUrl(req: NextRequest): string {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL.replace(/\/$/, "");
  const origin = req.headers.get("origin");
  if (origin) return origin.replace(/\/$/, "");
  const host = req.headers.get("host");
  return host ? `https://${host}` : "https://www.src-advisory.ch";
}

export async function POST(req: NextRequest) {
  try {
    const { email, lang } = await req.json();

    // Always return the same response regardless of whether the account exists,
    // to avoid leaking which emails are registered (account enumeration).
    const genericOk = NextResponse.json({ ok: true });

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return genericOk;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, email: true, languagePref: true },
    });

    if (!user) return genericOk;

    // Invalidate any outstanding tokens for this user before issuing a new one.
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });

    const token = randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      },
    });

    const resetUrl = `${getBaseUrl(req)}/reset-password?token=${token}`;
    const language = (lang as string) || user.languagePref || "en";
    const { subject, html } = buildPasswordResetEmail(resetUrl, language);

    const result = await sendEmail({ to: user.email, subject, html });
    if (!result.ok) {
      // In non-production, log the link so the flow is testable without email set up.
      if (process.env.NODE_ENV !== "production") {
        console.log("[forgot-password] reset link (dev):", resetUrl);
      }
      // Still return ok to the client — do not expose mail-delivery state.
    }

    return genericOk;
  } catch (error) {
    console.error("Forgot-password error:", error);
    // Even on error, avoid leaking details.
    return NextResponse.json({ ok: true });
  }
}
