"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, ExternalLink, Calendar, User } from "lucide-react";
import { useLang } from "@/components/LangProvider";
import Markdown from "react-markdown";

interface SharedReport {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  type: string;
  section: string;
  author: string | null;
  publishedAt: string | null;
}

interface ShareData {
  report: SharedReport;
  sharedBy: string;
  sharedAt: string;
  clicks: number;
}

export default function SharePage() {
  const { t: tr } = useLang();
  const params = useParams();
  const [data, setData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const token = params.token as string;
    if (!token) return;

    fetch(`/api/s/${token}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((d) => setData(d))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.token]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </main>
    );
  }

  if (notFound || !data) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 text-[#0A2540]">Share link not found</h1>
          <p className="text-muted-foreground mb-6">
            This link may have expired or is invalid.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A2540] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            SRC Advisory
          </a>
        </div>
      </main>
    );
  }

  const { report, sharedBy, sharedAt, clicks } = data;

  const formattedDate = report.publishedAt
    ? new Date(report.publishedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <main className="min-h-screen bg-white">
      {/* SRC branding bar */}
      <div className="border-b border-[#D8DEE6]">
        <div className="mx-auto max-w-4xl px-6 lg:px-10 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-sm font-semibold text-[#0A2540] hover:opacity-80 transition-opacity">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            SRC Advisory
          </a>
          <a
            href={`/reports/${report.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A2540] hover:underline"
          >
            {tr("share.page.read-full")}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Share attribution banner */}
      <div className="bg-[#F4F6F9] border-b border-[#D8DEE6]">
        <div className="mx-auto max-w-4xl px-6 lg:px-10 py-3 flex items-center gap-3 text-xs text-[#5A6B7F]">
          <span>{tr("share.page.shared-by")}: <strong>{sharedBy}</strong></span>
          <span className="text-[#D8DEE6]">|</span>
          <span>{new Date(sharedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
          {clicks > 1 && (
            <>
              <span className="text-[#D8DEE6]">|</span>
              <span>{clicks} views</span>
            </>
          )}
        </div>
      </div>

      {/* Report Header */}
      <div className="border-b border-[#D8DEE6]">
        <div className="mx-auto max-w-4xl px-6 lg:px-10 py-10 sm:py-14">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="inline-flex items-center justify-center bg-[#0A2540] text-white px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-sm">
              {report.type}
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
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Full content is available on the SRC Advisory platform.
            </p>
            <a
              href={`/reports/${report.id}`}
              className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-[#0A2540] hover:underline"
            >
              {tr("share.page.read-full")}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Copyright footer */}
      <div className="border-t border-[#D8DEE6]">
        <div className="mx-auto max-w-4xl px-6 lg:px-10 py-6">
          <p className="text-[10px] uppercase tracking-wider text-[#5A6B7F] text-center">
            {tr("share.page.copyright")}
          </p>
        </div>
      </div>
    </main>
  );
}