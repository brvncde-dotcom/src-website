import { NextRequest, NextResponse } from "next/server";
import {
  prisma,
  VALID_SECTIONS,
  VALID_TYPES,
  VALID_LANGUAGES,
  DEFAULT_LANGUAGE,
  validateIngestionKey,
} from "@/lib/db";

// POST /api/reports — Ingest a new report from vnOrchestrator
// Rebuild: force fresh bundle to pick up fixed db.ts singleton
export async function POST(request: NextRequest) {
  // Auth check
  if (!validateIngestionKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const { title, summary, content, type, section, sourceRef, author, language } = body;

    // Validate required fields
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "title is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (!section || !VALID_SECTIONS.includes(section)) {
      return NextResponse.json(
        {
          error: `section must be one of: ${VALID_SECTIONS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const reportType = type || "Analysis";
    if (!VALID_TYPES.includes(reportType)) {
      return NextResponse.json(
        {
          error: `type must be one of: ${VALID_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate language (default: en)
    const reportLang =
      language && VALID_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;

    // Check for duplicate (sourceRef, language) — if sourceRef is set
    if (sourceRef?.trim()) {
      const existing = await prisma.report.findUnique({
        where: {
          sourceRef_language: {
            sourceRef: sourceRef.trim(),
            language: reportLang,
          },
        },
      });
      if (existing) {
        // Update the existing translation instead of creating a duplicate
        const updated = await prisma.report.update({
          where: { id: existing.id },
          data: {
            title: title.trim(),
            summary: summary?.trim() || null,
            content: content?.trim() || null,
            type: reportType,
            section,
            author: author?.trim() || null,
          },
        });
        return NextResponse.json(
          {
            id: updated.id,
            title: updated.title,
            section: updated.section,
            type: updated.type,
            language: updated.language,
            status: updated.status,
            createdAt: updated.createdAt,
            message: "Existing translation updated.",
          },
          { status: 200 }
        );
      }
    }

    const report = await prisma.report.create({
      data: {
        title: title.trim(),
        summary: summary?.trim() || null,
        content: content?.trim() || null,
        type: reportType,
        section,
        sourceRef: sourceRef?.trim() || null,
        language: reportLang,
        author: author?.trim() || null,
        status: "pending", // All ingested reports start as pending
      },
    });

    // Defensive verification: ensure the write actually persisted.
    // This catches database-layer issues (connection poolers, triggers,
    // read-replica lag, etc.) that can silently drop writes in serverless
    // environments while still returning a result object.
    const verify = await prisma.report.findUnique({
      where: { id: report.id },
    });
    if (!verify) {
      console.error("Report create returned data but findUnique returned null — write was lost.", {
        id: report.id,
        title: report.title,
      });
      return NextResponse.json(
        { error: "Report could not be persisted. Please retry." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        id: report.id,
        title: report.title,
        section: report.section,
        type: report.type,
        language: report.language,
        status: report.status,
        createdAt: report.createdAt,
        message: "Report ingested successfully and awaits review.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error ingesting report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/reports — Fetch reports (public: published only; with auth: all)
// Query params:
//   ?lang=de          — filter by language
//   ?groupBy=sourceRef — return reports grouped by sourceRef
//   ?section=...      — filter by section
//   ?type=...         — filter by type
//   ?status=...       — filter by status (admin only)
//   ?limit=50         — pagination
//   ?offset=0         — pagination
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section");
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const lang = searchParams.get("lang");
  const groupBy = searchParams.get("groupBy");
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  // Check if admin key is provided to see non-published reports
  const authHeader = request.headers.get("authorization");
  const adminKey = process.env.ADMIN_API_KEY;
  const isAdmin = adminKey && authHeader?.replace("Bearer ", "") === adminKey;

  const where: Record<string, unknown> = {};

  // Public users only see published reports; admins can filter by status
  if (isAdmin && status) {
    where.status = status;
  } else if (!isAdmin) {
    where.status = "published";
  }

  if (section && VALID_SECTIONS.includes(section as typeof VALID_SECTIONS[number])) {
    where.section = section;
  }

  if (type) {
    where.type = type;
  }

  if (lang && VALID_LANGUAGES.includes(lang as typeof VALID_LANGUAGES[number])) {
    where.language = lang;
  }

  try {
    const select = {
      id: true,
      title: true,
      summary: true,
      type: true,
      section: true,
      status: true,
      language: true,
      sourceRef: true,
      author: true,
      publishedAt: true,
      createdAt: true,
    };

    // Group by sourceRef: return reports grouped by their source reference
    if (groupBy === "sourceRef") {
      const reports = await prisma.report.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        take: Math.min(limit, 100),
        skip: offset,
        select,
      });

      // Group reports by sourceRef
      const groups: Record<string, typeof reports> = {};
      const ungrouped: typeof reports = [];

      for (const report of reports) {
        if (report.sourceRef) {
          if (!groups[report.sourceRef]) {
            groups[report.sourceRef] = [];
          }
          groups[report.sourceRef].push(report);
        } else {
          ungrouped.push(report);
        }
      }

      // Convert groups to array format
      const groupedReports = Object.entries(groups).map(([sourceRef, versions]) => ({
        sourceRef,
        versions: versions.sort((a, b) => a.language.localeCompare(b.language)),
      }));

      return NextResponse.json({
        grouped: groupedReports,
        ungrouped,
        total: reports.length,
        limit,
        offset,
      });
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        take: Math.min(limit, 100),
        skip: offset,
        select,
      }),
      prisma.report.count({ where }),
    ]);

    return NextResponse.json({ reports, total, limit, offset });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
