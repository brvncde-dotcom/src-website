import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const TEMP_SECRET = "e29ed85d-4304-4331-b8cc-ff007cea88fb";

const REGISTRY: { code: string; sourceRef: string; language: string }[] = [
  // CLM
  { code: "CLMANA-DE-0626-01", sourceRef: "SRC-22", language: "de" },
  { code: "CLMANA-FR-0626-01", sourceRef: "SRC-22", language: "fr" },
  { code: "CLMANA-IT-0626-01", sourceRef: "SRC-22", language: "it" },
  { code: "CLMOPN-DE-0626-01", sourceRef: "SRC-451", language: "de" },
  { code: "CLMOPN-EN-0626-01", sourceRef: "SRC-451", language: "en" },
  { code: "CLMOPN-FR-0626-01", sourceRef: "SRC-451", language: "fr" },
  { code: "CLMOPN-IT-0626-01", sourceRef: "SRC-451", language: "it" },
  // DIG
  { code: "DIGANA-DE-0626-01", sourceRef: "SRC-26", language: "de" },
  { code: "DIGANA-DE-0626-02", sourceRef: "SRC-47", language: "de" },
  { code: "DIGANA-EN-0626-01", sourceRef: "SRC-47", language: "en" },
  { code: "DIGANA-FR-0626-01", sourceRef: "SRC-26", language: "fr" },
  { code: "DIGANA-FR-0626-02", sourceRef: "SRC-47", language: "fr" },
  { code: "DIGANA-IT-0626-01", sourceRef: "SRC-26", language: "it" },
  { code: "DIGANA-IT-0626-02", sourceRef: "SRC-47", language: "it" },
  // ECO
  { code: "ECOANA-DE-0626-01", sourceRef: "SRC-8", language: "de" },
  { code: "ECOANA-FR-0626-01", sourceRef: "SRC-8", language: "fr" },
  { code: "ECOANA-IT-0626-01", sourceRef: "SRC-8", language: "it" },
  // ENR
  { code: "ENRANA-DE-0626-01", sourceRef: "SRC-10", language: "de" },
  { code: "ENRANA-DE-0626-02", sourceRef: "SRC-12", language: "de" },
  { code: "ENRANA-DE-0626-03", sourceRef: "SRC-185", language: "de" },
  { code: "ENRANA-DE-0626-04", sourceRef: "SRC-189", language: "de" },
  { code: "ENRANA-DE-0626-05", sourceRef: "SRC-23", language: "de" },
  { code: "ENRANA-DE-0626-06", sourceRef: "SRC-24", language: "de" },
  { code: "ENRANA-DE-0626-07", sourceRef: "SRC-9", language: "de" },
  { code: "ENRANA-EN-0626-01", sourceRef: "SRC-189", language: "en" },
  { code: "ENRANA-FR-0626-01", sourceRef: "SRC-10", language: "fr" },
  { code: "ENRANA-FR-0626-02", sourceRef: "SRC-12", language: "fr" },
  { code: "ENRANA-FR-0626-03", sourceRef: "SRC-185", language: "fr" },
  { code: "ENRANA-FR-0626-04", sourceRef: "SRC-189", language: "fr" },
  { code: "ENRANA-FR-0626-05", sourceRef: "SRC-23", language: "fr" },
  { code: "ENRANA-FR-0626-06", sourceRef: "SRC-24", language: "fr" },
  { code: "ENRANA-FR-0626-07", sourceRef: "SRC-9", language: "fr" },
  { code: "ENRANA-IT-0626-01", sourceRef: "SRC-10", language: "it" },
  { code: "ENRANA-IT-0626-02", sourceRef: "SRC-12", language: "it" },
  { code: "ENRANA-IT-0626-03", sourceRef: "SRC-185", language: "it" },
  { code: "ENRANA-IT-0626-04", sourceRef: "SRC-189", language: "it" },
  { code: "ENRANA-IT-0626-05", sourceRef: "SRC-23", language: "it" },
  { code: "ENRANA-IT-0626-06", sourceRef: "SRC-24", language: "it" },
  { code: "ENRANA-IT-0626-07", sourceRef: "SRC-9", language: "it" },
  // GEO
  { code: "GEOANA-DE-0626-01", sourceRef: "SRC-11", language: "de" },
  { code: "GEOANA-DE-0626-02", sourceRef: "SRC-19", language: "de" },
  { code: "GEOANA-DE-0626-03", sourceRef: "SRC-25", language: "de" },
  { code: "GEOANA-FR-0626-01", sourceRef: "SRC-11", language: "fr" },
  { code: "GEOANA-FR-0626-02", sourceRef: "SRC-19", language: "fr" },
  { code: "GEOANA-FR-0626-03", sourceRef: "SRC-25", language: "fr" },
  { code: "GEOANA-IT-0626-01", sourceRef: "SRC-11", language: "it" },
  { code: "GEOANA-IT-0626-02", sourceRef: "SRC-19", language: "it" },
  { code: "GEOANA-IT-0626-03", sourceRef: "SRC-25", language: "it" },
  // SEC
  { code: "SECANA-DE-0626-01", sourceRef: "SRC-20", language: "de" },
  { code: "SECANA-DE-0626-02", sourceRef: "SRC-21", language: "de" },
  { code: "SECANA-FR-0626-01", sourceRef: "SRC-20", language: "fr" },
  { code: "SECANA-FR-0626-02", sourceRef: "SRC-21", language: "fr" },
  { code: "SECANA-IT-0626-01", sourceRef: "SRC-20", language: "it" },
  { code: "SECANA-IT-0626-02", sourceRef: "SRC-21", language: "it" },
];

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (secret !== TEMP_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const reports = await prisma.report.findMany({
      where: { status: "published" },
      select: { id: true, sourceRef: true, language: true, title: true, code: true },
    });

    const reportMap = new Map<string, typeof reports[0]>();
    for (const r of reports) {
      if (r.sourceRef) {
        reportMap.set(`${r.sourceRef}:${r.language}`, r);
      }
    }

    let matched = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    const details: { code: string; status: string; error?: string }[] = [];

    for (const entry of REGISTRY) {
      const key = `${entry.sourceRef}:${entry.language}`;
      const report = reportMap.get(key);
      if (!report) {
        details.push({ code: entry.code, status: "missing_report" });
        continue;
      }
      matched++;

      if (report.code === entry.code) {
        skipped++;
        details.push({ code: entry.code, status: "already_correct" });
        continue;
      }

      try {
        await prisma.report.update({
          where: { id: report.id },
          data: { code: entry.code },
        });
        updated++;
        details.push({ code: entry.code, status: "updated" });
      } catch (err: unknown) {
        errors++;
        details.push({
          code: entry.code,
          status: "error",
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return NextResponse.json({
      totalPublished: reports.length,
      registrySize: REGISTRY.length,
      matched,
      updated,
      skipped,
      errors,
      details,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
