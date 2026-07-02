import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { isAdminRequest } from "@/lib/admin-auth";
import { prisma, logAdminAction } from "@/lib/db";

// TEMPORARY, one-time admin endpoint. Stages the "Nuclear / D-A-CH energy
// security" Position Paper as a PENDING editorial on prod so it enters the
// Board review queue (it is NOT published). Runs server-side where DATABASE_URL
// is populated; admin session only. Idempotent (upserts by sourceRef).
// Fabricated data/citations from the render-test seed have been stripped —
// facts are marked "[source to be verified]" for the editor to complete.
// Remove this route once the draft is created.
export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sourceRef = "src-position-nuclear-dach";
  const existing = await prisma.report.findFirst({ where: { sourceRef, language: "en" } });
  if (existing) await prisma.report.delete({ where: { id: existing.id } });

  const report = await prisma.report.create({
    data: {
      title: "Nuclear is D-A-CH's only credible path to energy security",
      summary:
        "Intermittent renewables cannot underwrite an industrial base. The SRC position: reopen the nuclear question now, on engineering terms, not ideological ones.",
      type: "Editorial",
      section: "energy-resources",
      language: "en",
      status: "pending", // board review queue — not published
      sourceRef,
    },
  });

  await prisma.editorialMeta.create({
    data: {
      reportId: report.id,
      subBrand: "position-paper",
      thesis:
        "Energy security must precede energy transition — and only nuclear closes the D-A-CH baseload gap this decade.",
      facts: [
        { claim: "Swiss grid stability has come under pressure during periods of low renewable output. [source to be verified]" },
        { claim: "Nuclear supplies a substantial share of Swiss baseload electricity. [source to be verified]" },
        { claim: "German industrial electricity prices rose sharply following the 2023 nuclear phase-out. [source to be verified]" },
      ] as unknown as Prisma.InputJsonValue,
      analysis:
        "The intermittency problem is not a detail — it is the whole problem. **Because** wind and solar output is uncorrelated with industrial demand, **therefore** every renewable-heavy grid needs firm backup equal to near-peak load. Today that backup is largely gas, which reintroduces exactly the import dependency the transition was meant to end.\n\nNuclear is the only mature, high-density, low-lifecycle-emission source that provides firm baseload. The barriers are regulatory and political, not technical.",
      roomForDisagreement:
        "Our position weakens if grid-scale storage costs fall faster than projected. If short-duration battery storage becomes cheap enough and long-duration storage becomes commercial this decade, the baseload argument for new nuclear narrows to a bridging role.\n\nWe would also revise if new-build nuclear timelines cannot be compressed materially — in which case the near-term capacity gap must be met another way regardless of merit.",
      theAsk:
        "The Swiss Federal Council should commission an independent engineering review of the 2017 new-build ban, scoped to grid stability under high-renewable penetration, and report within 12 months. This is a request for evidence, not a pre-decided outcome.",
      methodology:
        "To be completed — grid stability, price, and storage-cost figures to be sourced and verified before publication.",
      conflicts: "None",
    },
  });

  await logAdminAction({
    actor: "admin",
    action: "editorial_draft_seeded",
    targetType: "report",
    targetId: report.id,
    detail: "Nuclear/D-A-CH Position Paper staged as pending for board review",
  });

  return NextResponse.json({ ok: true, id: report.id, status: report.status, sourceRef }, { status: 200 });
}
