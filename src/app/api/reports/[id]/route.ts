import { NextRequest, NextResponse } from "next/server";
import {
  prisma,
  validateIngestionKey,
  VALID_STATUSES,
  canAccessContent,
  validateDesignGate,
  logAdminAction,
  embedReport,
} from "@/lib/db";
import { isAdminRequest } from "@/lib/admin-auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PATCH /api/reports/[id] — Review action: approve, reject, publish
//
// Auth has two paths:
//
// 1. Admin (session or ADMIN_API_KEY) — full access: approve, reject, publish,
//    edit fields, delete. ADMIN_API_KEY must NEVER be given to any agent.
//
// 2. PAPERCLIP_PUBLISH_KEY — scoped to publish-only:
//    - Bearer token validated against PAPERCLIP_PUBLISH_KEY env var
//    - Body must be { action: "published" } — nothing else is accepted
//    - Report must already be status="approved" (board has approved it)
//    - validateDesignGate still enforced
//    - Cannot approve, reject, edit fields, or access any other endpoint
//
// The board approves via admin panel or Telegram card. Paperclip then
// publishes board-approved reports using its scoped key. See PUBLISHING.md.
// When publishing, all reports sharing the same sourceRef are published together.

function validatePublishKey(request: NextRequest): boolean {
  const key = process.env.PAPERCLIP_PUBLISH_KEY;
  if (!key) return false;
  const auth = request.headers.get("authorization") || "";
  return auth === `Bearer ${key}`;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // --- Scoped publish-key path (Paperclip / CTO agent) ---
  // Clone the request so the body can be read again by the admin path below.
  const cloned = request.clone();
  if (validatePublishKey(request)) {
    try {
      const body = await cloned.json();
      if (body?.action !== "published") {
        return NextResponse.json(
          { error: "This key only permits action: published" },
          { status: 403 }
        );
      }

      const report = await prisma.report.findUnique({ where: { id } });
      if (!report) {
        return NextResponse.json({ error: "Report not found" }, { status: 404 });
      }
      // Board must have approved before Paperclip can publish.
      if (report.status !== "approved") {
        return NextResponse.json(
          { error: `Report is not board-approved (status: ${report.status}). Board must approve before publishing.` },
          { status: 422 }
        );
      }

      const gate = validateDesignGate(report);
      if (!gate.valid) {
        return NextResponse.json(
          { error: `Publish gate: ${gate.reason}` },
          { status: 422 }
        );
      }

      const now = new Date();
      // Publish all sibling translations simultaneously if sourceRef exists
      if (report.sourceRef) {
        await prisma.report.updateMany({
          where: { sourceRef: report.sourceRef, id: { not: id } },
          data: { status: "published", publishedAt: now, reviewedBy: "paperclip", reviewedAt: now },
        });
      }
      const updated = await prisma.report.update({
        where: { id },
        data: { status: "published", publishedAt: now, reviewedBy: "paperclip", reviewedAt: now },
      });

      await logAdminAction({
        actor: "paperclip",
        action: "report_published",
        targetType: "report",
        targetId: updated.id,
        detail: `Published by Paperclip (scoped key): ${updated.id}`,
      });

      void embedReport(updated.id);

      return NextResponse.json({
        id: updated.id,
        status: updated.status,
        publishedAt: updated.publishedAt,
        message: "Published.",
      });
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
  }

  // --- Admin path (full access) ---
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, reviewNote, title, summary, content, section, type, author, language, minTierId, designSignedOffBy, code } = body;

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

      // A rejection must explain what needs to change — the comment drives the
      // re-approval loop, so it cannot be empty.
      if (action === "rejected" && (!reviewNote || !reviewNote.trim())) {
        return NextResponse.json(
          { error: "A rejection requires a comment explaining what needs to change." },
          { status: 400 }
        );
      }

      if (reviewNote) {
        updateData.reviewNote = reviewNote;
      }

      // Publish backstop: reject internal-marker junk / missing byline before
      // it goes live. (No design sign-off step — board approval is the gate.)
      if (action === "published") {
        const report = await prisma.report.findUnique({ where: { id } });
        if (!report) {
          return NextResponse.json({ error: "Report not found" }, { status: 404 });
        }

        const gate = validateDesignGate(report);
        if (!gate.valid) {
          return NextResponse.json(
            { error: `Gate 3 block: ${gate.reason}` },
            { status: 422 }
          );
        }

        updateData.publishedAt = new Date();

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

          const updated = await prisma.report.update({
            where: { id },
            data: updateData,
          });

          await logAdminAction({
            actor: "admin",
            action: "report_published",
            targetType: "report",
            targetId: updated.id,
            detail: `Published report ${updated.id} (sourceRef: ${updated.sourceRef}) with ${siblings.count} siblings`,
          });

          // Embed all published translations (fire-and-forget, never blocks response)
          void embedReport(updated.id);

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

        const updated = await prisma.report.update({
          where: { id },
          data: updateData,
        });

        await logAdminAction({
          actor: "admin",
          action: "report_published",
          targetType: "report",
          targetId: updated.id,
          detail: `Published report ${updated.id}`,
        });

        void embedReport(updated.id);

        return NextResponse.json({
          id: updated.id,
          title: updated.title,
          status: updated.status,
          publishedAt: updated.publishedAt,
          language: updated.language,
          sourceRef: updated.sourceRef,
          message: `Report published.`,
        });
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
    // minTierId: set a tier slug-resolved id to gate the report, or "" / null to ungate.
    if (minTierId !== undefined) updateFields.minTierId = minTierId || null;
    if (code !== undefined) updateFields.code = code?.trim() || null;
    if (designSignedOffBy !== undefined) {
      updateFields.designSignedOffBy = designSignedOffBy || null;
      updateFields.designSignedOffAt = designSignedOffBy ? new Date() : null;
    }

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

    if (designSignedOffBy !== undefined && designSignedOffBy) {
      await logAdminAction({
        actor: "admin",
        action: "design_sign_off",
        targetType: "report",
        targetId: report.id,
        detail: `Design sign-off recorded by ${designSignedOffBy}`,
      });
    }

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
  const isAdmin = await isAdminRequest(request);
  const isIngestion = validateIngestionKey(request);
  const privileged = isAdmin || isIngestion;

  try {
    const report = await prisma.report.findUnique({ where: { id } });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Non-privileged callers can only see published reports
    if (!privileged && report.status !== "published") {
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
          ...(privileged ? {} : { status: "published" }),
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

    // Tier-based access control: only entitled users (or admins) get full
    // content. Everyone else gets a preview (summary, no body) plus the tier
    // they'd need. Gating applies only when the report has a minTierId set.
    let access: { access: "full" | "preview" | "denied"; reason: string } = {
      access: "full",
      reason: "Admin access",
    };
    let requiredTier: string | null = null;

    if (!isAdmin) {
      const session = await getServerSession(authOptions);
      const userId = (session?.user as { id?: string } | undefined)?.id ?? null;
      access = await canAccessContent(userId, resultReport);
      if (access.access !== "full" && resultReport.minTierId) {
        const tier = await prisma.tier.findUnique({
          where: { id: resultReport.minTierId },
          select: { name: true },
        });
        requiredTier = tier?.name ?? null;
      }
    }

    const gated = access.access !== "full";

    return NextResponse.json({
      ...resultReport,
      // Withhold the full body for non-entitled viewers; summary stays visible.
      content: gated ? null : resultReport.content,
      access: access.access,
      accessReason: access.reason,
      requiredTier,
      translations: translations.sort((a, b) => a.language.localeCompare(b.language)),
    });
  } catch (error) {
    console.error("Error fetching report:", error);
    const errMsg = error instanceof Error ? error.message : String(error);
    // Temporary diagnostic for SRC-519 — reveal schema-mismatch errors
    if (errMsg.includes("column") || errMsg.includes("does not exist") || errMsg.includes("Unknown field")) {
      return NextResponse.json(
        { error: "DB schema mismatch", detail: errMsg },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/reports/[id] — Delete a report
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest(request))) {
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
