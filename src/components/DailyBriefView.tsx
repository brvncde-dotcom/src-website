"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Calendar, Clock, Lock, ArrowRight, Newspaper, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/AuthDialog";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { useLang } from "@/components/LangProvider";
import { useNavigation } from "@/components/NavigationProvider";

interface Brief {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  publishedAt: string;
  author: string | null;
  isFreeMonthlyPick: boolean;
  accessLevel: "full" | "preview" | "none";
  accessReason: string;
}

function formatDate(iso: string, lang: string) {
  return new Date(iso).toLocaleDateString(
    lang === "de" ? "de-CH" : lang === "fr" ? "fr-CH" : lang === "it" ? "it-CH" : "en-GB",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  );
}

const ESSENTIAL_BULLETS = [
  "brief.upgrade.bullet1",
  "brief.upgrade.bullet2",
  "brief.upgrade.bullet3",
];

function BriefCard({ brief, isLatest, onSignIn }: { brief: Brief; isLatest: boolean; onSignIn: () => void }) {
  const { t: tr, lang } = useLang();
  const { status } = useSession();
  const { navigate } = useNavigation();
  const hasFull = brief.accessLevel === "full";
  const [expanded, setExpanded] = useState(isLatest);

  return (
    <article className={`border border-border bg-white ${isLatest ? "shadow-sm" : ""}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
        <div className="flex-1 min-w-0">
          {isLatest && (
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-white bg-[#E8272C] px-2 py-0.5">
                <Clock className="w-3 h-3" />
                {tr("brief.today")}
              </span>
              {brief.isFreeMonthlyPick && (
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#0E7C4A] bg-[#EBF5EF] border border-[#C2DFCC] px-2 py-0.5">
                  Free
                </span>
              )}
            </div>
          )}
          <h2 className={`font-bold text-[#0A2540] leading-tight ${isLatest ? "text-lg sm:text-xl" : "text-base"}`}>
            {brief.title}
          </h2>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{formatDate(brief.publishedAt, lang)}</span>
            {brief.author && (
              <>
                <span className="text-border">·</span>
                <span>{brief.author}</span>
              </>
            )}
          </div>
        </div>

        {/* Access badge */}
        <div className="flex-shrink-0">
          {hasFull ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wide uppercase text-[#1D5FA0] bg-[#EBF1FA] border border-[#C2D4EC] px-2 py-0.5">
              {tr("brief.full-access")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wide uppercase text-muted-foreground border border-border px-2 py-0.5">
              <Lock className="w-3 h-3" />
              {tr("brief.free.label")}
            </span>
          )}
        </div>
      </div>

      {/* Summary — always visible */}
      {brief.summary && (
        <div className="px-5 sm:px-6 pb-4">
          <div className="text-sm text-[#1C2B3A] leading-relaxed whitespace-pre-line border-l-2 border-[#E8272C] pl-4">
            {brief.summary}
          </div>
        </div>
      )}

      {/* Full content — gated */}
      {hasFull && brief.content && (
        <div className="border-t border-border">
          {expanded ? (
            <div className="px-5 sm:px-6 py-5">
              <MarkdownRenderer content={brief.content} />
            </div>
          ) : (
            <button
              onClick={() => setExpanded(true)}
              className="w-full flex items-center justify-between px-5 sm:px-6 py-3.5 text-sm font-medium text-[#0A2540] hover:bg-[#F0F3F7] transition-colors"
            >
              <span>{tr("brief.read-more")}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Upgrade CTA — for unauthenticated or free-tier users */}
      {!hasFull && (
        <div className="border-t border-[#0E4D30]/20">
          {status === "unauthenticated" ? (
            <div className="bg-[#F2F7F4] px-5 sm:px-6 py-4 flex items-center justify-between gap-4">
              <p className="text-xs text-[#0E4D30] font-medium">{tr("brief.free.cta")}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={onSignIn}
                className="flex-shrink-0 text-xs h-8 border-[#0E4D30] text-[#0E4D30] hover:bg-[#0E4D30] hover:text-white"
              >
                {tr("brief.upgrade.signin")}
              </Button>
            </div>
          ) : (
            <div className="bg-[#F2F7F4] px-5 sm:px-6 py-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#0E4D30] mb-0.5">
                    {tr("brief.upgrade.tier")}
                  </p>
                  <p className="text-sm font-semibold text-[#071F10]">{tr("brief.upgrade.price")}</p>
                </div>
                <Button
                  size="sm"
                  className="flex-shrink-0 text-xs h-8 bg-[#0E4D30] hover:bg-[#071F10]"
                  onClick={() => navigate("membership")}
                >
                  {tr("brief.upgrade.cta")} <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
              <ul className="space-y-1">
                {ESSENTIAL_BULLETS.map((key) => (
                  <li key={key} className="flex items-center gap-2 text-xs text-[#1A4D2E]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2ECC7A] flex-shrink-0" />
                    {tr(key)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export function DailyBriefView() {
  const { t: tr } = useLang();
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const { data: session } = useSession();

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

  return (
    <div className="min-h-[70vh]">
      {/* Page header */}
      <div className="border-b border-border bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex items-center gap-3 mb-2">
            <Newspaper className="w-5 h-5 text-[#E8272C]" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#E8272C]">
              {tr("brief.title")}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0A2540] leading-tight">
            {tr("brief.title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl">
            {tr("brief.subtitle")}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="border border-border bg-white p-6 animate-pulse">
                <div className="h-4 bg-[#F0F3F7] rounded w-1/3 mb-3" />
                <div className="h-6 bg-[#F0F3F7] rounded w-3/4 mb-2" />
                <div className="h-4 bg-[#F0F3F7] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : briefs.length === 0 ? (
          <div className="border border-border bg-white p-10 text-center">
            <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{tr("brief.empty")}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Latest brief — prominent */}
            <section>
              <BriefCard brief={latest!} isLatest={true} onSignIn={() => setAuthOpen(true)} />
            </section>

            {/* Archive */}
            {archive.length > 0 && (
              <section>
                <h2 className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-3 flex items-center gap-2">
                  <span className="flex-1 h-px bg-border" />
                  {tr("brief.archive")}
                  <span className="flex-1 h-px bg-border" />
                </h2>
                <div className="space-y-3">
                  {archive.map((brief) => (
                    <BriefCard key={brief.id} brief={brief} isLatest={false} onSignIn={() => setAuthOpen(true)} />
                  ))}
                </div>
              </section>
            )}
          </div>
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
