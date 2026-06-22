import { NextRequest, NextResponse } from "next/server";
import { prisma, validateAdminKey, VALID_STATUSES } from "@/lib/db";

// PATCH /api/reports/[id] — Review action: approve, reject, publish
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
    const { action, reviewNote, title, summary, content, section, type, author } = body;

    // Handle review actions
    if (action) {
      if (!VALID_STATUSES.includes(action)) {
        return NextResponse.json(
          { error: `action must be one of: ${VALID_STATUSES.join(", ")}` },
          { status: 400 }
        );
      }

      const updateData: Record<string, unknown> = {
        status: action,
        reviewedBy: "admin",
        reviewedAt: new Date(),
      };

      if (reviewNote) {
        updateData.reviewNote = reviewNote;
      }

      // When publishing, set publishedAt
      if (action === "published") {
        updateData.publishedAt = new Date();
      }

      const report = await prisma.report.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json({
        id: report.id,
        title: report.title,
        status: report.status,
        publishedAt: report.publishedAt,
        message: `Report ${action}.`,
      });
    }

    // Handle field edits (no action, just update fields)
    const updateFields: Record<string, unknown> = {};
    if (title !== undefined) updateFields.title = title;
    if (summary !== undefined) updateFields.summary = summary;
    if (content !== undefined) updateFields.content = content;
    if (section !== undefined) updateFields.section = section;
    if (type !== undefined) updateFields.type = type;
    if (author !== undefined) updateFields.author = author;

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { error: "No fields to update. Provide an action or fields to edit." },
        { status: 400 }
      );
    }

    const report = await prisma.report.update({
      where: { id },
      data: updateFields,
    });

    return NextResponse.json({
      id: report.id,
      title: report.title,
      message: "Report updated.",
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    if (errMsg.includes("Record to update not found")) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    console.error("Error updating report:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/reports/[id] — Fetch a single report (full content)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authHeader = request.headers.get("authorization");
  const adminKey = process.env.ADMIN_API_KEY;
  const isAdmin = adminKey && authHeader?.replace("Bearer ", "") === adminKey;

  try {
    const report = await prisma.report.findUnique({ where: { id } });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Non-admins can only see published reports
    if (!isAdmin && report.status !== "published") {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/reports/[id] — Delete a report
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateAdminKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.report.delete({ where: { id } });
    return NextResponse.json({ message: "Report deleted." });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    if (errMsg.includes("Record to delete not found")) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    console.error("Error deleting report:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}