"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  User,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Share2,
  Mail,
  Check,
} from "lucide-react";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { useLang } from "@/components/LangProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

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
  publishedAt: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
  translations?: { id: string; language: string; title: string }[];
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

export default function ReportPage() {
  const { t: tr } = useLang();
  const params = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Auth & bookmark state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // Share state
  const [shareOpen, setShareOpen] = useState(false);
  const [shareLoading, setShareLoading] = useState<string | null>(null);
  const [sharedConfirmation, setSharedConfirmation] = useState<string | null>(null);

  // Check auth status and saved state on mount
  useEffect(() => {
    fetch("/api/auth/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setIsAuthenticated(true);
          // Check if this report is saved
          fetch("/api/me/saved")
            .then((r) => (r.ok ? r.json() : { saved: [] }))
            .then((savedData) => {
              const savedIds = (savedData.saved || []).map(
                (s: { reportId: string }) => s.reportId
              );
              if (params.id) {
                setIsSaved(savedIds.includes(params.id as string));
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, [params.id]);

  useEffect(() => {
    if (!params.id) return;
    const lang = typeof window !== "undefined" ? localStorage.getItem("src_lang") || "en" : "en";
    fetch(`/api/reports/${params.id}?lang=${lang}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data) => setReport(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleBookmarkToggle = async () => {
    if (!isAuthenticated) {
      window.location.href = "/?tab=account";
      return;
    }
    if (!params.id || bookmarkLoading) return;
    setBookmarkLoading(true);
    try {
      if (isSaved) {
        const res = await fetch(`/api/me/saved/${params.id}`, {
          method: "DELETE",
        });
        if (res.ok) setIsSaved(false);
      } else {
        const res = await fetch(`/api/me/saved/${params.id}`, {
          method: "POST",
        });
        if (res.ok) setIsSaved(true);
      }
    } catch {
      // silently fail
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleShare = async (channel: string) => {
    if (!params.id || shareLoading) return;
    setShareLoading(channel);
    setSharedConfirmation(null);
    try {
      const res = await fetch(`/api/content/${params.id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel }),
      });
      if (!res.ok) {
        setShareLoading(null);
        return;
      }
      const data = await res.json();
      const fullUrl = `${window.location.origin}${data.shareUrl}`;
      const title = report?.title || "SRC Advisory Report";

      if (channel === "copy") {
        await navigator.clipboard.writeText(fullUrl);
      } else if (channel === "email") {
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Read this report: ${fullUrl}`)}`;
      } else if (channel === "twitter") {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(fullUrl)}`,
          "_blank",
          "noopener,noreferrer"
        );
      } else if (channel === "linkedin") {
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`,
          "_blank",
          "noopener,noreferrer"
        );
      }

      setSharedConfirmation(channel);
      setTimeout(() => setSharedConfirmation(null), 2000);
    } catch {
      // silently fail
    } finally {
      setShareLoading(null);
    }
  };

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
            {/* Bookmark button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleBookmarkToggle}
                  disabled={bookmarkLoading}
                  className="inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-[#0A2540] hover:bg-[#0A2540]/5 transition-colors disabled:opacity-50"
                  aria-label={isSaved ? "Unsave report" : "Save report"}
                >
                  {isSaved ? (
                    <BookmarkCheck className="h-4.5 w-4.5 text-[#E8272C]" />
                  ) : (
                    <Bookmark className="h-4.5 w-4.5" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {!isAuthenticated
                  ? "Sign in to save"
                  : isSaved
                    ? "Unsave"
                    : "Save"}
              </TooltipContent>
            </Tooltip>

            {/* Share button */}
            <button
              onClick={() => setShareOpen(true)}
              className="inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-[#0A2540] hover:bg-[#0A2540]/5 transition-colors"
              aria-label="Share report"
            >
              <Share2 className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#0A2540]">Share Report</DialogTitle>
            <DialogDescription>
              {report?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {/* Email */}
            <button
              onClick={() => handleShare("email")}
              disabled={shareLoading !== null}
              className="flex items-center gap-3 rounded-md border border-[#D8DEE6] px-4 py-3 text-sm font-medium text-[#0A2540] hover:bg-[#0A2540]/5 transition-colors disabled:opacity-50"
            >
              <Mail className="h-4 w-4" />
              <span>
                {sharedConfirmation === "email" ? (
                  <span className="inline-flex items-center gap-1 text-green-600">
                    <Check className="h-3.5 w-3.5" /> Shared!
                  </span>
                ) : (
                  "Email"
                )}
              </span>
            </button>

            {/* Twitter / X */}
            <button
              onClick={() => handleShare("twitter")}
              disabled={shareLoading !== null}
              className="flex items-center gap-3 rounded-md border border-[#D8DEE6] px-4 py-3 text-sm font-medium text-[#0A2540] hover:bg-[#0A2540]/5 transition-colors disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>
                {sharedConfirmation === "twitter" ? (
                  <span className="inline-flex items-center gap-1 text-green-600">
                    <Check className="h-3.5 w-3.5" /> Shared!
                  </span>
                ) : (
                  "X / Twitter"
                )}
              </span>
            </button>

            {/* LinkedIn */}
            <button
              onClick={() => handleShare("linkedin")}
              disabled={shareLoading !== null}
              className="flex items-center gap-3 rounded-md border border-[#D8DEE6] px-4 py-3 text-sm font-medium text-[#0A2540] hover:bg-[#0A2540]/5 transition-colors disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              <span>
                {sharedConfirmation === "linkedin" ? (
                  <span className="inline-flex items-center gap-1 text-green-600">
                    <Check className="h-3.5 w-3.5" /> Shared!
                  </span>
                ) : (
                  "LinkedIn"
                )}
              </span>
            </button>

            {/* Copy Link */}
            <button
              onClick={() => handleShare("copy")}
              disabled={shareLoading !== null}
              className="flex items-center gap-3 rounded-md border border-[#D8DEE6] px-4 py-3 text-sm font-medium text-[#0A2540] hover:bg-[#0A2540]/5 transition-colors disabled:opacity-50"
            >
              <Share2 className="h-4 w-4" />
              <span>
                {sharedConfirmation === "copy" ? (
                  <span className="inline-flex items-center gap-1 text-green-600">
                    <Check className="h-3.5 w-3.5" /> Copied!
                  </span>
                ) : (
                  "Copy Link"
                )}
              </span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

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
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Translations:</span>
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

      {/* Report Content */}
      <div className="mx-auto max-w-4xl px-6 lg:px-10 py-10 sm:py-14">
        {report.content ? (
          <article className="prose-src">
            <MarkdownRenderer content={report.content} />
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
          <BackLink label={tr("reports.detail.back-all")} />
        </div>
      </div>
    </main>
  );
}