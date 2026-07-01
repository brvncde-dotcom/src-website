import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/preview/[token] — public, capability-gated by an unguessable token.
// Returns the FULL report (any status, incl. pending/draft) so the board can
// review before approval. Bypasses tier gating on purpose: holding the token
// IS the authorization. No token → 404. Kept separate from /api/reports/[id]
// so the public site's tier gate is never affected.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  if (!token || token.length < 16) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const report = await prisma.report.findUnique({
    where: { previewToken: token },
    select: {
      id: true,
      title: true,
      summary: true,
      content: true,
      type: true,
      section: true,
      status: true,
      language: true,
      author: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  if (!report) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(report);
}
