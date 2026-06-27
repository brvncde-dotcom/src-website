import { NextRequest, NextResponse } from "next/server";
import { prisma, validateAdminKey } from "@/lib/db";

// GET /api/admin/users/[id] — Full user profile with subscription, grants, saved content count
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateAdminKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isMember: true,
        currentTierId: true,
        trialStart: true,
        trialEnd: true,
        phone: true,
        organization: true,
        country: true,
        languagePref: true,
        marketingConsent: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        createdAt: true,
        updatedAt: true,
        currentTier: {
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            priceMonthlyChf: true,
            priceAnnualChf: true,
          },
        },
        subscriptions: {
          select: {
            id: true,
            status: true,
            billingInterval: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
            cancelAtPeriodEnd: true,
            amountChf: true,
            stripeStatus: true,
            tier: {
              select: {
                id: true,
                slug: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        accessGrants: {
          select: {
            id: true,
            grantType: true,
            startsAt: true,
            expiresAt: true,
            isPermanent: true,
            grantedBy: true,
            reason: true,
            status: true,
            createdAt: true,
            tier: {
              select: {
                id: true,
                slug: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            subscriptions: true,
            accessGrants: true,
            savedContents: true,
            contentShares: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Determine effective access type
    const hasActiveSubscription = user.subscriptions.some(
      (s) => s.status === "active" && new Date(s.currentPeriodEnd) > new Date()
    );
    const hasActiveGrant = user.accessGrants.some(
      (g) =>
        g.status === "active" &&
        (g.isPermanent || !g.expiresAt || new Date(g.expiresAt) > new Date())
    );
    const hasTrial = user.trialEnd && new Date(user.trialEnd) > new Date();

    let accessType = "none";
    if (hasActiveSubscription) accessType = "subscription";
    else if (hasActiveGrant) accessType = "grant";
    else if (hasTrial) accessType = "trial";

    return NextResponse.json({
      ...user,
      accessType,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users/[id] — Update user fields or change tier
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateAdminKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { field, tierSlug, value } = body;

    if (!field) {
      return NextResponse.json(
        { error: "field is required" },
        { status: 400 }
      );
    }

    // Verify user exists
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (field === "tier") {
      if (!tierSlug) {
        return NextResponse.json(
          { error: "tierSlug is required when field is 'tier'" },
          { status: 400 }
        );
      }

      const tier = await prisma.tier.findUnique({ where: { slug: tierSlug } });
      if (!tier) {
        return NextResponse.json({ error: "Tier not found" }, { status: 404 });
      }

      const updated = await prisma.user.update({
        where: { id },
        data: { currentTierId: tier.id, isMember: true },
        select: {
          id: true,
          email: true,
          name: true,
          currentTierId: true,
          isMember: true,
          currentTier: { select: { id: true, slug: true, name: true } },
        },
      });

      return NextResponse.json({
        ...updated,
        message: `User tier updated to ${tier.name}.`,
      });
    }

    if (field === "role") {
      if (!value) {
        return NextResponse.json(
          { error: "value is required when field is 'role'" },
          { status: 400 }
        );
      }

      const validRoles = ["member", "admin", "editor"];
      if (!validRoles.includes(value)) {
        return NextResponse.json(
          { error: `role must be one of: ${validRoles.join(", ")}` },
          { status: 400 }
        );
      }

      const updated = await prisma.user.update({
        where: { id },
        data: { role: value },
        select: { id: true, email: true, name: true, role: true },
      });

      return NextResponse.json({
        ...updated,
        message: `User role updated to ${value}.`,
      });
    }

    if (field === "isMember") {
      const updated = await prisma.user.update({
        where: { id },
        data: { isMember: Boolean(value) },
        select: { id: true, email: true, name: true, isMember: true },
      });

      return NextResponse.json({
        ...updated,
        message: `User membership updated.`,
      });
    }

    // Generic field update for basic fields
    const allowedFields = [
      "name",
      "phone",
      "organization",
      "country",
      "languagePref",
    ];
    if (!allowedFields.includes(field)) {
      return NextResponse.json(
        { error: `Allowed fields: ${allowedFields.join(", ")}, tier, role, isMember` },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    updateData[field] = value;

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, email: true, name: true, [field]: true },
    });

    return NextResponse.json({
      ...updated,
      message: `User ${field} updated.`,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    if (errMsg.includes("Record to update not found")) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}