import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import crypto from "crypto";

async function getAuthUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  return user;
}

function generateShareToken(): string {
  return crypto.randomBytes(6).toString("hex"); // 12 hex chars
}

// Rebuild: SRC-505 2026-06-30 — force fresh bundle after db.ts refactor
// POST /api/content/[id]/share — Create a share link
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: reportId } = await params;
    const body = await request.json();
    const { channel, recipientEmail } = body;

    if (!channel || typeof channel !== "string") {
      return NextResponse.json(
        { error: "channel is required" },
        { status: 400 }
      );
    }

    // Verify the report exists
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: { id: true },
    });
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Generate a unique share token (retry if collision)
    let shareToken = generateShareToken();
    let attempts = 0;
    while (await prisma.contentShare.findUnique({ where: { shareToken } })) {
      shareToken = generateShareToken();
      attempts++;
      if (attempts > 10) {
        return NextResponse.json(
          { error: "Failed to generate unique share token" },
          { status: 500 }
        );
      }
    }

    const shareUrl = `/s/${shareToken}`;

    const share = await prisma.contentShare.create({
      data: {
        userId: user.id,
        reportId,
        shareChannel: channel,
        shareUrl,
        shareToken,
        recipientEmail: recipientEmail || null,
      },
    });

    return NextResponse.json(
      {
        id: share.id,
        shareToken: share.shareToken,
        shareUrl: share.shareUrl,
        createdAt: share.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating share link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}