"use client";

import { useState, useEffect } from "react";
import { Play, ExternalLink } from "lucide-react";
import { useLang } from "./LangProvider";
import { useNavigation } from "./NavigationProvider";
import MarkdownRenderer from "./MarkdownRenderer";
import { SUB_BRANDS, subBrandDef, type EditorialFact } from "@/lib/editorial";

interface Item {
  id: string;
  title: string;
  summary: string | null;
  type: string;
  section: string;
  author: string | null;
  code: string | null;
  publishedAt: string | null;
  createdAt: string;
  editorialMeta?: {
    subBrand: string;
    thesis: string | null;
    videoUrl: string | null;
    videoDuration: number | null;
  } | null;
}

interface CqrScore {
  value: number;
  trustworthiness: number;
  sourceBias: number;
  worldviewAlignment: number;
  corruptionIndex: number;
  actionability: number;
  composite: number;
  flags: string[];
}

interface EditorialMetaFull {
  subBrand: string;
  thesis: string | null;
  facts: EditorialFact[] | null;
  analysis: string | null;
  roomForDisagreement: string | null;
  theAsk: string | null;
  authorTitle: string | null;
  authorCreds: string | null;
  authorLinkedin: string | null;
  authorTwitter: string | null;
  methodology: string | null;
  sourcesCount: number | null;
  conflicts: string | null;
  videoUrl: string | null;
  videoDuration: number | null;
  audioUrl: string | null;
}

interface Detail extends Item {
  content: string | null;
  language: string;
  access: "full" | "preview" | "denied";
  requiredTier: string | null;
  editorialMeta: EditorialMetaFull | null;
  cqrScore: CqrScore | null;
  translations: { id: string; language: string; title: string }[];
}

const FIGURE_LABELS: Record<string, string> = { en: "Figure ", de: "Abbildung ", fr: "Figure ", it: "Figura " };

export function SrcPositionView() {
  const { lang, t: tr } = useLang();
  const { navigate } = useNavigation();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch published editorial content (new "Editorial" + legacy "Opinion").
  useEffect(() => {
    let cancelled = false;
    const fetchItems = async (language: string) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/reports?type=Editorial,Opinion&lang=${language}&limit=100`);
        const data = await res.json();
        if (cancelled) return;
        const reports: Item[] = data.reports || [];
        if (reports.length > 0 || language === "en") {
          setItems(reports);
        } else {
          const enRes = await fetch(`/api/reports?type=Editorial,Opinion&lang=en&limit=100`);
          const enData = await enRes.json();
          if (!cancelled) setItems(enData.reports || []);
        }
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchItems(lang);
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
      const res = await fetch(`/api/reports/${id}?lang=${lang}`);
      if (res.ok) setDetail(await res.json());
    } catch {
      // ignore
    } finally {
      setDetailLoading(false);
    }
  };

  const formatDate = (s: string | null) =>
    s ? new Date(s).toLocaleDateString(lang === "en" ? "en-US" : lang, { year: "numeric", month: "short", day: "numeric" }) : "";

  // Legacy Opinions: type=Opinion with no Semaform editorialMeta.
  const isLegacy = (i: Item) => i.type === "Opinion" && !i.editorialMeta;

  // Sub-brands present among proper Editorial items only (in canonical order).
  const presentBrands = SUB_BRANDS.filter((b) =>
    items.some((i) => !isLegacy(i) && (i.editorialMeta?.subBrand ?? "position-paper") === b.key),
  );
  const hasLegacyOpinions = items.some(isLegacy);

  const visible =
    filter === "all"
      ? items
      : filter === "__opinion"
      ? items.filter(isLegacy)
      : items.filter((i) => !isLegacy(i) && (i.editorialMeta?.subBrand ?? "position-paper") === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Header */}
      <div className="max-w-2xl mb-8">
        <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#E8272C] mb-2 block">
          {tr("position.tag")}
        </span>
        <h1 className="heading-serif text-2xl sm:text-3xl font-bold text-primary mb-3">
          {tr("position.heading")}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">{tr("position.desc")}</p>
      </div>

      {/* Sub-brand filter */}
      {presentBrands.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8 border-b border-border pb-5">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label={tr("position.filter.all")} />
          {presentBrands.map((b) => (
            <FilterChip key={b.key} active={filter === b.key} onClick={() => setFilter(b.key)} label={b.label} />
          ))}
          {hasLegacyOpinions && (
            <FilterChip active={filter === "__opinion"} onClick={() => setFilter("__opinion")} label="Opinion" />
          )}
        </div>
      )}

      {loading && (
        <div className="max-w-3xl py-12 text-center text-sm text-muted-foreground">{tr("position.loading")}</div>
      )}

      {!loading && visible.length === 0 && (
        <div className="max-w-3xl py-16 text-center">
          <p className="text-sm text-muted-foreground">{tr("position.empty")}</p>
          <p className="text-xs text-muted-foreground/70 mt-2">{tr("position.empty.hint")}</p>
        </div>
      )}

      {!loading && visible.length > 0 && (
        <div className="space-y-4">
          {visible.map((item) => {
            const legacy = isLegacy(item);
            const brand = legacy ? null : subBrandDef(item.editorialMeta?.subBrand);
            const thesis = item.editorialMeta?.thesis;
            const hasVideo = !!item.editorialMeta?.videoUrl;
            const isExpanded = expandedId === item.id;
            return (
              <article key={item.id} className="border border-border hover:border-primary/30 hover:shadow-sm transition-all">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {brand ? (
                      <span className="text-[10px] font-bold tracking-[0.08em] uppercase bg-[#0A2540] text-white px-2 py-0.5 rounded-sm">
                        {brand.label}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold tracking-[0.08em] uppercase bg-secondary text-muted-foreground px-2 py-0.5 rounded-sm">
                        Opinion
                      </span>
                    )}
                    {hasVideo && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[#E8272C]">
                        <Play className="h-2.5 w-2.5 fill-current" /> Video
                      </span>
                    )}
                    {item.author && <span className="text-[10px] text-muted-foreground">{item.author}</span>}
                    {item.publishedAt && <span className="text-[10px] text-muted-foreground">{formatDate(item.publishedAt)}</span>}
                    {item.code && (
                      <span className="text-[10px] font-mono font-bold text-[#0A2540] bg-[#F0F2F5] px-2 py-0.5 rounded-sm">{item.code}</span>
                    )}
                  </div>
                  <h3 className="heading-serif font-bold text-lg text-primary leading-snug mb-2">{item.title}</h3>
                  {thesis && <p className="text-sm text-primary/80 italic leading-relaxed mb-2">{thesis}</p>}
                  {item.summary && <p className="text-sm text-muted-foreground leading-relaxed mb-3">{item.summary}</p>}
                  <button onClick={() => toggleExpand(item.id)} className="text-xs font-medium text-[#E8272C] hover:underline">
                    {isExpanded ? tr("position.collapse") : tr("position.read")}
                  </button>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-6 sm:px-6 border-t border-border pt-6">
                    {detailLoading && <p className="text-sm text-muted-foreground">{tr("position.loading")}</p>}
                    {!detailLoading && detail && detail.id === item.id && (
                      <EditorialReader detail={detail} tr={tr} onNavigate={() => navigate("membership")} onOpenTranslation={toggleExpand} />
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

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide rounded-sm transition-colors ${
        active ? "bg-[#0A2540] text-white" : "bg-secondary text-muted-foreground hover:text-primary hover:bg-primary/10"
      }`}
    >
      {label}
    </button>
  );
}

function EditorialReader({
  detail, tr, onNavigate, onOpenTranslation,
}: {
  detail: Detail;
  tr: (k: string) => string;
  onNavigate: () => void;
  onOpenTranslation: (id: string) => void;
}) {
  const meta = detail.editorialMeta;
  const gated = detail.access !== "full";

  // Tier gate: entice with summary, point to membership.
  if (gated) {
    return (
      <div className="max-w-2xl">
        {detail.summary && <p className="text-sm text-muted-foreground leading-relaxed mb-5">{detail.summary}</p>}
        <div className="border border-[#E8272C]/30 bg-[#E8272C]/5 rounded-sm p-5 text-center">
          <p className="text-sm font-medium text-primary mb-3">
            {tr("position.gated").replace("{tier}", detail.requiredTier || "member")}
          </p>
          <button onClick={onNavigate} className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0A2540] text-white text-xs font-bold uppercase tracking-wide rounded-sm hover:bg-[#0A2540]/90 transition-colors">
            {tr("position.gated.cta")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8">
      {/* Translations switcher */}
      {detail.translations && detail.translations.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Translations:</span>
          {detail.translations.map((t) => (
            <button key={t.id} onClick={() => onOpenTranslation(t.id)}
              className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-colors ${
                t.id === detail.id ? "bg-[#0A2540] text-white" : "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}>{t.language}</button>
          ))}
        </div>
      )}

      {/* Author card */}
      {(meta?.authorTitle || meta?.authorCreds || detail.author) && (
        <div className="flex items-start gap-3 border-l-2 border-[#E8272C] pl-4">
          <div>
            {detail.author && <div className="text-sm font-bold text-primary">{detail.author}</div>}
            {meta?.authorTitle && <div className="text-xs text-muted-foreground">{meta.authorTitle}</div>}
            {meta?.authorCreds && <div className="text-xs text-muted-foreground/80 mt-0.5">{meta.authorCreds}</div>}
            {(meta?.authorLinkedin || meta?.authorTwitter) && (
              <div className="flex gap-3 mt-1.5">
                {meta.authorLinkedin && <a href={meta.authorLinkedin} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#E8272C] hover:underline inline-flex items-center gap-0.5">LinkedIn <ExternalLink className="h-2.5 w-2.5" /></a>}
                {meta.authorTwitter && <a href={meta.authorTwitter} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#E8272C] hover:underline inline-flex items-center gap-0.5">X <ExternalLink className="h-2.5 w-2.5" /></a>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CQR scorecard */}
      {detail.cqrScore && <Scorecard score={detail.cqrScore} tr={tr} />}

      {/* Semaform body — falls back to plain markdown content for legacy opinions */}
      {meta && (meta.facts || meta.analysis || meta.roomForDisagreement || meta.theAsk) ? (
        <div className="space-y-8">
          {meta.facts && meta.facts.length > 0 && (
            <Section n="I" title={tr("position.facts")} sub={tr("position.facts.sub")}>
              <ul className="space-y-2.5">
                {meta.facts.map((f, i) => (
                  <li key={i} className="text-sm text-primary/90 leading-relaxed flex gap-2">
                    <span className="text-[#E8272C] font-bold flex-shrink-0">•</span>
                    <span>
                      {f.claim}
                      {f.source && <span className="text-xs text-muted-foreground"> — {f.source}</span>}
                      {typeof f.trust === "number" && (
                        <span className="ml-1.5 inline-block text-[10px] font-mono font-bold text-[#0A2540] bg-[#F0F2F5] px-1.5 rounded-sm align-middle">
                          {tr("position.dim.trust")} {f.trust}/10
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {meta.analysis && (
            <Section n="II" title={tr("position.analysis")} sub={tr("position.analysis.sub")}>
              <MarkdownBody content={meta.analysis} lang={detail.language} />
            </Section>
          )}
          {meta.roomForDisagreement && (
            <Section n="III" title={tr("position.disagreement")} sub={tr("position.disagreement.sub")} accent>
              <MarkdownBody content={meta.roomForDisagreement} lang={detail.language} />
            </Section>
          )}
          {meta.theAsk && (
            <Section n="IV" title={tr("position.ask")} sub={tr("position.ask.sub")}>
              <MarkdownBody content={meta.theAsk} lang={detail.language} />
            </Section>
          )}
        </div>
      ) : detail.content ? (
        <MarkdownBody content={detail.content} lang={detail.language} />
      ) : (
        <p className="text-sm text-muted-foreground">{detail.summary}</p>
      )}

      {/* Footer transparency block */}
      {meta && (meta.methodology || meta.sourcesCount || meta.conflicts) && (
        <div className="border-t border-border pt-5 space-y-2">
          <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">{tr("position.about")}</div>
          {meta.methodology && (
            <div className="text-xs text-muted-foreground"><span className="font-semibold text-primary">{tr("position.methodology")}:</span> {meta.methodology}</div>
          )}
          {typeof meta.sourcesCount === "number" && (
            <div className="text-xs text-muted-foreground"><span className="font-semibold text-primary">{meta.sourcesCount}</span> {tr("position.sources")}</div>
          )}
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold text-primary">{tr("position.conflicts")}:</span> {meta.conflicts || tr("position.conflicts.none")}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ n, title, sub, accent, children }: { n: string; title: string; sub: string; accent?: boolean; children: React.ReactNode }) {
  return (
    <section>
      <div className={`flex items-baseline gap-3 mb-3 pb-2 border-b ${accent ? "border-[#E8272C]/40" : "border-border"}`}>
        <span className={`font-mono text-xs font-bold ${accent ? "text-[#E8272C]" : "text-muted-foreground/50"}`}>{n}</span>
        <h4 className="heading-serif text-base font-bold text-primary">{title}</h4>
        <span className="text-[11px] text-muted-foreground italic">{sub}</span>
      </div>
      {children}
    </section>
  );
}

function MarkdownBody({ content, lang }: { content: string; lang: string }) {
  return (
    <article className="src-article src-article--inset" style={{ "--src-figure-label": FIGURE_LABELS[lang] || "Figure " } as React.CSSProperties}>
      <div className="src-article-body"><MarkdownRenderer content={content} /></div>
    </article>
  );
}

// Six-dimension SRC-CQR scorecard. Corruption is shown raw (low = clean);
// the composite already inverts it server-side.
function Scorecard({ score, tr }: { score: CqrScore; tr: (k: string) => string }) {
  const dims: { label: string; value: number; invert?: boolean }[] = [
    { label: tr("position.dim.value"), value: score.value },
    { label: tr("position.dim.worldview"), value: score.worldviewAlignment },
    { label: tr("position.dim.trust"), value: score.trustworthiness },
    { label: tr("position.dim.action"), value: score.actionability },
    { label: tr("position.dim.bias"), value: score.sourceBias },
    { label: tr("position.dim.corruption"), value: score.corruptionIndex, invert: true },
  ];
  return (
    <div className="border border-border rounded-sm bg-secondary/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/70">{tr("position.scorecard")}</span>
        <span className="text-sm font-mono font-bold text-[#0A2540]">{score.composite.toFixed(1)}<span className="text-muted-foreground/60 text-xs">/10</span></span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
        {dims.map((d) => (
          <div key={d.label} className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground w-24 flex-shrink-0">{d.label}</span>
            <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${d.invert ? (d.value >= 7 ? "bg-[#E8272C]" : "bg-[#0A2540]") : "bg-[#0A2540]"}`} style={{ width: `${d.value * 10}%` }} />
            </div>
            <span className="text-[11px] font-mono font-bold text-primary w-8 text-right">{d.value}/10</span>
          </div>
        ))}
      </div>
      {score.flags && score.flags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border">
          {score.flags.map((f) => (
            <span key={f} className="text-[9px] font-bold uppercase tracking-wide text-[#E8272C] bg-[#E8272C]/10 px-1.5 py-0.5 rounded-sm">{f.replace(/_/g, " ")}</span>
          ))}
        </div>
      )}
    </div>
  );
}
