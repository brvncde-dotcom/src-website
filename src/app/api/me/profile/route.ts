import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, getUserTier } from "@/lib/db";

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
        image: true,
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

    // Effective tier resolves currentTier > active subscription > active
    // grant > observer — so comp/invited members see their real plan even
    // when currentTierId is null.
    const effectiveTier = await getUserTier(user.id);

    // Serialize Decimal to string
    const serialized = {
      ...profileData,
      effectiveTier: effectiveTier
        ? { id: effectiveTier.id, slug: effectiveTier.slug, name: effectiveTier.name }
        : null,
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
    const { name, organization, country, phone, image } = body;

    // Profile picture: accept a small image data URL, or "" / null to remove.
    // Guard against oversized payloads and non-image data (~300KB cap covers a
    // 256px square JPEG comfortably; the client already downscales).
    let imageUpdate: { image: string | null } | undefined;
    if (image !== undefined) {
      if (image === null || image === "") {
        imageUpdate = { image: null };
      } else if (
        typeof image === "string" &&
        image.startsWith("data:image/") &&
        image.length <= 300_000
      ) {
        imageUpdate = { image };
      } else {
        return NextResponse.json(
          { error: "Invalid image. Provide a small image (max ~200KB) or clear it." },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name !== undefined && { name: name || null }),
        ...(organization !== undefined && { organization: organization || null }),
        ...(country !== undefined && { country: country || null }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(imageUpdate ?? {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
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