import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma, validateAdminKey } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST /api/reports/[id]/preview-token — admin only.
// Returns the report's preview token, minting one on first use. The token is a
// capability: anyone holding /preview/<token> can read the full draft, so it's
// admin-gated to create and long/random enough to be unguessable.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!validateAdminKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const report = await prisma.report.findUnique({
    where: { id },
    select: { id: true, previewToken: true },
  });
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  let token = report.previewToken;
  if (!token) {
    for (let i = 0; i < 5; i++) {
      const candidate = crypto.randomBytes(16).toString("hex"); // 32 hex chars
      const clash = await prisma.report.findUnique({
        where: { previewToken: candidate },
        select: { id: true },
      });
      if (!clash) {
        token = candidate;
        break;
      }
    }
    if (!token) {
      return NextResponse.json(
        { error: "Failed to generate preview token" },
        { status: 500 },
      );
    }
    await prisma.report.update({
      where: { id },
      data: { previewToken: token },
    });
  }

  return NextResponse.json({ token, url: `/preview/${token}` });
}
