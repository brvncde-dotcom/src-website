import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ authenticated: false });
  }

  const trialEnd = (session.user as Record<string, unknown>).trialEnd as string | undefined;
  const isMember = (session.user as Record<string, unknown>).isMember as boolean | undefined;

  const hasAccess = isMember === true || (trialEnd && new Date(trialEnd) > new Date());

  return NextResponse.json({
    authenticated: true,
    user: {
      email: session.user.email,
      name: session.user.name,
      isMember: isMember ?? false,
      trialEnd: trialEnd ?? null,
      trialDaysRemaining: trialEnd
        ? Math.max(0, Math.ceil((new Date(trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0,
      hasAccess,
    },
  });
}