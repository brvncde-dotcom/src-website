import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/s/[token] — Public endpoint: resolve a share link
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const share = await prisma.contentShare.findUnique({
      where: { shareToken: token },
      include: {
        report: {
          select: {
            id: true,
            title: true,
            summary: true,
            type: true,
            section: true,
            author: true,
            publishedAt: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!share) {
      return NextResponse.json({ error: "Share link not found" }, { status: 404 });
    }

    // Increment click count
    await prisma.contentShare.update({
      where: { id: share.id },
      data: { clicks: { increment: 1 } },
    });

    return NextResponse.json({
      report: share.report,
      sharedBy: share.user.name || "Anonymous",
      sharedAt: share.createdAt,
      clicks: share.clicks + 1,
    });
  } catch (error) {
    console.error("Error resolving share link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}