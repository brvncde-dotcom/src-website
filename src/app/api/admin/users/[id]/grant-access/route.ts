import { NextRequest, NextResponse } from "next/server";
import { prisma, logAdminAction } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin-auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Best-effort acting-admin email (the session cookie rides along even though
// auth is via the admin key). Falls back to a generic "admin" for API callers.
async function adminActor(): Promise<string> {
  try {
    const session = await getServerSession(authOptions);
    return session?.user?.email || "admin";
  } catch {
    return "admin";
  }
}

// POST /api/admin/users/[id]/grant-access — Create an AccessGrant
// Body: { grantType, tierSlug?, durationDays?, reason }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { grantType, tierSlug, durationDays, reason } = body;

    // Validate required fields
    if (!grantType) {
      return NextResponse.json(
        { error: "grantType is required" },
        { status: 400 }
      );
    }

    const validGrantTypes = ["free_tier", "complimentary_period", "content_unlock"];
    if (!validGrantTypes.includes(grantType)) {
      return NextResponse.json(
        { error: `grantType must be one of: ${validGrantTypes.join(", ")}` },
        { status: 400 }
      );
    }

    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      return NextResponse.json(
        { error: "reason is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build the grant data
    let grantedTierId: string | null = null;
    let expiresAt: Date | null = null;
    let isPermanent = false;
    const now = new Date();

    if (grantType === "free_tier") {
      // Must specify a tier
      if (!tierSlug) {
        return NextResponse.json(
          { error: "tierSlug is required for free_tier grant type" },
          { status: 400 }
        );
      }

      const tier = await prisma.tier.findUnique({ where: { slug: tierSlug } });
      if (!tier) {
        return NextResponse.json({ error: "Tier not found" }, { status: 404 });
      }

      grantedTierId = tier.id;
      isPermanent = true; // Free tier grants don't expire unless specified
    }

    if (grantType === "complimentary_period") {
      // Optionally specify a tier
      if (tierSlug) {
        const tier = await prisma.tier.findUnique({ where: { slug: tierSlug } });
        if (!tier) {
          return NextResponse.json({ error: "Tier not found" }, { status: 404 });
        }
        grantedTierId = tier.id;
      }

      // Calculate expiration
      const days = durationDays ? parseInt(String(durationDays), 10) : 30;
      if (isNaN(days) || days < 1) {
        return NextResponse.json(
          { error: "durationDays must be a positive integer" },
          { status: 400 }
        );
      }

      expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    }

    if (grantType === "content_unlock") {
      // Content unlock doesn't need a tier
      isPermanent = true;
    }

    const grant = await prisma.accessGrant.create({
      data: {
        userId: id,
        grantType,
        grantedTierId,
        startsAt: now,
        expiresAt,
        isPermanent,
        grantedBy: "admin",
        reason: reason.trim(),
        status: "active",
      },
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
    });

    await logAdminAction({
      actor: await adminActor(),
      action: "grant_created",
      targetType: "user",
      targetId: id,
      detail: `${grantType}${tierSlug ? " · " + tierSlug : ""}`,
    });

    return NextResponse.json(
      {
        ...grant,
        message: "Access grant created successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating access grant:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users/[id]/grant-access — manage an existing grant
// Body: { grantId, action: "revoke" | "extend", durationDays? }
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { grantId, action, durationDays } = await request.json();

    if (!grantId || !action) {
      return NextResponse.json({ error: "grantId and action are required" }, { status: 400 });
    }

    const grant = await prisma.accessGrant.findUnique({ where: { id: grantId } });
    if (!grant || grant.userId !== id) {
      return NextResponse.json({ error: "Grant not found" }, { status: 404 });
    }

    if (action === "revoke") {
      const updated = await prisma.accessGrant.update({
        where: { id: grantId },
        data: { status: "revoked" },
      });
      await logAdminAction({ actor: await adminActor(), action: "grant_revoked", targetType: "user", targetId: id });
      return NextResponse.json({ ...updated, message: "Access grant revoked." });
    }

    if (action === "extend") {
      const days = parseInt(String(durationDays), 10);
      if (!days || days < 1) {
        return NextResponse.json({ error: "durationDays must be a positive number" }, { status: 400 });
      }
      // Extend from the later of "now" or the current expiry, so a still-active
      // grant gets days added rather than reset.
      const now = new Date();
      const base = grant.expiresAt && grant.expiresAt > now ? grant.expiresAt : now;
      const expiresAt = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
      const updated = await prisma.accessGrant.update({
        where: { id: grantId },
        data: { expiresAt, isPermanent: false, status: "active" },
      });
      await logAdminAction({ actor: await adminActor(), action: "grant_extended", targetType: "user", targetId: id, detail: `+${days}d` });
      return NextResponse.json({ ...updated, message: "Access grant extended." });
    }

    return NextResponse.json({ error: "action must be 'revoke' or 'extend'" }, { status: 400 });
  } catch (error) {
    console.error("Error updating access grant:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}