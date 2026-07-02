import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { tgBroadcast, reportCard } from "@/lib/telegram";
import {
  prisma,
  VALID_SECTIONS,
  VALID_TYPES,
  VALID_LANGUAGES,
  DEFAULT_LANGUAGE,
  validateIngestionKey,
} from "@/lib/db";
import { isAdminRequest } from "@/lib/admin-auth";
import { normalizeEditorial, type EditorialInput } from "@/lib/editorial";
import { getCurrentFramework } from "@/lib/cqr-framework";
import { scoreReport, isScorerAvailable } from "@/lib/cqr-scorer";
import { persistScore, validateEnvelope, type ScoreEnvelope } from "@/lib/cqr-persist";
import { computeComposite, decideAction } from "@/lib/cqr-score";

// Types that are NEVER auto-published, no matter what the caller requests.
// These are value-laden and reputation-critical: the board signs them off.
const BOARD_ONLY_TYPES = new Set(["Opinion", "Editorial"]);

interface ReportForScoring {
  title: string;
  summary: string | null;
  content: string | null;
  type: string;
  section: string;
  author: string | null;
}

interface AutoPublishDecision {
  publish: boolean;
  envelope: ScoreEnvelope | null;
  composite: number | null;
  reason: string;
}

// Decide whether a score-gated report may auto-publish. The website scores the
// SUBMITTED TEXT with its own CQR scorer — Paperclip never supplies the score,
// so an agent cannot inflate its way onto the live site. Fails safe (queues for
// board review) whenever the scorer is unavailable, returns junk, or the daily
// ceiling is hit. Publish only when composite clears the floor (default: the
// framework's "Publish immediately" threshold).
async function scoreGatedDecision(report: ReportForScoring): Promise<AutoPublishDecision> {
  if (!isScorerAvailable()) {
    return {
      publish: false, envelope: null, composite: null,
      reason: "auto-publish requested but the CQR scorer is unavailable — queued for board review",
    };
  }

  // Safety ceiling: cap score-gated auto-publishes in a rolling 24h window so a
  // runaway ingestion loop cannot flood the live site. Excess is queued, not lost.
  const cap = parseInt(process.env.CQR_AUTOPUBLISH_DAILY_CAP || "25", 10);
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recent = await prisma.report.count({
    where: {
      status: "published",
      publishedAt: { gte: since },
      type: { notIn: ["Daily Brief", "Opinion", "Editorial"] },
    },
  });
  if (recent >= cap) {
    return {
      publish: false, envelope: null, composite: null,
      reason: `auto-publish daily cap (${cap}) reached — queued for board review`,
    };
  }

  try {
    const framework = await getCurrentFramework();
    const envelope = await scoreReport(report, framework);
    const invalid = validateEnvelope(envelope);
    if (invalid) {
      return {
        publish: false, envelope: null, composite: null,
        reason: `CQR scorer returned invalid output (${invalid}) — queued for board review`,
      };
    }
    const composite = computeComposite(envelope.scores, envelope.docType, framework.weights);
    const envFloor = parseFloat(process.env.CQR_AUTOPUBLISH_MIN_COMPOSITE || "");
    const floor = Number.isFinite(envFloor) && envFloor > 0 ? envFloor : framework.thresholds.publishNow;
    const action = decideAction(composite, framework.thresholds);
    const publish = composite >= floor;
    return {
      publish, envelope, composite,
      reason: publish
        ? `auto-published — CQR ${composite.toFixed(1)} (${action})`
        : `CQR ${composite.toFixed(1)} (${action}) below auto-publish floor ${floor.toFixed(1)} — queued for board review`,
    };
  } catch (e) {
    console.error("[autopublish] scoring failed:", e);
    return {
      publish: false, envelope: null, composite: null,
      reason: "auto-publish scoring failed — queued for board review",
    };
  }
}

// Map a normalized editorial payload onto EditorialMeta columns. facts is
// stored as JSON; everything else is a scalar column.
function editorialData(e: EditorialInput) {
  return {
    subBrand: e.subBrand,
    thesis: e.thesis,
    facts: (e.facts ?? undefined) as Prisma.InputJsonValue | undefined,
    analysis: e.analysis,
    roomForDisagreement: e.roomForDisagreement,
    theAsk: e.theAsk,
    authorTitle: e.authorTitle,
    authorCreds: e.authorCreds,
    authorLinkedin: e.authorLinkedin,
    authorTwitter: e.authorTwitter,
    methodology: e.methodology,
    sourcesCount: e.sourcesCount,
    conflicts: e.conflicts,
    videoUrl: e.videoUrl,
    videoDuration: e.videoDuration,
    audioUrl: e.audioUrl,
  };
}

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

// Observability: every ingestion attempt writes one IngestionLog row —
// accepted, rejected, errored, or unauthorized. When content "disappears"
// between Paperclip and the review queue, this table is the answer to
// "did it ever arrive, and why was it turned away?" Logging must never
// break ingestion itself, so failures are swallowed (console only).
async function logIngestion(entry: {
  outcome: "accepted" | "rejected" | "error" | "unauthorized";
  httpStatus: number;
  reason?: string;
  code?: string;
  reportId?: string;
  body?: { title?: unknown; sourceRef?: unknown; language?: unknown; type?: unknown; section?: unknown };
}) {
  try {
    const s = (v: unknown, max = 300) =>
      typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;
    await prisma.ingestionLog.create({
      data: {
        outcome: entry.outcome,
        httpStatus: entry.httpStatus,
        reason: entry.reason?.slice(0, 500) ?? null,
        code: entry.code ?? null,
        reportId: entry.reportId ?? null,
        title: s(entry.body?.title),
        sourceRef: s(entry.body?.sourceRef, 100),
        language: s(entry.body?.language, 10),
        type: s(entry.body?.type, 50),
        section: s(entry.body?.section, 100),
      },
    });
  } catch (e) {
    console.error("[ingestion-log] write failed:", e);
  }
}

// POST /api/reports — Ingest a new report from vnOrchestrator
// Rebuild: SRC-505 2026-06-30 — force fresh bundle + transactional create-verify
export async function POST(request: NextRequest) {
  // Auth check
  if (!validateIngestionKey(request)) {
    // Log with whatever body context we can safely extract, so a Paperclip
    // push with a wrong/rotated key is visible in the admin log, not silent.
    let bodyCtx: Record<string, unknown> | undefined;
    try {
      bodyCtx = await request.json();
    } catch {
      /* unparseable body — log without context */
    }
    await logIngestion({
      outcome: "unauthorized",
      httpStatus: 401,
      reason: "Ingestion key missing or invalid",
      code: "UNAUTHORIZED",
      body: bodyCtx,
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown> & {
    title?: string; summary?: string; content?: string; type?: string;
    section?: string; sourceRef?: string; author?: string; language?: string; code?: string;
  } = {};
  try {
    body = await request.json();

    const { title, summary, content, type, section, sourceRef, author, language, code } = body;

    // Optional structured editorial payload authored by Paperclip's "Editor".
    // Only meaningful for editorial content (type Editorial / legacy Opinion).
    const editorial = normalizeEditorial(body.editorial);

    // Validate required fields
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      await logIngestion({
        outcome: "rejected", httpStatus: 400, code: "VALIDATION_FAILED",
        reason: "title is required and must be a non-empty string", body,
      });
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
      await logIngestion({
        outcome: "rejected", httpStatus: 422, code: "INTERNAL_TICKET_REJECTED",
        reason: `Looks like an internal workflow ticket: ${ticketReason}`, body,
      });
      return NextResponse.json(
        {
          error: `This submission looks like an internal workflow ticket (${ticketReason}), not a publishable report. Only finished editorial content should be posted to /api/reports.`,
          code: "INTERNAL_TICKET_REJECTED",
        },
        { status: 422 }
      );
    }

    if (!section || !(VALID_SECTIONS as readonly string[]).includes(section)) {
      await logIngestion({
        outcome: "rejected", httpStatus: 400, code: "VALIDATION_FAILED",
        reason: `Invalid section "${String(section)}" — must be one of: ${VALID_SECTIONS.join(", ")}`, body,
      });
      return NextResponse.json(
        {
          error: `section must be one of: ${VALID_SECTIONS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const reportType = type || "Analysis";
    if (!(VALID_TYPES as readonly string[]).includes(reportType)) {
      await logIngestion({
        outcome: "rejected", httpStatus: 400, code: "VALIDATION_FAILED",
        reason: `Invalid type "${String(type)}" — must be one of: ${VALID_TYPES.join(", ")}`, body,
      });
      return NextResponse.json(
        {
          error: `type must be one of: ${VALID_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate language (default: en)
    const reportLang =
      language && (VALID_LANGUAGES as readonly string[]).includes(language)
        ? language
        : DEFAULT_LANGUAGE;

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
            code: code?.trim() || null,
          },
        });
        if (editorial) {
          await prisma.editorialMeta.upsert({
            where: { reportId: updated.id },
            create: { reportId: updated.id, ...editorialData(editorial) },
            update: editorialData(editorial),
          });
        }
        await logIngestion({
          outcome: "accepted", httpStatus: 200, code: "TRANSLATION_UPDATED",
          reason: "Existing translation updated (same sourceRef + language)",
          reportId: updated.id, body,
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

    // Daily Briefs auto-publish immediately — no board vote required
    const isDailyBrief = reportType === "Daily Brief";

    // Idempotency for Daily Briefs: one brief per (section, language, editorial
    // date). Paperclip re-runs mint a new issue each time (new sourceRef), so the
    // (sourceRef, language) check above misses and duplicates pile up. Collapse
    // by the editorial date carried in the title (e.g. "… — 2026-07-01") instead
    // — a re-ingest of the same day's brief UPDATES the existing row. We key on
    // the title date rather than publishedAt because publishedAt is the ingest
    // timestamp, so backfilling several days in one session would otherwise
    // merge briefs of different editorial dates. This is the server-side safety
    // net; Paperclip should also send a stable sourceRef (see PC CEO
    // instructions / PUBLISHING.md), but we do not rely on it.
    const briefDateMatch = isDailyBrief ? title.match(/(\d{4}-\d{2}-\d{2})/) : null;
    if (isDailyBrief && briefDateMatch) {
      const briefDate = briefDateMatch[1];
      const existingBrief = await prisma.report.findFirst({
        where: {
          type: "Daily Brief",
          section,
          language: reportLang,
          title: { contains: briefDate },
        },
        orderBy: { createdAt: "desc" },
      });

      if (existingBrief) {
        const updated = await prisma.report.update({
          where: { id: existingBrief.id },
          data: {
            title: title.trim(),
            summary: summary?.trim() || null,
            content: content?.trim() || null,
            author: author?.trim() || null,
            code: code?.trim() || null,
            sourceRef: sourceRef?.trim() || existingBrief.sourceRef,
          },
        });
        await logIngestion({
          outcome: "accepted", httpStatus: 200, code: "BRIEF_DEDUPED",
          reason: "Existing Daily Brief for today updated (deduped by section + day)",
          reportId: updated.id, body,
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
            message: "Existing Daily Brief for today updated (deduped by section + day).",
          },
          { status: 200 }
        );
      }
    }

    // --- Publishing decision -------------------------------------------------
    // Governance model (server-enforced; Paperclip cannot override):
    //   • Opinion / Editorial  → ALWAYS board-gated. Never auto-publish.
    //   • Daily Brief          → auto-publish immediately (news-feed cadence).
    //   • everything else      → auto-publish IFF the caller sets autoPublish:true
    //     AND the website's own CQR scorer clears the floor. The website scores
    //     the text itself, so an agent cannot inflate its way live.
    // Omitting autoPublish keeps the historical behavior: queued as pending.
    const wantsAutoPublish = body.autoPublish === true;

    let initialStatus = "pending";
    let initialPublishedAt: Date | null = null;
    let scoreEnvelope: ScoreEnvelope | null = null;
    let autoPublishComposite: number | null = null;
    let publishNote = "Report ingested successfully and awaits review.";

    if (isDailyBrief) {
      initialStatus = "published";
      initialPublishedAt = new Date();
      publishNote = "Daily Brief published automatically.";
    } else if (wantsAutoPublish && BOARD_ONLY_TYPES.has(reportType)) {
      // Explicitly refuse auto-publish for Opinion/Editorial and say so.
      publishNote = `${reportType} content is always board-gated — auto-publish ignored, queued for board review.`;
    } else if (wantsAutoPublish) {
      const decision = await scoreGatedDecision({
        title: title.trim(),
        summary: summary?.trim() || null,
        content: content?.trim() || null,
        type: reportType,
        section,
        author: author?.trim() || null,
      });
      scoreEnvelope = decision.envelope;
      autoPublishComposite = decision.composite;
      publishNote = decision.reason;
      if (decision.publish) {
        initialStatus = "published";
        initialPublishedAt = new Date();
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
          code: code?.trim() || null,
          status: initialStatus,
          publishedAt: initialPublishedAt,
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

      // Attach the structured editorial payload in the same transaction.
      if (editorial) {
        await tx.editorialMeta.create({
          data: { reportId: created.id, ...editorialData(editorial) },
        });
      }

      return created;
    });

    // Persist the CQR score the website computed for the auto-publish decision.
    // Stored whether the piece went live or was queued, so the board sees the
    // score on the review card and the reader sees the scorecard once published.
    if (scoreEnvelope) {
      try {
        await persistScore(report.id, scoreEnvelope, "in-website");
      } catch (e) {
        console.error("[autopublish] persistScore failed:", e);
      }
    }

    // Telegram notification:
    //   • Daily Brief          → brief auto-publish notice
    //   • Score-gated publish  → auto-publish notice with the CQR verdict
    //   • Anything queued      → full board approval card (needs a vote)
    try {
      if (isDailyBrief) {
        await tgBroadcast(
          `📋 *Daily Brief published*\n${report.title}\n\nAuto-published at ${new Date().toLocaleTimeString("en-CH", { timeZone: "Europe/Zurich", hour: "2-digit", minute: "2-digit" })} CET`
        );
      } else if (report.status === "published") {
        await tgBroadcast(
          `🤖 *Auto-published* (CQR-gated)\n${report.title}\n\n${publishNote}`
        );
      } else {
        const card = reportCard(report);
        await tgBroadcast(card.text, card.reply_markup);
      }
    } catch (e) {
      console.error("[telegram] notify on ingest failed:", e);
    }

    await logIngestion({
      outcome: "accepted", httpStatus: 201, code: "CREATED",
      reason: `${publishNote} (status: ${report.status})`,
      reportId: report.id, body,
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
        // Feedback so Paperclip can learn what clears the bar: the CQR
        // composite the website computed (null when not score-gated) and a
        // human-readable outcome.
        cqrComposite: autoPublishComposite,
        message: publishNote,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error ingesting report:", error);
    await logIngestion({
      outcome: "error", httpStatus: 500, code: "SERVER_ERROR",
      reason: error instanceof Error ? error.message : String(error),
      body,
    });
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
  // Admin list view (all statuses) is granted only when explicitly requested
  // with view=admin AND the caller is an admin — so a logged-in admin browsing
  // the PUBLIC reports list still sees published-only, not drafts.
  const wantsAdminView = searchParams.get("view") === "admin";
  const isAdmin = wantsAdminView && (await isAdminRequest(request));
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

  // type accepts a single value or a comma-separated list (e.g. the editorial
  // hub queries "Editorial,Opinion" to show both new and legacy editorial content).
  if (type) {
    const types = type.split(",").map((t) => t.trim()).filter(Boolean);
    where.type = types.length > 1 ? { in: types } : types[0];
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
      code: true,
      designSignedOffBy: true,
      publishedAt: true,
      createdAt: true,
      // Sub-brand + video/thesis for "The SRC Position" hub cards.
      editorialMeta: {
        select: { subBrand: true, thesis: true, videoUrl: true, videoDuration: true },
      },
      // Admin-only fields — needed by the review dashboard
      ...(isAdmin ? {
        minTierId: true,
        reviewNote: true,
        isFreeMonthlyPick: true,
      } : {}),
    };

    // Group by sourceRef: return reports grouped by their source reference
    if (groupBy === "sourceRef") {
      const cap = isAdmin ? 2000 : 100;
      const reports = await prisma.report.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        take: Math.min(limit, cap),
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

    // Admins need the full list for search + bulk-delete to work correctly.
    // Public API is still capped at 100 to prevent scraping.
    const cap = isAdmin ? 2000 : 100;
    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        take: Math.min(limit, cap),
        skip: offset,
        select,
      }),
      prisma.report.count({ where }),
    ]);

    return NextResponse.json({ reports, total, limit, offset });
  } catch (error) {
    console.error("Error fetching reports:", error);
    const errMsg = error instanceof Error ? error.message : String(error);
    // Temporary diagnostic for SRC-519 — reveal schema-mismatch errors
    if (errMsg.includes("column") || errMsg.includes("does not exist") || errMsg.includes("Unknown field")) {
      return NextResponse.json(
        { error: "DB schema mismatch", detail: errMsg },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
