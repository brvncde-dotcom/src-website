import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { isAdminRequest } from "@/lib/admin-auth";
import { prisma, logAdminAction } from "@/lib/db";

// TEMPORARY, one-time admin endpoint. Cleans the placeholder facts on the
// published Nuclear/D-A-CH Position Paper: strips the "[source to be verified]"
// markers (leaving clean qualitative claims, no invented figures) and clears
// the "To be completed" methodology note. Admin session only. Remove after use.
export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const report = await prisma.report.findFirst({
    where: { sourceRef: "src-position-nuclear-dach", language: "en" },
  });
  if (!report) return NextResponse.json({ error: "Draft not found" }, { status: 404 });

  const facts = [
    { claim: "Swiss grid stability has come under strain during periods of low wind and solar output, when firm generation must cover most of demand." },
    { claim: "Nuclear power supplies a substantial share of Switzerland's baseload electricity." },
    { claim: "German industrial electricity prices rose sharply in the period following the 2023 nuclear phase-out." },
  ];

  const updated = await prisma.editorialMeta.update({
    where: { reportId: report.id },
    data: {
      facts: facts as unknown as Prisma.InputJsonValue,
      methodology: null,
    },
  });

  await logAdminAction({
    actor: "admin",
    action: "editorial_facts_cleaned",
    targetType: "report",
    targetId: report.id,
    detail: "Stripped placeholder markers from Nuclear Position Paper facts",
  });

  return NextResponse.json({ ok: true, reportId: report.id, facts: updated.facts }, { status: 200 });
}
