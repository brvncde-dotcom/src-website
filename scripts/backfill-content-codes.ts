#!/usr/bin/env tsx
/**
 * Backfill SRC content codes onto already-published website content.
 *
 * Reads the content-code registry (SRC-98 / SRC-511) and matches entries
 * to Report rows by (sourceRef, language). Updates each matched report
 * with its code via the admin PATCH API.
 *
 * Usage:
 *   ADMIN_API_KEY=src-admin-review-2026 npx tsx scripts/backfill-content-codes.ts
 *   ADMIN_API_KEY=src-admin-review-2026 API_BASE=https://src-website-orcin.vercel.app npx tsx scripts/backfill-content-codes.ts
 */

const API_BASE = process.env.API_BASE || "https://src-website-orcin.vercel.app";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || process.env.SRC_ADMIN_API_KEY || "";

// Registry extracted from SRC-98 content-code-registry document (v1.1 backfill, June 2026)
// Each entry: { code, sourceRef, language }
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

async function fetchReports(): Promise<
  { id: string; sourceRef: string | null; language: string; title: string; code: string | null }[]
> {
  const res = await fetch(`${API_BASE}/api/reports?status=published&limit=100`, {
    headers: { Authorization: `Bearer ${ADMIN_API_KEY}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch reports: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.reports || [];
}

async function patchCode(reportId: string, code: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/reports/${reportId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ADMIN_API_KEY}`,
    },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) {
    throw new Error(`Failed to patch report ${reportId}: ${res.status} ${await res.text()}`);
  }
}

async function main() {
  if (!ADMIN_API_KEY) {
    console.error("ADMIN_API_KEY env var is required");
    process.exit(1);
  }

  console.log(`Fetching reports from ${API_BASE}...`);
  const reports = await fetchReports();
  console.log(`Found ${reports.length} published report(s).`);

  // Build lookup: sourceRef + language -> report
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

  for (const entry of REGISTRY) {
    const key = `${entry.sourceRef}:${entry.language}`;
    const report = reportMap.get(key);
    if (!report) {
      console.warn(`⚠ No report found for ${key} (expected ${entry.code})`);
      continue;
    }
    matched++;

    if (report.code === entry.code) {
      console.log(`⏭ Already correct: ${report.id} → ${entry.code}`);
      skipped++;
      continue;
    }

    try {
      await patchCode(report.id, entry.code);
      console.log(`✅ Updated: ${report.id} → ${entry.code}`);
      updated++;
    } catch (err) {
      console.error(`❌ Error updating ${report.id}:`, err);
      errors++;
    }
  }

  console.log("\nDone.");
  console.log(`  Matched: ${matched}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped (already correct): ${skipped}`);
  console.log(`  Errors: ${errors}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
