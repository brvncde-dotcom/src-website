"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Play, ChevronDown, ChevronUp, Flag, RefreshCw, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Score {
  composite: number;
  flags: string[];
  recommendedAction: string;
  recommendedTier: string | null;
  scoredBy: string;
  frameworkVersion: number;
  value: number;
  trustworthiness: number;
  sourceBias: number;
  worldviewAlignment: number;
  corruptionIndex: number;
  actionability: number;
  rationale: Record<string, string>;
  contrarianFlag: boolean;
  editorialOverride: Record<string, unknown> | null;
}
interface Row {
  id: string;
  title: string;
  type: string;
  section: string;
  status: string;
  score: Score | null;
}

const DIMS: { key: keyof Score; label: string }[] = [
  { key: "value", label: "Value" },
  { key: "trustworthiness", label: "Trust" },
  { key: "sourceBias", label: "Source Bias" },
  { key: "worldviewAlignment", label: "Alignment" },
  { key: "corruptionIndex", label: "Corruption" },
  { key: "actionability", label: "Actionability" },
];

const FLAG_STYLE: Record<string, string> = {
  WORLDVIEW_CLASH: "bg-amber-100 text-amber-800 border-amber-300",
  CORRUPTION_ALERT: "bg-red-100 text-red-800 border-red-300",
  CONTRARIAN_GOLD: "bg-yellow-100 text-yellow-800 border-yellow-400",
  SOURCE_RISK: "bg-red-50 text-red-700 border-red-200",
  BREAKING: "bg-blue-100 text-blue-800 border-blue-300",
};

function bandColor(composite: number): string {
  if (composite >= 8) return "text-green-700";
  if (composite >= 6.5) return "text-green-600";
  if (composite >= 5) return "text-amber-600";
  if (composite >= 3.5) return "text-orange-600";
  return "text-red-600";
}

export function ScoresReview() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "only" | "unscored" | "flagged">("all");
  const [scoringId, setScoringId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter === "only") params.set("scored", "only");
    if (filter === "unscored") params.set("scored", "unscored");
    if (filter === "flagged") params.set("flagged", "1");
    try {
      const r = await fetch(`/api/admin/cqr/reports?${params}`);
      if (r.ok) setRows((await r.json()).reports ?? []);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const scoreOne = async (id: string) => {
    setScoringId(id);
    try {
      const r = await fetch(`/api/admin/reports/${id}/cqr-score`, { method: "POST" });
      if (r.ok) { setExpanded(id); await load(); }
      else {
        const e = await r.json().catch(() => ({}));
        alert(`Scoring failed: ${e.error ?? r.status}${e.detail ? ` — ${e.detail}` : ""}`);
      }
    } finally {
      setScoringId(null);
    }
  };

  // Text search over the loaded rows — title, type, status, flags, action.
  const q = query.trim().toLowerCase();
  const visibleRows = q
    ? rows.filter((r) =>
        [r.title, r.type, r.status, r.score?.recommendedAction ?? "", ...(r.score?.flags ?? [])]
          .some((f) => f.toLowerCase().includes(q))
      )
    : rows;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {(["all", "only", "unscored", "flagged"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-sm border transition-colors ${
              filter === f ? "bg-[#0A2540] text-white border-[#0A2540]" : "border-[#D8DEE6] text-[#5A6B7F] hover:bg-[#F5F7FA]"
            }`}
          >
            {f === "all" ? "All" : f === "only" ? "Scored" : f === "unscored" ? "Unscored" : "Flagged"}
          </button>
        ))}
        <div className="relative flex-1 min-w-[180px] max-w-xs ml-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#5A6B7F]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, type, flag…"
            className="w-full border border-[#D8DEE6] rounded-md pl-8 pr-7 py-1.5 text-xs focus:outline-none focus:border-[#0A2540]"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#5A6B7F] hover:text-[#0A2540]" aria-label="Clear search">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-[#5A6B7F]" /></div>
      ) : visibleRows.length === 0 ? (
        <div className="text-center py-12 text-sm text-[#5A6B7F]">
          {q ? <>No reports match &ldquo;{query.trim()}&rdquo;.</> : "No reports match this filter."}
        </div>
      ) : (
        <div className="border border-[#D8DEE6] rounded-lg divide-y divide-[#D8DEE6]/60 bg-white">
          {visibleRows.map((r) => {
            const open = expanded === r.id;
            return (
              <div key={r.id}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <button className="flex-1 min-w-0 text-left" onClick={() => setExpanded(open ? null : r.id)}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#0A2540] truncate">{r.title}</span>
                      <Badge variant="outline" className="text-[10px] shrink-0">{r.type}</Badge>
                      <Badge variant="outline" className="text-[10px] shrink-0 capitalize">{r.status}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {r.score ? (
                        <>
                          <span className={`text-sm font-bold ${bandColor(r.score.composite)}`}>{r.score.composite.toFixed(2)}</span>
                          <span className="text-[11px] text-[#5A6B7F]">{r.score.recommendedAction}</span>
                          {r.score.flags.map((f) => (
                            <span key={f} className={`text-[9px] font-bold border rounded px-1 py-0.5 ${FLAG_STYLE[f] ?? "bg-gray-100 text-gray-700 border-gray-300"}`}>{f}</span>
                          ))}
                        </>
                      ) : (
                        <span className="text-[11px] text-[#5A6B7F] italic">not scored</span>
                      )}
                    </div>
                  </button>
                  <Button size="sm" variant={r.score ? "outline" : "default"} disabled={scoringId === r.id} onClick={() => scoreOne(r.id)}>
                    {scoringId === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                    <span className="ml-1">{r.score ? "Re-score" : "Score"}</span>
                  </Button>
                  <button onClick={() => setExpanded(open ? null : r.id)} className="text-[#5A6B7F]">
                    {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>

                {open && r.score && (
                  <div className="px-4 pb-4 bg-[#FAFBFC]">
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mb-3">
                      {DIMS.map((d) => (
                        <div key={d.key} className="border border-[#D8DEE6] rounded p-2 bg-white text-center">
                          <div className="text-lg font-bold text-[#0A2540]">{r.score![d.key] as number}</div>
                          <div className="text-[10px] text-[#5A6B7F]">{d.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="text-[11px] text-[#5A6B7F] mb-3 flex items-center gap-3 flex-wrap">
                      <span>Scored by <strong>{r.score.scoredBy}</strong> · framework v{r.score.frameworkVersion}</span>
                      {r.score.recommendedTier && <span>Suggested tier: <strong>{r.score.recommendedTier}</strong></span>}
                      {r.score.contrarianFlag && <span className="flex items-center gap-1"><Flag className="h-3 w-3" /> contrarian</span>}
                    </div>
                    <div className="space-y-1.5">
                      {DIMS.map((d) => r.score!.rationale?.[d.key] ? (
                        <div key={d.key} className="text-xs">
                          <span className="font-semibold text-[#0A2540]">{d.label}:</span>{" "}
                          <span className="text-[#5A6B7F]">{r.score!.rationale[d.key as string]}</span>
                        </div>
                      ) : null)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
