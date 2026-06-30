"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Search, Loader2, Lock, CornerDownLeft, X, FileText } from "lucide-react";
import { useLang } from "@/components/LangProvider";
import { LANG_LABELS, type Lang } from "@/lib/i18n";
import { highlightToHtml, type SearchHit, type SearchResponse } from "@/lib/search";

// ----- Context so the header button and the global ⌘K both open the palette --

interface SearchContextValue {
  open: () => void;
}

const SearchContext = createContext<SearchContextValue>({ open: () => {} });

export function useSearch() {
  return useContext(SearchContext);
}

const SECTION_KEY_MAP: Record<string, string> = {
  "digital-power-ai": "focus.digital",
  "geopolitics-hard-security": "focus.geopolitics",
  "energy-resources": "focus.energy",
  "climate-environment-food": "focus.climate",
  "economy-competitiveness": "focus.economy",
  "society-migration-institutions": "focus.society",
};

const LANGS: Lang[] = ["en", "de", "fr", "it"];
const RECENT_KEY = "src_recent_searches";
const MAX_RECENT = 5;

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  // Global hotkeys: ⌘K / Ctrl+K anywhere; "/" when not typing in a field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((v) => !v);
      } else if (e.key === "/" && !typing && !isOpen) {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const value = useMemo(() => ({ open }), [open]);

  return (
    <SearchContext.Provider value={value}>
      {children}
      {isOpen && <SearchPalette onClose={close} />}
    </SearchContext.Provider>
  );
}

// ----- The palette overlay -------------------------------------------------

function SearchPalette({ onClose }: { onClose: () => void }) {
  const { t, lang } = useLang();
  const [query, setQuery] = useState("");
  // Default to the current UI language; "all" widens to every language.
  const [langFilter, setLangFilter] = useState<Lang | "all">(lang);
  const [results, setResults] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Lock body scroll while open; restore on close.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw).slice(0, MAX_RECENT));
    } catch {
      /* ignore */
    }
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Debounced, abortable fetch on query / language change.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      abortRef.current?.abort();
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const params = new URLSearchParams({ q });
        if (langFilter !== "all") params.set("lang", langFilter);
        const res = await fetch(`/api/search?${params.toString()}`, {
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error("search failed");
        const data: SearchResponse = await res.json();
        setResults(data.results || []);
        setActiveIndex(0);
        setSearched(true);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setResults([]);
          setSearched(true);
        }
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(handle);
  }, [query, langFilter]);

  const saveRecent = useCallback((q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < 2) return;
    setRecent((prev) => {
      const next = [trimmed, ...prev.filter((x) => x !== trimmed)].slice(0, MAX_RECENT);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const goToReport = useCallback(
    (hit: SearchHit) => {
      saveRecent(query);
      window.location.href = `/reports/${hit.id}`;
    },
    [query, saveRecent],
  );

  // Keyboard navigation within the palette.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = results[activeIndex];
      if (hit) goToReport(hit);
    }
  };

  // Keep the active row scrolled into view.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const sectionLabel = (slug: string) => {
    const key = SECTION_KEY_MAP[slug];
    return key ? t(key) : slug;
  };

  const fmtDate = (iso: string | null) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString(lang, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh] pb-4"
      role="dialog"
      aria-modal="true"
      aria-label={t("search.title")}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0A2540]/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-2xl bg-white rounded-md shadow-2xl border border-border overflow-hidden flex flex-col max-h-[76vh]"
        onKeyDown={onKeyDown}
      >
        {/* Swiss red accent */}
        <div className="h-[3px] bg-[#E8272C]" />

        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search.placeholder")}
            className="flex-1 bg-transparent outline-none text-sm text-[#0A2540] placeholder:text-muted-foreground"
            autoComplete="off"
            spellCheck={false}
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-[#0A2540] transition-colors"
            aria-label={t("search.close")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Language facets */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border bg-secondary/30">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground mr-1">
            {t("search.language")}
          </span>
          <FacetChip
            active={langFilter === "all"}
            onClick={() => setLangFilter("all")}
            label={t("search.all")}
          />
          {LANGS.map((l) => (
            <FacetChip
              key={l}
              active={langFilter === l}
              onClick={() => setLangFilter(l)}
              label={LANG_LABELS[l]}
            />
          ))}
        </div>

        {/* Results / states */}
        <div ref={listRef} className="overflow-y-auto flex-1">
          {query.trim().length < 2 ? (
            <RecentBlock
              recent={recent}
              onPick={(q) => setQuery(q)}
              t={t}
            />
          ) : searched && results.length === 0 && !loading ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              {t("search.no-results").replace("{q}", query.trim())}
            </div>
          ) : (
            <ul className="py-1">
              {results.map((hit, idx) => (
                <li key={hit.id}>
                  <button
                    data-idx={idx}
                    onClick={() => goToReport(hit)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`w-full text-left px-4 py-3 flex flex-col gap-1 transition-colors ${
                      idx === activeIndex ? "bg-secondary" : "hover:bg-secondary/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                      <span className="font-semibold text-[#0A2540]">
                        {sectionLabel(hit.section)}
                      </span>
                      <span>·</span>
                      <span>{hit.type}</span>
                      <span className="ml-auto flex items-center gap-2 normal-case tracking-normal">
                        {hit.gated && (
                          <span className="inline-flex items-center gap-1 text-[#E8272C] font-semibold">
                            <Lock className="h-3 w-3" />
                            {hit.requiredTier || t("search.members")}
                          </span>
                        )}
                        <span className="px-1 py-0.5 bg-secondary rounded-sm font-bold text-[9px]">
                          {LANG_LABELS[hit.language as Lang] || hit.language.toUpperCase()}
                        </span>
                        <span>{fmtDate(hit.publishedAt)}</span>
                      </span>
                    </div>
                    <div
                      className="text-sm font-semibold text-[#0A2540] [&_mark]:bg-yellow-200 [&_mark]:text-[#0A2540] [&_mark]:rounded-sm"
                      dangerouslySetInnerHTML={{ __html: highlightToHtml(hit.title) }}
                    />
                    {(hit.snippet?.trim() || hit.summary) && (
                      <div
                        className="text-xs text-muted-foreground line-clamp-2 [&_mark]:bg-yellow-200 [&_mark]:text-[#0A2540] [&_mark]:rounded-sm"
                        dangerouslySetInnerHTML={{
                          __html: hit.snippet?.trim()
                            ? highlightToHtml(hit.snippet)
                            : highlightToHtml(hit.summary),
                        }}
                      />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-border bg-secondary/30 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            {t("search.navigate")}
          </span>
          <span className="flex items-center gap-1">
            <Kbd>
              <CornerDownLeft className="h-2.5 w-2.5" />
            </Kbd>
            {t("search.open")}
          </span>
          <span className="flex items-center gap-1">
            <Kbd>esc</Kbd>
            {t("search.close")}
          </span>
          {searched && (
            <span className="ml-auto flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {results.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function RecentBlock({
  recent,
  onPick,
  t,
}: {
  recent: string[];
  onPick: (q: string) => void;
  t: (k: string) => string;
}) {
  if (recent.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-sm text-muted-foreground">
        {t("search.hint")}
      </div>
    );
  }
  return (
    <div className="py-2">
      <div className="px-4 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {t("search.recent")}
      </div>
      {recent.map((q) => (
        <button
          key={q}
          onClick={() => onPick(q)}
          className="w-full text-left px-4 py-2 text-sm text-[#0A2540] hover:bg-secondary/50 flex items-center gap-2"
        >
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          {q}
        </button>
      ))}
    </div>
  );
}

function FacetChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-0.5 text-[10px] font-bold tracking-wide rounded-sm transition-colors ${
        active
          ? "bg-[#0A2540] text-white"
          : "text-muted-foreground hover:text-[#0A2540] hover:bg-secondary"
      }`}
    >
      {label}
    </button>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 bg-white border border-border rounded-[3px] text-[9px] font-mono text-muted-foreground">
      {children}
    </kbd>
  );
}
