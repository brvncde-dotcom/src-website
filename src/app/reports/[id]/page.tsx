"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Markdown from "react-markdown";
import {
  ArrowLeft,
  Calendar,
  User,
  BookOpen,
} from "lucide-react";
import { useLang } from "@/components/LangProvider";

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
  author: string | null;
  publishedAt: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  sourceRef: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ReportPage() {
  const { t: tr } = useLang();
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/reports/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data) => setReport(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.id]);

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
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A2540] hover:text-[#E8272C] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {tr("reports.detail.back")}
          </Link>
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
        <div className="mx-auto max-w-4xl px-6 lg:px-10 py-4">
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-[#0A2540] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {tr("reports.detail.all-reports")}
          </Link>
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
          </div>
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
        </div>
      </div>

      {/* Report Content */}
      <div className="mx-auto max-w-4xl px-6 lg:px-10 py-10 sm:py-14">
        {report.content ? (
          <article className="prose-src">
            <Markdown>{report.content}</Markdown>
          </article>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {tr("reports.detail.no-content")}
            </p>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="border-t border-[#D8DEE6]">
        <div className="mx-auto max-w-4xl px-6 lg:px-10 py-6">
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-[#0A2540] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {tr("reports.detail.back-all")}
          </Link>
        </div>
      </div>
    </main>
  );
}