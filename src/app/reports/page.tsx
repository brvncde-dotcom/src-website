"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/components/LangProvider";

const SECTION_SLUGS = [
  "digital-power-ai",
  "geopolitics-hard-security",
  "energy-resources",
  "climate-environment-food",
  "economy-competitiveness",
  "society-migration-institutions",
];

const SECTION_KEY_MAP: Record<string, string> = {
  "digital-power-ai": "focus.digital",
  "geopolitics-hard-security": "focus.geopolitics",
  "energy-resources": "focus.energy",
  "climate-environment-food": "focus.climate",
  "economy-competitiveness": "focus.economy",
  "society-migration-institutions": "focus.society",
};

interface Report {
  id: string;
  title: string;
  summary: string | null;
  type: string;
  section: string;
  status: string;
  author: string | null;
  publishedAt: string | null;
  createdAt: string;
}

export default function ReportsPage() {
  const { t: tr } = useLang();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("limit", "100");
    if (activeSection) params.set("section", activeSection);

    fetch(`/api/reports?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setReports(data.reports || []);
        setTotal(data.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeSection]);

  const filteredCount = activeSection
    ? reports.filter((r) => r.section === activeSection).length
    : reports.length;

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#0A2540] text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16 sm:py-20">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <span className="section-num">04</span>
              <span className="text-xs uppercase tracking-[0.22em] text-white/60 font-semibold">
                {tr("reports.page.tag")}
              </span>
            </div>
            <h1 className="heading-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              {tr("reports.heading")}
            </h1>
            <p className="mt-4 text-white/70 leading-relaxed max-w-xl">
              {tr("reports.page.desc")}
            </p>
          </div>
        </div>
      </div>

      {/* Filters + Content */}
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-12 sm:py-16">
        {/* Section Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-10 pb-8 border-b border-[#D8DEE6]">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">
            <Filter className="h-3.5 w-3.5" />
            {tr("reports.page.filter-label")}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveSection(null)}
              className={`px-3 py-1.5 text-xs uppercase tracking-wider font-semibold rounded-sm transition-colors ${
                !activeSection
                  ? "bg-[#0A2540] text-white"
                  : "bg-[#F0F2F5] text-muted-foreground hover:bg-[#E2E6EC]"
              }`}
            >
              {tr("reports.page.all").replace("{n}", String(total))}
            </button>
            {SECTION_SLUGS.map((slug) => (
              <button
                key={slug}
                onClick={() => setActiveSection(slug === activeSection ? null : slug)}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider font-semibold rounded-sm transition-colors ${
                  activeSection === slug
                    ? "bg-[#0A2540] text-white"
                    : "bg-[#F0F2F5] text-muted-foreground hover:bg-[#E2E6EC]"
                }`}
              >
                {tr(SECTION_KEY_MAP[slug] || slug)}
              </button>
            ))}
          </div>
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">
            {tr("reports.page.loading")}
          </div>
        ) : filteredCount === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg mb-2">
              {tr("reports.page.empty")}
            </p>
            <p className="text-sm text-muted-foreground/70">
              {tr("reports.page.empty.hint")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <Link key={report.id} href={`/reports/${report.id}`}>
                <article className="card-institutional group p-6 cursor-pointer">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                    <span className="inline-flex items-center justify-center bg-[#0A2540] text-white px-3 py-1 text-[10px] uppercase tracking-wider font-bold w-fit rounded-sm">
                      {report.type}
                    </span>
                    <span className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      {report.publishedAt
                        ? new Date(report.publishedAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : new Date(report.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:ml-auto font-semibold">
                      {tr(SECTION_KEY_MAP[report.section] || report.section)}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg leading-snug tracking-tight mb-2 group-hover:text-[#0A2540] transition-colors">
                    {report.title}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">
                      {report.summary || report.title}
                    </p>
                    <span className="text-xs text-muted-foreground inline-flex items-center gap-1 group-hover:text-[#E8272C] transition-colors shrink-0 font-semibold">
                      {tr("reports.page.read")}
                      <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}