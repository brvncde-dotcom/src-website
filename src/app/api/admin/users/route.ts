import { NextRequest, NextResponse } from "next/server";
import { prisma, validateAdminKey } from "@/lib/db";

// GET /api/admin/users — List all users (paginated)
// Query params: ?search=, ?tier=, ?role=, ?status=, ?limit=50, ?offset=0
export async function GET(request: NextRequest) {
  if (!validateAdminKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() || "";
  const tier = searchParams.get("tier")?.trim() || "";
  const role = searchParams.get("role")?.trim() || "";
  const status = searchParams.get("status")?.trim() || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  try {
    const where: Record<string, unknown> = {};

    // Search by name or email
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filter by tier slug
    if (tier) {
      where.currentTier = { slug: tier };
    }

    // Filter by role
    if (role) {
      where.role = role;
    }

    // Filter by status (membership or subscription status)
    if (status === "member") {
      where.isMember = true;
    } else if (status === "non-member") {
      where.isMember = false;
    } else if (status === "trial") {
      where.trialEnd = { gt: new Date() };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
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
          createdAt: true,
          updatedAt: true,
          currentTier: {
            select: {
              id: true,
              slug: true,
              name: true,
            },
          },
          _count: {
            select: {
              subscriptions: true,
              accessGrants: true,
              savedContents: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ users, total, limit, offset });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}