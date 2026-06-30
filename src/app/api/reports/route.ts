import { NextRequest, NextResponse } from "next/server";
import {
  prisma,
  VALID_SECTIONS,
  VALID_TYPES,
  VALID_LANGUAGES,
  DEFAULT_LANGUAGE,
  validateIngestionKey,
  validateAdminKey,
} from "@/lib/db";

// Heuristic guard: detect submissions that are internal Paperclip workflow
// tickets (translation tasks, editorial-review gates, "adopt pillar scope",
// research intake, engineering tasks, test rows) rather than finished
// editorial content. These should never reach the public website.
// Returns a short human-readable reason if the payload looks internal, else null.
// Set INGEST_ALLOW_INTERNAL=1 to bypass (e.g. for a deliberate backfill).
function internalTicketReason(body: {
  title?: unknown;
  summary?: unknown;
  content?: unknown;
}): string | null {
  if (process.env.INGEST_ALLOW_INTERNAL === "1") return null;

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const summary = typeof body.summary === "string" ? body.summary : "";
  const content = typeof body.content === "string" ? body.content : "";
  const blob = `${title}\n${summary}\n${content}`;

  // Ticket-style titles
  const titleRules: [RegExp, string][] = [
    [/^\s*\[(high|medium|low|urgent|critical|p[0-4])\]/i, "priority-tagged ticket title"],
    [/^\s*(adopt|adoption|adozione|festlegung|übernahme)\b[\s\S]*\b(pillar scope|pilastri|piliers|säulen)/i, "pillar-scope ticket"],
    [/^\s*translate\b[\s\S]*(→|->|\breport\b)/i, "translation task"],
    [/^\s*publish pipeline\b/i, "publish-pipeline ticket"],
    [/^\s*editorial review\s*:/i, "editorial-review ticket"],
    [/^\s*report draft\s*:/i, "report-draft ticket"],
    [/^\s*research brief\s*:/i, "research-brief intake ticket"],
    [/^\s*investigate\b[\s\S]*\b(fix|build|failure|bug|error|deploy)\b/i, "engineering task"],
    [/^\s*test\b[\s\S]*\b(report|delete me|ingest)\b/i, "test submission"],
    [/\bdelete me\b/i, "test submission"],
    [/\bict domain review\s*:/i, "domain-review ticket"],
    [/into (the )?project knowledge base/i, "internal knowledge-base task"],
  ];
  for (const [re, reason] of titleRules) {
    if (re.test(title)) return reason;
  }

  // Internal workflow markers anywhere in the payload (very low false-positive)
  const contentRules: [RegExp, string][] = [
    [/\]\(\/SRC\/(issues|approvals)\//i, "contains internal SRC issue/approval links"],
    [/\bsubmit as pending\b/i, "contains workflow instruction 'submit as pending'"],
    [/\bthis task is blocked\b/i, "contains task-tracking language"],
    [/\byou are writing\b/i, "contains task-assignment language"],
    [/\bboard source intake\b/i, "source-intake ticket"],
    [/\bchild of \[src-/i, "references a parent SRC issue"],
  ];
  for (const [re, reason] of contentRules) {
    if (re.test(blob)) return reason;
  }

  return null;
}

// POST /api/reports — Ingest a new report from vnOrchestrator
// Rebuild: SRC-505 2026-06-30 — force fresh bundle + transactional create-verify
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

    // Reject internal Paperclip workflow tickets — only publishable reports belong here.
    const ticketReason = internalTicketReason(body);
    if (ticketReason) {
      console.warn(
        `Rejected internal-ticket ingestion (${ticketReason}): "${title.trim().slice(0, 80)}"`
      );
      return NextResponse.json(
        {
          error: `This submission looks like an internal workflow ticket (${ticketReason}), not a publishable report. Only finished editorial content should be posted to /api/reports.`,
          code: "INTERNAL_TICKET_REJECTED",
        },
        { status: 422 }
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

    // Use an interactive transaction so create and verify share the same
    // database connection. This eliminates connection-pooler or read-replica
    // lag as a source of silent write failures in serverless environments.
    const report = await prisma.$transaction(async (tx) => {
      const created = await tx.report.create({
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

      // Defensive verification inside the transaction: if the row is not
      // visible on the same connection, something is fundamentally broken.
      const verify = await tx.report.findUnique({
        where: { id: created.id },
      });
      if (!verify) {
        throw new Error(
          `Report create verification failed — write was not persisted for id ${created.id}`
        );
      }

      return created;
    });

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

  // Privileged readers (admin OR the trusted ingestion client) may see
  // non-published reports and filter by status. The ingestion key needs this
  // so vnOrchestrator can verify a push it just made: a freshly-ingested
  // report is `pending`, and without read-back access the POST→GET verify
  // cycle returns only `published` and looks like a lost write (SRC-505).
  const isAdmin = validateAdminKey(request);
  const isIngestion = validateIngestionKey(request);
  const privileged = isAdmin || isIngestion;

  const where: Record<string, unknown> = {};

  // Public users only see published reports; privileged callers can filter by status
  if (privileged && status) {
    where.status = status;
  } else if (!privileged) {
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
