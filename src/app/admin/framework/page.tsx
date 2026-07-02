"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Plus, Trash2, Save, ScrollText, SlidersHorizontal, Check, Gauge, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoresReview } from "./ScoresReview";

// ── Types ──
interface Entry {
  id: string;
  domainId: string;
  topic: string;
  position: string;
  confidence: string;
  rationale: string;
  isActive: boolean;
}
interface Domain {
  id: string;
  code: string;
  name: string;
  entries: Entry[];
}
type WeightRow = Record<string, number>;
interface Config {
  version: number;
  weights: Record<string, WeightRow>;
  thresholds: Record<string, number>;
  flagRules: Record<string, unknown>;
}

const CONFIDENCE = ["Absolute", "High", "Medium", "Evolving"];
const DIMS = ["value", "trustworthiness", "sourceBias", "worldviewAlignment", "corruptionIndex", "actionability"];
const DIM_LABEL: Record<string, string> = {
  value: "Value",
  trustworthiness: "Trust",
  sourceBias: "Bias",
  worldviewAlignment: "Alignment",
  corruptionIndex: "Corruption",
  actionability: "Action",
};

export default function AdminFrameworkPage() {
  const { data: session, status } = useSession();
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;

  const [tab, setTab] = useState<"matrix" | "tuning" | "scores">("matrix");
  const [domains, setDomains] = useState<Domain[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/framework");
      if (!r.ok) return;
      const d = await r.json();
      setDomains(d.domains ?? []);
      setConfig(d.config ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && isAdmin) load();
  }, [status, isAdmin, load]);

  if (status === "loading" || loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-[#5A6B7F]" /></div>;
  }
  if (!isAdmin) {
    return <div className="max-w-7xl mx-auto px-4 py-10"><p className="text-sm text-[#E8272C]">Administrator access required.</p></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0A2540]">CQR Framework</h1>
        <p className="text-sm text-[#5A6B7F] mt-1">
          The Worldview Matrix and scoring config. Content version: <strong>v{config?.version ?? 0}</strong>.
        </p>
      </div>

      <div className="flex gap-1 mb-6 border-b border-[#D8DEE6]">
        <TabBtn active={tab === "matrix"} onClick={() => setTab("matrix")} icon={<ScrollText className="h-4 w-4" />}>Worldview Matrix</TabBtn>
        <TabBtn active={tab === "tuning"} onClick={() => setTab("tuning")} icon={<SlidersHorizontal className="h-4 w-4" />}>Tuning</TabBtn>
        <TabBtn active={tab === "scores"} onClick={() => setTab("scores")} icon={<Gauge className="h-4 w-4" />}>Content Scores</TabBtn>
      </div>

      {tab === "matrix" && <MatrixEditor domains={domains} reload={load} savingId={savingId} setSavingId={setSavingId} />}
      {tab === "tuning" && <TuningEditor config={config} reload={load} />}
      {tab === "scores" && <ScoresReview />}
    </div>
  );
}

function TabBtn({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
        active ? "border-[#0A2540] text-[#0A2540]" : "border-transparent text-[#5A6B7F] hover:text-[#0A2540]"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

// ── Matrix editor ──
function MatrixEditor({ domains, reload, savingId, setSavingId }: {
  domains: Domain[]; reload: () => void; savingId: string | null; setSavingId: (s: string | null) => void;
}) {
  const [drafts, setDrafts] = useState<Record<string, Partial<Entry>>>({});
  const [adding, setAdding] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState({ topic: "", position: "", confidence: "Medium", rationale: "" });
  const [query, setQuery] = useState("");

  // Filter topics across every domain by topic / position / rationale /
  // confidence. Domains with no matching topics are hidden while filtering.
  const q = query.trim().toLowerCase();
  const visibleDomains = q
    ? domains
        .map((d) => ({
          ...d,
          entries: d.entries.filter((e) =>
            [e.topic, e.position, e.rationale, e.confidence].some((f) =>
              (f ?? "").toLowerCase().includes(q)
            )
          ),
        }))
        .filter((d) => d.entries.length > 0)
    : domains;
  const totalTopics = domains.reduce((s, d) => s + d.entries.length, 0);
  const matchingTopics = visibleDomains.reduce((s, d) => s + d.entries.length, 0);

  const setDraft = (id: string, patch: Partial<Entry>) =>
    setDrafts((d) => ({ ...d, [id]: { ...d[id], ...patch } }));

  const saveEntry = async (e: Entry) => {
    setSavingId(e.id);
    const patch = drafts[e.id] ?? {};
    await fetch(`/api/admin/framework/entries/${e.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setSavingId(null);
    setDrafts((d) => { const n = { ...d }; delete n[e.id]; return n; });
    reload();
  };

  const deleteEntry = async (id: string) => {
    if (!confirm("Delete this Matrix entry?")) return;
    await fetch(`/api/admin/framework/entries/${id}`, { method: "DELETE" });
    reload();
  };

  const createEntry = async (domainId: string) => {
    if (!newEntry.topic || !newEntry.position || !newEntry.rationale) return;
    await fetch("/api/admin/framework/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domainId, ...newEntry }),
    });
    setAdding(null);
    setNewEntry({ topic: "", position: "", confidence: "Medium", rationale: "" });
    reload();
  };

  return (
    <div className="space-y-8">
      {/* Topic search — filters across every domain */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A6B7F]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics, positions, rationale…"
            className="w-full border border-[#D8DEE6] rounded-md pl-9 pr-8 py-2 text-sm focus:outline-none focus:border-[#0A2540]"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5A6B7F] hover:text-[#0A2540]"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <span className="text-xs text-[#5A6B7F]">
          {q ? `${matchingTopics} of ${totalTopics} topics match` : `${totalTopics} topics`}
        </span>
      </div>

      {q && visibleDomains.length === 0 && (
        <div className="border border-dashed border-[#D8DEE6] rounded-lg p-8 text-center text-sm text-[#5A6B7F]">
          No topics match &ldquo;{query.trim()}&rdquo;.
          <button onClick={() => setQuery("")} className="ml-2 text-[#E8272C] font-medium hover:underline">
            Clear
          </button>
        </div>
      )}

      {visibleDomains.map((d) => (
        <div key={d.id}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-[#0A2540] flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">{d.code}</Badge> {d.name}
              <span className="text-xs text-[#5A6B7F] font-normal">({d.entries.length})</span>
            </h2>
            <Button size="sm" variant="outline" onClick={() => setAdding(adding === d.id ? null : d.id)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add topic
            </Button>
          </div>

          {adding === d.id && (
            <div className="mb-3 p-3 border border-[#0A2540]/30 rounded-lg bg-[#F5F7FA] space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input className="border border-[#D8DEE6] rounded px-2 py-1.5 text-sm" placeholder="Topic" value={newEntry.topic} onChange={(e) => setNewEntry({ ...newEntry, topic: e.target.value })} />
                <input className="border border-[#D8DEE6] rounded px-2 py-1.5 text-sm" placeholder="Position (e.g. Skeptical, 8/10)" value={newEntry.position} onChange={(e) => setNewEntry({ ...newEntry, position: e.target.value })} />
                <select className="border border-[#D8DEE6] rounded px-2 py-1.5 text-sm" value={newEntry.confidence} onChange={(e) => setNewEntry({ ...newEntry, confidence: e.target.value })}>
                  {CONFIDENCE.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <textarea className="w-full border border-[#D8DEE6] rounded px-2 py-1.5 text-sm" rows={2} placeholder="Rationale" value={newEntry.rationale} onChange={(e) => setNewEntry({ ...newEntry, rationale: e.target.value })} />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => createEntry(d.id)}>Create</Button>
                <Button size="sm" variant="ghost" onClick={() => setAdding(null)}>Cancel</Button>
              </div>
            </div>
          )}

          <div className="border border-[#D8DEE6] rounded-lg divide-y divide-[#D8DEE6]/60 bg-white">
            {d.entries.map((e) => {
              const dr = drafts[e.id] ?? {};
              const dirty = Object.keys(dr).length > 0;
              return (
                <div key={e.id} className={`p-3 ${e.isActive ? "" : "opacity-50"}`}>
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-start">
                    <input className="border border-[#D8DEE6] rounded px-2 py-1.5 text-sm font-medium" value={dr.topic ?? e.topic} onChange={(ev) => setDraft(e.id, { topic: ev.target.value })} />
                    <input className="border border-[#D8DEE6] rounded px-2 py-1.5 text-sm" value={dr.position ?? e.position} onChange={(ev) => setDraft(e.id, { position: ev.target.value })} />
                    <div className="flex items-center gap-1">
                      <select className="border border-[#D8DEE6] rounded px-2 py-1.5 text-sm" value={dr.confidence ?? e.confidence} onChange={(ev) => setDraft(e.id, { confidence: ev.target.value })}>
                        {CONFIDENCE.map((c) => <option key={c}>{c}</option>)}
                      </select>
                      <Button size="sm" variant={dirty ? "default" : "outline"} disabled={!dirty || savingId === e.id} onClick={() => saveEntry(e)} title="Save">
                        {savingId === e.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      </Button>
                      <Button size="sm" variant="ghost" className="text-[#E8272C]" onClick={() => deleteEntry(e.id)} title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <textarea className="w-full mt-2 border border-[#D8DEE6] rounded px-2 py-1.5 text-xs text-[#5A6B7F]" rows={2} value={dr.rationale ?? e.rationale} onChange={(ev) => setDraft(e.id, { rationale: ev.target.value })} />
                </div>
              );
            })}
            {d.entries.length === 0 && <div className="p-4 text-sm text-[#5A6B7F]">No topics yet.</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Tuning editor ──
function TuningEditor({ config, reload }: { config: Config | null; reload: () => void }) {
  const [weights, setWeights] = useState<Record<string, WeightRow>>(config?.weights ?? {});
  const [thresholds, setThresholds] = useState<Record<string, number>>(config?.thresholds ?? {});
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const docTypes = Object.keys(weights);

  const setW = (dt: string, dim: string, v: number) =>
    setWeights((w) => ({ ...w, [dt]: { ...w[dt], [dim]: v } }));

  const publish = async () => {
    setSaving(true);
    setSaved(false);
    const r = await fetch("/api/admin/framework/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weights, thresholds, flagRules: config?.flagRules ?? {}, note }),
    });
    setSaving(false);
    if (r.ok) { setSaved(true); setNote(""); setTimeout(() => setSaved(false), 3000); reload(); }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-sm font-bold text-[#0A2540] mb-2">Dimension weights by document type</h2>
        <p className="text-xs text-[#5A6B7F] mb-3">Each column should sum to 1.00. Corruption is inverted at scoring time.</p>
        <div className="overflow-x-auto border border-[#D8DEE6] rounded-lg bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F5F7FA] text-[#5A6B7F]">
                <th className="text-left px-3 py-2 font-semibold">Dimension</th>
                {docTypes.map((dt) => <th key={dt} className="px-3 py-2 font-semibold text-center">{dt}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8DEE6]/60">
              {DIMS.map((dim) => (
                <tr key={dim}>
                  <td className="px-3 py-2 font-medium text-[#0A2540]">{DIM_LABEL[dim]}</td>
                  {docTypes.map((dt) => (
                    <td key={dt} className="px-2 py-1.5 text-center">
                      <input type="number" step="0.05" min="0" max="1" className="w-16 border border-[#D8DEE6] rounded px-1.5 py-1 text-center text-xs" value={weights[dt]?.[dim] ?? 0} onChange={(e) => setW(dt, dim, parseFloat(e.target.value) || 0)} />
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-[#F5F7FA] font-semibold">
                <td className="px-3 py-2 text-[#5A6B7F]">Sum</td>
                {docTypes.map((dt) => {
                  const sum = DIMS.reduce((s, d) => s + (weights[dt]?.[d] ?? 0), 0);
                  return <td key={dt} className={`px-3 py-2 text-center ${Math.abs(sum - 1) > 0.001 ? "text-[#E8272C]" : "text-green-700"}`}>{sum.toFixed(2)}</td>;
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold text-[#0A2540] mb-2">Decision thresholds (composite score)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {["publishNow", "reviewPublish", "conditional", "referenceOnly"].map((k) => (
            <div key={k}>
              <label className="text-xs text-[#5A6B7F]">{k}</label>
              <input type="number" step="0.1" className="w-full border border-[#D8DEE6] rounded px-2 py-1.5 text-sm" value={thresholds[k] ?? 0} onChange={(e) => setThresholds((t) => ({ ...t, [k]: parseFloat(e.target.value) || 0 }))} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2 border-t border-[#D8DEE6]">
        <input className="flex-1 border border-[#D8DEE6] rounded px-2 py-1.5 text-sm" placeholder="Version note (what changed)" value={note} onChange={(e) => setNote(e.target.value)} />
        <Button onClick={publish} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : saved ? <Check className="h-4 w-4 mr-1.5" /> : null}
          {saved ? "Published" : `Publish v${(config?.version ?? 0) + 1}`}
        </Button>
      </div>
    </div>
  );
}
