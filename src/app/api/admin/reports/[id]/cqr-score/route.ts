import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { getCurrentFramework } from "@/lib/cqr-framework";
import { scoreReport, isScorerAvailable } from "@/lib/cqr-scorer";
import { persistScore, validateEnvelope } from "@/lib/cqr-persist";

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
