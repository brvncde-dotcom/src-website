import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { getCurrentFramework } from "@/lib/cqr-framework";
import { scoreReport, isScorerAvailable } from "@/lib/cqr-scorer";
import { persistScore, validateEnvelope } from "@/lib/cqr-persist";
import { Prisma } from "@prisma/client";

// POST /api/admin/reports/[id]/cqr-score
// Admin-triggered in-website scoring. Runs the Claude scorer against the current
// framework, recomputes composite/flags server-side, stores the ContentScore.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!isScorerAvailable()) {
    return NextResponse.json(
      { error: "Scorer unavailable — ANTHROPIC_API_KEY not configured" },
      { status: 503 },
    );
  }

  const { id } = await params;
  const report = await prisma.report.findUnique({
    where: { id },
    select: { id: true, title: true, summary: true, content: true, type: true, section: true, author: true },
  });
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const framework = await getCurrentFramework();

  let envelope;
  try {
    envelope = await scoreReport(report, framework);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("CQR scorer error:", msg);
    return NextResponse.json({ error: "Scoring failed", detail: msg }, { status: 502 });
  }

  const invalid = validateEnvelope(envelope);
  if (invalid) {
    return NextResponse.json({ error: `Model returned invalid scores: ${invalid}` }, { status: 502 });
  }

  const stored = await persistScore(report.id, envelope, "in-website");
  return NextResponse.json({ score: stored }, { status: 200 });
}

// PATCH /api/admin/reports/[id]/cqr-score
// Editorial override: an editor records the final scores. Stored on the latest
// ContentScore as editorialOverride — the calibration input for PKG 5.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const framework = await getCurrentFramework();
  const existing = await prisma.contentScore.findUnique({
    where: { reportId_frameworkVersion: { reportId: id, frameworkVersion: framework.version } },
  });
  if (!existing) {
    return NextResponse.json({ error: "No score to override — run scoring first" }, { status: 404 });
  }

  const updated = await prisma.contentScore.update({
    where: { id: existing.id },
    data: { editorialOverride: body as Prisma.InputJsonValue },
  });
  return NextResponse.json({ score: updated }, { status: 200 });
}
