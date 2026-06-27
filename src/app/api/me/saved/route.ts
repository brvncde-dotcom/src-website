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

// GET /api/me/saved — Return user's saved reports
export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const saved = await prisma.savedContent.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
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
            language: true,
          },
        },
      },
    });

    return NextResponse.json({ saved });
  } catch (error) {
    console.error("Error fetching saved reports:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}