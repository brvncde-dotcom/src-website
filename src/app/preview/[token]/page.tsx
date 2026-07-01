"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Eye, Calendar, User, Loader2 } from "lucide-react";
import MarkdownRenderer from "@/components/MarkdownRenderer";

const SECTION_LABELS: Record<string, string> = {
  "digital-power-ai": "Digital Power & AI",
  "geopolitics-hard-security": "Geopolitics & Hard Security",
  "energy-resources": "Energy & Resources",
  "climate-environment-food": "Climate, Environment & Food",
  "economy-competitiveness": "Economy & Competitiveness",
  "society-migration-institutions": "Society, Migration & Institutions",
};

const FIGURE_LABELS: Record<string, string> = {
  en: "Figure ",
  de: "Abbildung ",
  fr: "Figure ",
  it: "Figura ",
};

interface PreviewReport {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  type: string;
  section: string;
  status: string;
  language: string;
  author: string | null;
  publishedAt: string | null;
  createdAt: string;
}

export default function PreviewPage() {
  const params = useParams();
  const token = String(params?.token || "");
  const [report, setReport] = useState<PreviewReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/preview/${token}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data: PreviewReport) => {
        setReport(data);
        document.title = `DRAFT — ${data.title}`;
        if (data.language) document.documentElement.lang = data.language;
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading preview…
        </div>
      </main>
    );
  }

  if (notFound || !report) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-lg font-semibold text-[#0A2540] mb-1">Preview not available</p>
          <p className="text-sm text-muted-foreground">
            This preview link is invalid or has been revoked.
          </p>
        </div>
      </main>
    );
  }

  const dateStr = report.publishedAt || report.createdAt;

  return (
    <main className="min-h-screen bg-white">
      {/* Amber DRAFT PREVIEW banner */}
      <div className="sticky top-0 z-50 bg-amber-400 text-[#0A2540]">
        <div className="mx-auto max-w-4xl px-6 lg:px-10 py-2.5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
          <Eye className="h-4 w-4" />
          Draft Preview
          <span className="ml-2 font-medium normal-case tracking-normal text-[#0A2540]/80">
            Not published — for internal review only ({report.status})
          </span>
        </div>
      </div>

      {/* Report header */}
      <div className="border-b border-[#D8DEE6]">
        <div className="mx-auto max-w-4xl px-6 lg:px-10 py-10 sm:py-14">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="inline-flex items-center justify-center bg-[#0A2540] text-white px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-sm">
              {report.type}
            </span>
            <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
              {SECTION_LABELS[report.section] || report.section}
            </span>
            {report.language && (
              <span className="text-[9px] font-bold uppercase bg-[#F0F2F5] text-[#5A6B7F] px-1.5 py-0.5 rounded-sm">
                {report.language.toUpperCase()}
              </span>
            )}
          </div>

          <h1 className="heading-serif text-3xl sm:text-4xl font-bold tracking-tight leading-tight text-[#0A2540]">
            {report.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mt-5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(dateStr).toLocaleDateString(report.language || "en", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
            {report.author && (
              <span className="inline-flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {report.author}
              </span>
            )}
          </div>

          {report.summary && (
            <p className="mt-6 text-lg text-[#33475B] leading-relaxed">
              {report.summary}
            </p>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-4xl px-6 lg:px-10 py-10 sm:py-14">
        {report.content ? (
          <div
            className="src-report-content"
            style={{ "--src-figure-label": FIGURE_LABELS[report.language] || "Figure " } as React.CSSProperties}
          >
            <MarkdownRenderer content={report.content} />
          </div>
        ) : (
          <div className="text-sm text-muted-foreground italic">
            No full content available for this draft yet.
          </div>
        )}
      </div>
    </main>
  );
}
