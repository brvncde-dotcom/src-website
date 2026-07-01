"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Clock,
  Lock,
  ArrowRight,
  Share2,
  Bookmark,
  FileDown,
  ChevronDown,
  ChevronUp,
  Newspaper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/AuthDialog";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { useLang } from "@/components/LangProvider";

interface Brief {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  publishedAt: string;
  author: string | null;
  language: string;
  section: string;
  isFreeMonthlyPick: boolean;
  accessLevel: "full" | "preview" | "none";
  accessReason: string;
  code: string | null;
  sourceRef: string | null;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDate(iso: string, lang: string) {
  return new Date(iso).toLocaleDateString(
    lang === "de" ? "de-CH" : lang === "fr" ? "fr-CH" : lang === "it" ? "it-CH" : "en-GB",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  );
}

function formatShortDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function isTodayBrief(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function editionCode(brief: Brief): string {
  if (brief.code) return brief.code;
  const d = new Date(brief.publishedAt);
  const yy = d.getFullYear();
  const doy = Math.floor((d.getTime() - new Date(yy, 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return `SRC-DB-${yy}-${String(doy).padStart(3, "0")}`;
}

function contentNumber(brief: Brief): string {
  return brief.code ?? brief.id.slice(-6).toUpperCase();
}

function langLabel(lang: string): string {
  return lang.toUpperCase();
}

function storyCount(brief: Brief): number {
  if (!brief.summary) return 0;
  // Count non-empty paragraphs as proxy for story items until structured data is available
  const paras = brief.summary.split(/\n\n+/).filter((p) => p.trim().length > 0);
  return Math.max(1, paras.length);
}

/* ------------------------------------------------------------------ */
/* Domain & urgency chips                                             */
/* ------------------------------------------------------------------ */

const DOMAIN_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  Geopolitics: { bg: "#EDE8F5", text: "#4A2A7A", border: "#C8BAE8", label: "Geopolitics" },
  "Digital/AI": { bg: "#E8F1FD", text: "#1A4E8C", border: "#B8D0F0", label: "Digital / AI" },
  Energy: { bg: "#FEF3E0", text: "#7A4800", border: "#F0D4A0", label: "Energy" },
  Economy: { bg: "#E8F5F0", text: "#0E5C3A", border: "#B8DEC8", label: "Economy" },
  Society: { bg: "#F5E8EC", text: "#7A1A34", border: "#E0B8C4", label: "Society" },
};

function inferDomain(section: string): { bg: string; text: string; border: string; label: string } {
  const s = section.toLowerCase();
  if (s.includes("geo") || s.includes("security") || s.includes("defence") || s.includes("military"))
    return DOMAIN_STYLES.Geopolitics;
  if (s.includes("digital") || s.includes("ai") || s.includes("cyber") || s.includes("tech"))
    return DOMAIN_STYLES["Digital/AI"];
  if (s.includes("energy") || s.includes("climate") || s.includes("environment") || s.includes("food"))
    return DOMAIN_STYLES.Energy;
  if (s.includes("econom") || s.includes("market") || s.includes("finance") || s.includes("trade"))
    return DOMAIN_STYLES.Economy;
  if (s.includes("societ") || s.includes("migrat") || s.includes("institution") || s.includes("demograph"))
    return DOMAIN_STYLES.Society;
  // Default — neutral green-tinted chip that matches the Daily Brief identity
  return { bg: "#E8F5F0", text: "#0E5C3A", border: "#B8DEC8", label: section || "Brief" };
}

const URGENCY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  High: { bg: "#FEE2E2", text: "#7F1D1D", border: "#FECACA" },
  Medium: { bg: "#FEF3C7", text: "#78350F", border: "#FDE68A" },
  Monitor: { bg: "#D1FAE5", text: "#065F46", border: "#A7F3D0" },
};

function inferUrgency(_section: string): { bg: string; text: string; border: string; label: string } {
  // Default to Monitor until structured urgency data is available
  return { ...URGENCY_STYLES.Monitor, label: "Monitor" };
}

/* ------------------------------------------------------------------ */
/* Markdown analysis block parser                                     */
/* ------------------------------------------------------------------ */

function parseAnalysisBlocks(content: string): Array<{ title: string; body: string }> {
  const lines = content.split("\n");
  const blocks: Array<{ title: string; body: string }> = [];
  let currentTitle = "Analysis";
  let currentBody: string[] = [];

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (currentBody.length > 0) {
        blocks.push({ title: currentTitle, body: currentBody.join("\n").trim() });
      }
      currentTitle = line.slice(3).trim();
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }

  if (currentBody.length > 0 || blocks.length === 0) {
    blocks.push({ title: currentTitle, body: currentBody.join("\n").trim() });
  }

  return blocks;
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                     */
/* ------------------------------------------------------------------ */

function PulsingBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-[#071F10] bg-[#2ECC7A] px-2.5 py-1">
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#071F10] opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#071F10]" />
      </span>
      {children}
    </span>
  );
}

function AccessTierPill({
  label,
  sub,
  active,
}: {
  label: string;
  sub: string;
  active?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase px-3 py-1 border ${
        active
          ? "bg-[#2ECC7A] text-[#071F10] border-[#2ECC7A]"
          : "bg-[#0B2E18] text-[#8BA89A] border-[#1A4A35]"
      }`}
    >
      <span>{label}</span>
      <span className={`${active ? "text-[#071F10]/70" : "text-[#8BA89A]/60"}`}>·</span>
      <span className={`${active ? "text-[#071F10]/70" : "text-[#8BA89A]/60"}`}>{sub}</span>
    </span>
  );
}

function AnalysisBlock({
  number,
  title,
  body,
}: {
  number: number;
  title: string;
  body: string;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-[#B8DEC8] bg-white">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F2F7F4] transition-colors"
      >
        <span
          className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white"
          style={{ backgroundColor: "#071F10" }}
        >
          {String(number).padStart(2, "0")}
        </span>
        <span
          className="flex-1 text-sm font-semibold italic"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "#0A1F14" }}
        >
          {title}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-[#0E5C3A]" /> : <ChevronDown className="w-4 h-4 text-[#0E5C3A]" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1">
          <div className="text-sm leading-relaxed" style={{ color: "#1A332A" }}>
            <MarkdownRenderer content={body} />
          </div>
        </div>
      )}
    </div>
  );
}

function ArchiveRow({
  brief,
  onClick,
}: {
  brief: Brief;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-3 text-left border-b border-[#D8E6DD] hover:bg-[#E8F0EA] transition-colors"
    >
      <span className="text-xs text-[#5A7A6A] w-24 flex-shrink-0">{formatShortDate(brief.publishedAt)}</span>
      <span className="flex-1 text-sm font-medium text-[#0A1F14] truncate" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
        {brief.title}
      </span>
      <span className="text-[10px] text-[#5A7A6A] font-mono hidden sm:inline">{editionCode(brief)}</span>
      <span className="text-[10px] text-[#5A7A6A] w-16 text-right">{storyCount(brief)} stories</span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                     */
/* ------------------------------------------------------------------ */

export function DailyBriefView() {
  const { t: tr, lang } = useLang();
  const { status, data: session } = useSession();
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/briefs?limit=20")
      .then((r) => r.json())
      .then((d) => setBriefs(d.briefs ?? []))
      .catch(() => setBriefs([]))
      .finally(() => setLoading(false));
  }, [session]);

  const latest = briefs[0] ?? null;
  const archive = briefs.slice(1);

  const handleShare = useCallback(async (brief: Brief) => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: brief.title, url });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  }, []);

  const handleSave = useCallback(
    async (brief: Brief) => {
      if (status !== "authenticated") {
        setAuthOpen(true);
        return;
      }
      try {
        const res = await fetch(`/api/me/saved/${brief.id}`, { method: "POST" });
        if (res.ok) setSavedId(brief.id);
      } catch {
        // ignore
      }
    },
    [status]
  );

  if (loading) {
    return (
      <div className="min-h-[70vh]" style={{ backgroundColor: "#F2F7F4" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="border border-[#D8E6DD] bg-white p-6 animate-pulse">
              <div className="h-4 bg-[#E8F0EA] rounded w-1/3 mb-3" />
              <div className="h-6 bg-[#E8F0EA] rounded w-3/4 mb-2" />
              <div className="h-4 bg-[#E8F0EA] rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!latest) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center" style={{ backgroundColor: "#F2F7F4" }}>
        <div className="text-center">
          <Clock className="w-8 h-8 text-[#5A7A6A] mx-auto mb-3" />
          <p className="text-sm text-[#5A7A6A]">{tr("brief.empty")}</p>
        </div>
      </div>
    );
  }

  const hasFull = latest.accessLevel === "full";
  const isLatestToday = isTodayBrief(latest.publishedAt);
  const edCode = editionCode(latest);
  const cNum = contentNumber(latest);
  const domain = inferDomain(latest.section);
  const urgency = inferUrgency(latest.section);
  const stories = storyCount(latest);

  // Parse analysis blocks from full content
  const analysisBlocks = useMemo(() => {
    if (!latest.content) return [];
    return parseAnalysisBlocks(latest.content);
  }, [latest.content]);

  return (
    <div className="min-h-[70vh]" style={{ backgroundColor: "#F2F7F4" }}>
      {/* ============================================================ */}
      {/* 1. Masthead                                                  */}
      {/* ============================================================ */}
      <header
        className="border-l-4 px-5 sm:px-8 py-6 sm:py-8"
        style={{ backgroundColor: "#071F10", borderLeftColor: "#2ECC7A" }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1
                className="text-xl sm:text-2xl font-bold text-white leading-tight"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                SRC Daily Brief
              </h1>
              <div className="mt-2 flex items-center gap-3 text-[11px] text-[#8BA89A] font-mono">
                <span>{edCode}</span>
                <span className="text-[#1A4A35]">|</span>
                <span>{formatTime(latest.publishedAt)} CET</span>
              </div>
            </div>
            {isLatestToday && (
              <div className="flex-shrink-0">
                <PulsingBadge>Today&apos;s Edition</PulsingBadge>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. Metadata strip                                            */}
      {/* ============================================================ */}
      <div className="px-5 sm:px-8 py-2.5" style={{ backgroundColor: "#0B2E18" }}>
        <div className="max-w-3xl mx-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono text-[#8BA89A]">
          <span>
            <span className="text-[#5A7A6A]">Edition</span>{" "}
            <span className="text-[#B8D0C4]">{edCode}</span>
          </span>
          <span className="hidden sm:inline text-[#1A4A35]">·</span>
          <span>
            <span className="text-[#5A7A6A]">Content-Nr</span>{" "}
            <span className="text-[#B8D0C4]">{cNum}</span>
          </span>
          <span className="hidden sm:inline text-[#1A4A35]">·</span>
          <span>
            <span className="text-[#5A7A6A]">Section</span>{" "}
            <span className="text-[#B8D0C4]">{latest.section || "Daily Brief"}</span>
          </span>
          <span className="hidden sm:inline text-[#1A4A35]">·</span>
          <span>
            <span className="text-[#5A7A6A]">Author</span>{" "}
            <span className="text-[#B8D0C4]">{latest.author || "SRC Desk"}</span>
          </span>
          <span className="hidden sm:inline text-[#1A4A35]">·</span>
          <span>
            <span className="text-[#5A7A6A]">Language</span>{" "}
            <span className="text-[#B8D0C4]">{langLabel(latest.language)}</span>
          </span>
          <span className="hidden sm:inline text-[#1A4A35]">·</span>
          <span>
            <span className="text-[#5A7A6A]">Stories</span>{" "}
            <span className="text-[#B8D0C4]">{stories}</span>
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. Access tier banner                                        */}
      {/* ============================================================ */}
      <div className="px-5 sm:px-8 py-3" style={{ backgroundColor: "#0E4D30" }}>
        <div className="max-w-3xl mx-auto flex flex-wrap items-center gap-2">
          <AccessTierPill label="Free" sub="Headlines" active={!hasFull} />
          <AccessTierPill label="Essential+" sub="Full Brief" active={hasFull} />
          <AccessTierPill label="Professional+" sub="PDF" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ========================================================== */}
        {/* 4. Story items (visible to all)                            */}
        {/* ========================================================== */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Newspaper className="w-4 h-4 text-[#0E5C3A]" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#5A7A6A]">
              Headlines
            </span>
          </div>

          {/* Single story item using available data */}
          <article className="border border-[#B8DEC8] bg-white p-5 sm:p-6">
            <div className="flex items-start gap-3 mb-3">
              <span
                className="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 text-xs font-bold text-white"
                style={{ backgroundColor: "#071F10" }}
              >
                01
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 border"
                  style={{
                    backgroundColor: domain.bg,
                    color: domain.text,
                    borderColor: domain.border,
                  }}
                >
                  {domain.label}
                </span>
                <span
                  className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 border"
                  style={{
                    backgroundColor: urgency.bg,
                    color: urgency.text,
                    borderColor: urgency.border,
                  }}
                >
                  {urgency.label}
                </span>
              </div>
            </div>
            <h3
              className="text-base sm:text-lg font-bold leading-snug mb-2"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "#0A1F14" }}
            >
              {latest.title}
            </h3>
            {latest.summary && (
              <p className="text-sm leading-relaxed" style={{ color: "#1A332A" }}>
                {latest.summary}
              </p>
            )}
            <div className="mt-3">
              <code className="text-[10px] font-mono px-1.5 py-0.5 bg-[#F2F7F4] text-[#0E5C3A]">
                {latest.sourceRef || edCode}
              </code>
            </div>
          </article>
        </section>

        {/* ========================================================== */}
        {/* 5. Full analysis (Essential+ only)                         */}
        {/* ========================================================== */}
        {hasFull && analysisBlocks.length > 0 && (
          <section className="space-y-4">
            <div
              className="flex items-center gap-3 px-4 py-2.5"
              style={{ backgroundColor: "#0E4D30" }}
            >
              <Lock className="w-3.5 h-3.5 text-[#2ECC7A]" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#2ECC7A]">
                Essential+
              </span>
              <span className="text-[10px] text-[#8BA89A]">Full Analysis</span>
            </div>
            <div className="space-y-3">
              {analysisBlocks.map((block, idx) => (
                <AnalysisBlock
                  key={idx}
                  number={idx + 1}
                  title={block.title}
                  body={block.body}
                />
              ))}
            </div>
          </section>
        )}

        {/* ========================================================== */}
        {/* 6. Gate block (when not full)                              */}
        {/* ========================================================== */}
        {!hasFull && (
          <section className="relative border border-[#B8DEC8] bg-white p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-4 h-4 text-[#0E5C3A]" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#5A7A6A]">
                Full Analysis
              </span>
            </div>
            <div className="space-y-2 opacity-40">
              <div className="h-3 bg-[#E8F0EA] rounded w-3/4" />
              <div className="h-3 bg-[#E8F0EA] rounded w-full" />
              <div className="h-3 bg-[#E8F0EA] rounded w-5/6" />
              <div className="h-3 bg-[#E8F0EA] rounded w-2/3" />
            </div>
            {/* Gradient fade */}
            <div
              className="absolute inset-x-0 bottom-0 h-24"
              style={{
                background: "linear-gradient(to bottom, transparent, #F2F7F4)",
              }}
            />
            {/* CTA */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-1">
              <p className="text-xs text-[#5A7A6A]">
                {status === "unauthenticated"
                  ? "Sign in or upgrade to read the full analysis."
                  : "Upgrade to Essential+ for the full daily brief and analysis."}
              </p>
              {status === "unauthenticated" ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAuthOpen(true)}
                  className="flex-shrink-0 text-xs h-9 px-4"
                  style={{ borderColor: "#0E4D30", color: "#0E4D30" }}
                >
                  Sign In <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="flex-shrink-0 text-xs h-9 px-4"
                  style={{ backgroundColor: "#0E4D30" }}
                >
                  Upgrade <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          </section>
        )}

        {/* ========================================================== */}
        {/* 7. Edition footer                                            */}
        {/* ========================================================== */}
        <footer className="px-5 sm:px-6 py-5" style={{ backgroundColor: "#071F10" }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono text-[#8BA89A]">
              <span>
                <span className="text-[#5A7A6A]">Edition</span>{" "}
                <span className="text-[#B8D0C4]">{edCode}</span>
              </span>
              <span className="text-[#1A4A35]">·</span>
              <span>
                <span className="text-[#5A7A6A]">Content-Nr</span>{" "}
                <span className="text-[#B8D0C4]">{cNum}</span>
              </span>
              {latest.sourceRef && (
                <>
                  <span className="text-[#1A4A35]">·</span>
                  <span>
                    <span className="text-[#5A7A6A]">Source Ref</span>{" "}
                    <span className="text-[#B8D0C4]">{latest.sourceRef}</span>
                  </span>
                </>
              )}
              <span className="text-[#1A4A35]">·</span>
              <span>
                <span className="text-[#5A7A6A]">Published</span>{" "}
                <span className="text-[#B8D0C4]">
                  {formatShortDate(latest.publishedAt)} {formatTime(latest.publishedAt)} CET
                </span>
              </span>
              <span className="text-[#1A4A35]">·</span>
              <span>
                <span className="text-[#5A7A6A]">Classification</span>{" "}
                <span className="text-[#B8D0C4]">
                  {hasFull ? "Essential+" : "Free · Headlines"}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleShare(latest)}
                className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-[#8BA89A] hover:text-[#2ECC7A] transition-colors px-2 py-1"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </button>
              <button
                onClick={() => handleSave(latest)}
                className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-[#8BA89A] hover:text-[#2ECC7A] transition-colors px-2 py-1"
              >
                <Bookmark className="w-3.5 h-3.5" />
                {savedId === latest.id ? "Saved" : "Save"}
              </button>
              <button
                className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-[#8BA89A] hover:text-[#2ECC7A] transition-colors px-2 py-1"
                onClick={() => {/* PDF download not yet implemented */}}
              >
                <FileDown className="w-3.5 h-3.5" />
                PDF
              </button>
            </div>
          </div>
        </footer>

        {/* ========================================================== */}
        {/* 8. Archive                                                   */}
        {/* ========================================================== */}
        {archive.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-[10px] font-bold tracking-widest uppercase text-[#5A7A6A] flex items-center gap-3">
              <span className="flex-1 h-px bg-[#D8E6DD]" />
              {tr("brief.archive")}
              <span className="flex-1 h-px bg-[#D8E6DD]" />
            </h2>
            <div className="border border-[#D8E6DD] bg-white">
              {archive.map((brief) => (
                <ArchiveRow
                  key={brief.id}
                  brief={brief}
                  onClick={() => {
                    // Scroll to top and set this brief as focused
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    // In a future iteration, brief selection state could be added here
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        onSuccess={() => setAuthOpen(false)}
      />
    </div>
  );
}
