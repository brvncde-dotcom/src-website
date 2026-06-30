import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/tiers — public list of tiers (used by the membership UI and by the
// admin "gate report to tier" control). Returns only non-sensitive fields.
export async function GET() {
  try {
    const tiers = await prisma.tier.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, slug: true, name: true, sortOrder: true },
    });
    return NextResponse.json({ tiers });
  } catch (error) {
    console.error("Error fetching tiers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
