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

// Rebuild: SRC-505 2026-06-30 — force fresh bundle after db.ts refactor
// POST /api/me/saved/[reportId] — Save a report (upsert)
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reportId } = await params;

    // Verify the report exists
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: { id: true },
    });
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const saved = await prisma.savedContent.upsert({
      where: {
        userId_reportId: {
          userId: user.id,
          reportId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        reportId,
      },
    });

    return NextResponse.json({ id: saved.id, reportId: saved.reportId }, { status: 201 });
  } catch (error) {
    console.error("Error saving report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/me/saved/[reportId] — Remove saved report
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reportId } = await params;

    const deleted = await prisma.savedContent.deleteMany({
      where: { userId: user.id, reportId },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: "Not saved" }, { status: 404 });
    }

    return NextResponse.json({ message: "Removed from saved" });
  } catch (error) {
    console.error("Error removing saved report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/me/saved/[reportId] — Update note on saved content
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reportId } = await params;
    const body = await request.json();
    const { note } = body;

    if (note !== undefined && typeof note !== "string") {
      return NextResponse.json(
        { error: "note must be a string" },
        { status: 400 }
      );
    }

    const updated = await prisma.savedContent.updateMany({
      where: { userId: user.id, reportId },
      data: { note: note ?? null },
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: "Not saved" }, { status: 404 });
    }

    return NextResponse.json({ message: "Note updated" });
  } catch (error) {
    console.error("Error updating saved note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}