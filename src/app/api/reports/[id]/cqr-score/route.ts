import { NextResponse } from "next/server";
import { validateIngestionKey, prisma } from "@/lib/db";
import { persistScore, validateEnvelope, type ScoreEnvelope } from "@/lib/cqr-persist";

// POST /api/reports/[id]/cqr-score
// Paperclip-facing: accepts a pre-computed CQR score envelope (Paperclip runs
// the scoring), validates it, RECOMPUTES the composite/flags server-side, and
// stores. Auth: INGESTION_API_KEY (the scoped key Paperclip already holds).
//
// Body: { scores:{...}, rationale:{...}, docType, recommendedTier?, contrarianFlag?, timeHorizon? }
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!validateIngestionKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const report = await prisma.report.findUnique({ where: { id }, select: { id: true } });
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const invalid = validateEnvelope(body);
  if (invalid) {
    return NextResponse.json({ error: invalid }, { status: 400 });
  }

  const stored = await persistScore(report.id, body as ScoreEnvelope, "paperclip");
  return NextResponse.json({ score: stored }, { status: 200 });
}
