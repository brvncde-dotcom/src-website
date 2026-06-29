"use client";

import { useState, useEffect } from "react";
import { useLang } from "./LangProvider";
import MarkdownRenderer from "./MarkdownRenderer";

interface Opinion {
  id: string;
  title: string;
  summary: string | null;
  type: string;
  section: string;
  status: string;
  language: string;
  sourceRef: string | null;
  author: string | null;
  publishedAt: string | null;
  createdAt: string;
}

interface OpinionDetail extends Opinion {
  content: string | null;
  reviewNote: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  updatedAt: string;
  translations: { id: string; language: string; title: string }[];
}

const FIGURE_LABELS: Record<string, string> = {
  en: "Figure ",
  de: "Abbildung ",
  fr: "Figure ",
  it: "Figura ",
};

export function OpinionsView() {
  const { lang, t: tr } = useLang();
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<OpinionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch published opinions for the selected language, falling back to English
  useEffect(() => {
    let cancelled = false;
    const fetchOpinions = async (language: string) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/reports?type=Opinion&lang=${language}&limit=100`);
        const data = await res.json();
        if (!cancelled) {
          const reports = data.reports || [];
          if (reports.length > 0 || language === "en") {
            setOpinions(reports);
          } else {
            const enRes = await fetch(`/api/reports?type=Opinion&lang=en&limit=100`);
            const enData = await enRes.json();
            if (!cancelled) setOpinions(enData.reports || []);
          }
        }
      } catch {
        if (!cancelled) setOpinions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchOpinions(lang);
    return () => { cancelled = true; };
  }, [lang]);

  const toggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setDetail(null);
      return;
    }
    setExpandedId(id);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/reports/${id}`);
      if (res.ok) {
        const data = await res.json();
        setDetail(data);
      }
    } catch {
      // ignore
    } finally {
      setDetailLoading(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString(lang === "en" ? "en-US" : lang, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Header */}
      <div className="max-w-2xl mb-10">
        <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#E8272C] mb-2 block">
          {tr("opinions.tag")}
        </span>
        <h1 className="heading-serif text-2xl sm:text-3xl font-bold text-primary mb-3">
          {tr("opinions.heading")}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {tr("opinions.desc")}
        </p>
      </div>

      {loading && (
        <div className="max-w-3xl py-12 text-center text-sm text-muted-foreground">
          Loading opinions…
        </div>
      )}

      {!loading && opinions.length === 0 && (
        <div className="max-w-3xl py-16 text-center">
          <p className="text-sm text-muted-foreground">{tr("opinions.empty")}</p>
          <p className="text-xs text-muted-foreground/70 mt-2">{tr("opinions.empty.hint")}</p>
        </div>
      )}

      {!loading && opinions.length > 0 && (
        <div className="space-y-4">
          {opinions.map((opinion) => {
            const isExpanded = expandedId === opinion.id;
            return (
              <article
                key={opinion.id}
                className="border border-border hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold tracking-[0.08em] uppercase bg-secondary px-2 py-0.5 rounded-sm text-muted-foreground">
                      {tr("opinions.badge")}
                    </span>
                    {opinion.author && (
                      <span className="text-[10px] text-muted-foreground">
                        {opinion.author}
                      </span>
                    )}
                    {opinion.publishedAt && (
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(opinion.publishedAt)}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm text-primary leading-snug mb-2">
                    {opinion.title}
                  </h3>
                  {opinion.summary && (
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      {opinion.summary}
                    </p>
                  )}
                  <button
                    onClick={() => toggleExpand(opinion.id)}
                    className="text-xs font-medium text-[#E8272C] hover:underline"
                  >
                    {isExpanded ? tr("opinions.collapse") : tr("opinions.read-full")}
                  </button>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 border-t border-border pt-4">
                    {detailLoading && (
                      <p className="text-sm text-muted-foreground">Loading…</p>
                    )}
                    {!detailLoading && detail && detail.id === opinion.id && detail.translations && detail.translations.length > 1 && (
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Translations:</span>
                        {detail.translations.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => toggleExpand(t.id)}
                            className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-colors ${
                              t.id === detail.id
                                ? "bg-[#0A2540] text-white"
                                : "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary"
                            }`}
                          >
                            {t.language}
                          </button>
                        ))}
                      </div>
                    )}
                    {!detailLoading && detail && detail.id === opinion.id && detail.content && (
                      <article
                        className="src-article src-article--inset"
                        style={{ "--src-figure-label": FIGURE_LABELS[detail.language] || "Figure " } as React.CSSProperties}
                      >
                        <div className="src-article-body">
                          <MarkdownRenderer content={detail.content} />
                        </div>
                      </article>
                    )}
                    {!detailLoading && detail && detail.id === opinion.id && !detail.content && (
                      <p className="text-sm text-muted-foreground">
                        {opinion.summary || "Full content is not yet available for this opinion."}
                      </p>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
