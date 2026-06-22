import { NextRequest, NextResponse } from "next/server";
import { prisma, VALID_SECTIONS, VALID_TYPES, validateIngestionKey } from "@/lib/db";

// POST /api/reports — Ingest a new report from vnOrchestrator
export async function POST(request: NextRequest) {
  // Auth check
  if (!validateIngestionKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const { title, summary, content, type, section, sourceRef, author } = body;

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

    const report = await prisma.report.create({
      data: {
        title: title.trim(),
        summary: summary?.trim() || null,
        content: content?.trim() || null,
        type: reportType,
        section,
        sourceRef: sourceRef?.trim() || null,
        author: author?.trim() || null,
        status: "pending", // All ingested reports start as pending
      },
    });

    return NextResponse.json(
      {
        id: report.id,
        title: report.title,
        section: report.section,
        type: report.type,
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
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section");
  const type = searchParams.get("type");
  const status = searchParams.get("status");
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

  try {
    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        take: Math.min(limit, 100),
        skip: offset,
        select: {
          id: true,
          title: true,
          summary: true,
          type: true,
          section: true,
          status: true,
          author: true,
          publishedAt: true,
          createdAt: true,
        },
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