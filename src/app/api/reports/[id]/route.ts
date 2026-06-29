import { NextRequest, NextResponse } from "next/server";
import { prisma, validateAdminKey, VALID_STATUSES } from "@/lib/db";

// PATCH /api/reports/[id] — Review action: approve, reject, publish
// Rebuild: force fresh bundle to pick up fixed db.ts singleton
// When publishing, all reports sharing the same sourceRef are published together (simultaneous publishing)
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
    const { action, reviewNote, title, summary, content, section, type, author, language } = body;

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

      // When publishing, set publishedAt and publish all sibling translations
      if (action === "published") {
        updateData.publishedAt = new Date();

        // Fetch the report to get its sourceRef
        const report = await prisma.report.findUnique({ where: { id } });
        if (!report) {
          return NextResponse.json({ error: "Report not found" }, { status: 404 });
        }

        // If the report has a sourceRef, publish all sibling translations simultaneously
        if (report.sourceRef) {
          const siblings = await prisma.report.updateMany({
            where: {
              sourceRef: report.sourceRef,
              id: { not: id },
            },
            data: {
              status: "published",
              publishedAt: new Date(),
              reviewedBy: "admin",
              reviewedAt: new Date(),
            },
          });

          // Now update the primary report
          const updated = await prisma.report.update({
            where: { id },
            data: updateData,
          });

          return NextResponse.json({
            id: updated.id,
            title: updated.title,
            status: updated.status,
            publishedAt: updated.publishedAt,
            language: updated.language,
            sourceRef: updated.sourceRef,
            siblingsPublished: siblings.count,
            message: `Report published. ${siblings.count} sibling translation(s) published simultaneously.`,
          });
        }
      }

      const updatedReport = await prisma.report.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json({
        id: updatedReport.id,
        title: updatedReport.title,
        status: updatedReport.status,
        publishedAt: updatedReport.publishedAt,
        language: updatedReport.language,
        sourceRef: updatedReport.sourceRef,
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
    if (language !== undefined) updateFields.language = language;

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
      language: report.language,
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
// ?lang=de — if the report has a translation in the requested language, return that instead
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang");
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

    // If a language is requested and differs from the report's language,
    // try to find the translation with the same sourceRef
    let resultReport = report;
    const translations: { id: string; language: string; title: string }[] = [];

    if (report.sourceRef) {
      // Fetch all sibling translations
      const siblings = await prisma.report.findMany({
        where: {
          sourceRef: report.sourceRef,
          ...(isAdmin ? {} : { status: "published" }),
        },
        select: { id: true, language: true, title: true },
      });

      translations.push(...siblings);

      // If a specific language is requested, find that translation
      if (lang && lang !== report.language) {
        const translation = siblings.find((s) => s.language === lang);
        if (translation) {
          const fullTranslation = await prisma.report.findUnique({
            where: { id: translation.id },
          });
          if (fullTranslation && (isAdmin || fullTranslation.status === "published")) {
            resultReport = fullTranslation;
          }
        }
      }
    }

    return NextResponse.json({
      ...resultReport,
      translations: translations.sort((a, b) => a.language.localeCompare(b.language)),
    });
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
