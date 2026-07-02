import { prisma } from "@/lib/db";

interface ReportLike {
  id: string;
  title: string;
  summary: string | null;
  section: string;
  type: string;
  language: string;
}

interface MonitorLike {
  id: string;
  keywords: string[];
  sections: string[];
  types: string[];
  languages: string[];
}

export function matchReport(report: ReportLike, monitor: MonitorLike): string[] | null {
  const matched: string[] = [];

  // Dimension filters: empty array = wildcard (match all)
  if (monitor.sections.length > 0 && !monitor.sections.includes(report.section)) return null;
  if (monitor.types.length > 0 && !monitor.types.includes(report.type)) return null;
  if (monitor.languages.length > 0 && !monitor.languages.includes(report.language)) return null;

  if (monitor.sections.includes(report.section)) matched.push(`section:${report.section}`);
  if (monitor.types.includes(report.type)) matched.push(`type:${report.type}`);

  // Keyword scan: any keyword in title or summary triggers a match
  if (monitor.keywords.length > 0) {
    const haystack = `${report.title} ${report.summary ?? ""}`.toLowerCase();
    for (const kw of monitor.keywords) {
      if (haystack.includes(kw.toLowerCase())) {
        matched.push(`keyword:${kw}`);
        break; // one keyword is enough; don't inflate matchedOn
      }
    }
    // If keywords were specified but none matched, and sections/types had no hits, skip
    const hasKeywordMatch = matched.some((m) => m.startsWith("keyword:"));
    const hasDimensionMatch = matched.some((m) => m.startsWith("section:") || m.startsWith("type:"));
    if (!hasKeywordMatch && !hasDimensionMatch) return null;
  }

  // At least one criterion must have matched
  if (matched.length === 0) {
    // All dimension filters were wildcards (empty) and no keywords — still a match
    // for monitors with no criteria (catch-all monitors)
    matched.push("all-content");
  }

  return matched;
}

export async function runMonitorScanForReport(reportId: string): Promise<void> {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { id: true, title: true, summary: true, section: true, type: true, language: true },
  });
  if (!report) return;

  const monitors = await prisma.contentMonitor.findMany({
    where: { isActive: true },
    select: { id: true, keywords: true, sections: true, types: true, languages: true },
  });

  const toCreate: { monitorId: string; reportId: string; matchedOn: string[] }[] = [];

  for (const monitor of monitors) {
    const matchedOn = matchReport(report, monitor);
    if (matchedOn) {
      toCreate.push({ monitorId: monitor.id, reportId: report.id, matchedOn });
    }
  }

  if (toCreate.length === 0) return;

  // Upsert: skip if match already exists (idempotent for re-runs)
  await Promise.all(
    toCreate.map((m) =>
      prisma.monitorMatch.upsert({
        where: { monitorId_reportId: { monitorId: m.monitorId, reportId: m.reportId } },
        create: m,
        update: {},
      })
    )
  );
}

export async function runMonitorScanAll(): Promise<{ scanned: number; matched: number }> {
  const reports = await prisma.report.findMany({
    where: { status: "published" },
    select: { id: true, title: true, summary: true, section: true, type: true, language: true },
  });

  const monitors = await prisma.contentMonitor.findMany({
    where: { isActive: true },
    select: { id: true, keywords: true, sections: true, types: true, languages: true },
  });

  const toCreate: { monitorId: string; reportId: string; matchedOn: string[] }[] = [];

  for (const report of reports) {
    for (const monitor of monitors) {
      const matchedOn = matchReport(report, monitor);
      if (matchedOn) {
        toCreate.push({ monitorId: monitor.id, reportId: report.id, matchedOn });
      }
    }
  }

  if (toCreate.length > 0) {
    await Promise.all(
      toCreate.map((m) =>
        prisma.monitorMatch.upsert({
          where: { monitorId_reportId: { monitorId: m.monitorId, reportId: m.reportId } },
          create: m,
          update: {},
        })
      )
    );
  }

  return { scanned: reports.length, matched: toCreate.length };
}
