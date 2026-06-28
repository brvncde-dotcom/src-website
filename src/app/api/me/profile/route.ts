import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getAuthUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  return user;
}

// GET /api/me/profile — Return user profile + subscriptions
export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profileData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        organization: true,
        country: true,
        languagePref: true,
        marketingConsent: true,
        currentTierId: true,
        trialEnd: true,
        isMember: true,
        currentTier: {
          select: { id: true, slug: true, name: true },
        },
        subscriptions: {
          where: { status: "active" },
          orderBy: { currentPeriodEnd: "desc" },
          select: {
            id: true,
            status: true,
            billingInterval: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
            cancelAtPeriodEnd: true,
            amountChf: true,
            tier: { select: { id: true, slug: true, name: true } },
          },
        },
      },
    });

    if (!profileData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Serialize Decimal to string
    const serialized = {
      ...profileData,
      subscriptions: profileData.subscriptions.map((sub) => ({
        ...sub,
        amountChf: sub.amountChf.toString(),
      })),
    };

    return NextResponse.json(serialized);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/me/profile — Update user profile fields
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, organization, country, phone } = body;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name !== undefined && { name: name || null }),
        ...(organization !== undefined && { organization: organization || null }),
        ...(country !== undefined && { country: country || null }),
        ...(phone !== undefined && { phone: phone || null }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        organization: true,
        country: true,
        languagePref: true,
        marketingConsent: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}