"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  User,
  BookOpen,
  Lock,
  Search,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { ContentActions } from "@/components/ContentActions";
import { useLang } from "@/components/LangProvider";
import { useSearch } from "@/components/SearchCommand";

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
  content: string | null;
  type: string;
  section: string;
  status: string;
  language: string;
  sourceRef: string | null;
  author: string | null;
  code: string | null;
  publishedAt: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
  translations?: { id: string; language: string; title: string }[];
  access?: "full" | "preview" | "denied";
  requiredTier?: string | null;
}

function BackLink({ label }: { label: string }) {
  return (
    <button
      onClick={() => window.history.back()}
      className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-[#0A2540] transition-colors"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
}

const LANG_LABELS: Record<string, string> = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
  it: "Italiano",
};

const FIGURE_LABELS: Record<string, string> = {
  en: "Figure ",
  de: "Abbildung ",
  fr: "Figure ",
  it: "Figura ",
};

const SECTION_LABELS: Record<string, string> = {
  "digital-power-ai": "Digital Power & AI",
  "geopolitics-hard-security": "Geopolitics & Hard Security",
  "energy-resources": "Energy & Resources",
  "climate-environment-food": "Climate, Environment & Food",
  "economy-competitiveness": "Economy & Competitiveness",
  "society-migration-institutions": "Society, Migration & Institutions",
};

interface RelatedReport {
  id: string;
  title: string;
  summary: string | null;
  type: string;
  section: string;
  language: string;
  publishedAt: string | null;
}

function RelatedReports({ reportId }: { reportId: string }) {
  const [related, setRelated] = useState<RelatedReport[]>([]);

  useEffect(() => {
    fetch(`/api/reports/related?id=${reportId}&limit=4`)
      .then((r) => r.json())
      .then((d) => setRelated(d.related ?? []))
      .catch(() => {});
  }, [reportId]);

  if (related.length === 0) return null;

  return (
    <div className="border-t border-[#D8DEE6] bg-[#F8F9FB]">
      <div className="mx-auto max-w-4xl px-6 lg:px-10 py-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-[#D8DEE6]" />
          <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground">
            Related Reports
          </span>
          <div className="h-px flex-1 bg-[#D8DEE6]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {related.map((r) => (
            <Link
              key={r.id}
              href={`/reports/${r.id}`}
              className="group flex flex-col gap-2 p-4 border border-[#D8DEE6] bg-white hover:border-[#0A2540]/40 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase bg-[#0A2540] text-white px-2 py-0.5 rounded-sm flex-shrink-0">
                  {r.type}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {SECTION_LABELS[r.section] ?? r.section}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-[#0A2540] group-hover:text-[#E8272C] leading-snug line-clamp-2 transition-colors">
                {r.title}
              </h4>
              {r.summary && (
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {r.summary}
                </p>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-auto pt-1">
                {r.publishedAt && (
                  <span>
                    {new Date(r.publishedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                )}
                <ArrowRight className="w-3 h-3 ml-auto text-muted-foreground group-hover:text-[#E8272C] transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ReportPage() {
  const { t: tr, setLang } = useLang();
  const { open: openSearch } = useSearch();
  const params = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    // Fetch the report by its ID only. The report's own language field drives the page locale.
    fetch(`/api/reports/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data) => {
        setReport(data);
        // Sync site language to the report's language so chrome (nav, title, html lang) matches.
        if (data.language) {
          setLang(data.language);
          document.title = data.title;
          document.documentElement.lang = data.language;
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.id, setLang]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-muted-foreground">{tr("reports.detail.loading")}</div>
      </main>
    );
  }

  if (notFound || !report) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">{tr("reports.detail.not-found")}</h1>
          <p className="text-muted-foreground mb-6">
            {tr("reports.detail.not-found.desc")}
          </p>
          <BackLink label={tr("reports.detail.back")} />
        </div>
      </main>
    );
  }

  const formattedDate = report.publishedAt
    ? new Date(report.publishedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <main className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="border-b border-[#D8DEE6]">
        <div className="mx-auto max-w-4xl px-6 lg:px-10 py-4 flex items-center justify-between">
          <BackLink label={tr("reports.detail.all-reports")} />
          <div className="flex items-center gap-1">
            {/* Search button */}
            <button
              onClick={openSearch}
              className="inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-[#0A2540] hover:bg-[#0A2540]/5 transition-colors"
              aria-label={tr("search.title")}
            >
              <Search className="h-4.5 w-4.5" />
            </button>
            <ContentActions reportId={report.id} title={report.title} />
          </div>
        </div>
      </div>

      {/* Report Header */}
      <div className="border-b border-[#D8DEE6]">
        <div className="mx-auto max-w-4xl px-6 lg:px-10 py-10 sm:py-14">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="inline-flex items-center justify-center bg-[#0A2540] text-white px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-sm">
              {report.type}
            </span>
            <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
              {tr(SECTION_KEY_MAP[report.section] || report.section)}
            </span>
            {report.language && (
              <span className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 text-[10px] uppercase tracking-wider font-bold rounded-sm">
                {LANG_LABELS[report.language] || report.language}
              </span>
            )}
          </div>
          {report.code && (
            <div className="mb-5 text-sm font-mono text-[#0A2540]">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                {tr("reports.detail.code")}
              </span>{" "}
              {report.code}
            </div>
          )}
          <h1 className="heading-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
            {report.title}
          </h1>
          {report.summary && (
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              {report.summary}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-5 mt-6 text-sm text-muted-foreground">
            {formattedDate && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formattedDate}
              </span>
            )}
            {report.author && (
              <span className="inline-flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {report.author}
              </span>
            )}
          </div>
          {report.translations && report.translations.length > 1 && (
            <div className="flex flex-wrap items-center gap-2 mt-5">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{tr("reports.detail.translations")}:</span>
              {report.translations.map((t) => (
                <Link
                  key={t.id}
                  href={`/reports/${t.id}`}
                  className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-colors ${
                    t.id === report.id
                      ? "bg-[#0A2540] text-white"
                      : "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {t.language}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reading progress */}
      <div className="src-progress" aria-hidden="true" />

      {/* Report Content */}
      <div className="mx-auto max-w-4xl px-6 lg:px-10 py-10 sm:py-14">
        {report.content ? (
          <article
            className="src-article src-article--inset"
            style={{ "--src-figure-label": FIGURE_LABELS[report.language] || "Figure " } as React.CSSProperties}
          >
            <div className="prose-src">
              <MarkdownRenderer content={report.content} />
            </div>
          </article>
        ) : report.access && report.access !== "full" ? (
          <div className="mx-auto max-w-lg border border-[#D8DEE6] bg-[#F0F3F7] px-8 py-10">
            {/* Tier badge + lock */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-full bg-[#0A2540] flex items-center justify-center flex-shrink-0">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#E8272C] mb-0.5">
                  {tr("reports.locked.member-content")}
                </p>
                <p className="text-sm font-bold text-[#0A2540]">
                  {report.requiredTier
                    ? `${report.requiredTier} ${tr("reports.locked.and-above")}`
                    : tr("reports.locked.title")}
                </p>
              </div>
            </div>

            <h3 className="text-xl font-bold text-[#0A2540] mb-1">
              {tr("reports.locked.headline")}
            </h3>
            <p className="text-sm text-muted-foreground mb-5">
              {tr("reports.locked.desc")}
            </p>

            {/* Benefits list */}
            <ul className="space-y-2 mb-7">
              {(["reports.locked.benefit1", "reports.locked.benefit2", "reports.locked.benefit3", "reports.locked.benefit4"] as const).map((key) => (
                <li key={key} className="flex items-start gap-2.5 text-sm text-[#0A2540]">
                  <CheckCircle2 className="h-4 w-4 text-[#0A2540] flex-shrink-0 mt-0.5" />
                  {tr(key)}
                </li>
              ))}
            </ul>

            <Link
              href="/?tab=membership"
              className="block w-full text-center bg-[#0A2540] hover:bg-[#0A2540]/90 text-white font-semibold text-sm uppercase tracking-wider px-5 py-3 transition-colors"
            >
              {tr("reports.locked.cta")}
            </Link>
            <p className="text-xs text-center text-muted-foreground mt-3">
              {tr("reports.locked.no-card")}
            </p>
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {tr("reports.detail.no-content")}
            </p>
          </div>
        )}
      </div>

      {/* End-of-article action strip — the "that was worth keeping" moment */}
      {report.content && (
        <div className="mx-auto max-w-4xl px-6 lg:px-10 pb-10">
          <div className="flex flex-wrap items-center justify-between gap-3 border border-[#D8DEE6] bg-[#F8F9FB] rounded-md px-5 py-4">
            <span className="text-sm text-muted-foreground">{tr("actions.keep-strip")}</span>
            <ContentActions reportId={report.id} title={report.title} showPdf={false} />
          </div>
        </div>
      )}

      {/* Related reports — pgvector nearest-neighbour recommendations */}
      {report.id && <RelatedReports reportId={report.id} />}

      {/* Bottom nav */}
      <div className="border-t border-[#D8DEE6]">
        <div className="mx-auto max-w-4xl px-6 lg:px-10 py-6">
          <BackLink label={tr("reports.detail.back-all")} />
        </div>
      </div>
    </main>
  );
}