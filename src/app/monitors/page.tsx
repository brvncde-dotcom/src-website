"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Bell, Plus, Trash2, ChevronRight, PauseCircle, PlayCircle, X, Check } from "lucide-react";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";
import { SiteNavigation, type PageKey } from "@/components/SiteNavigation";
import { SiteFooter } from "@/components/SiteFooter";
import { NavigationProvider } from "@/components/NavigationProvider";

// ── Types ────────────────────────────────────────────────────────────────────

interface Monitor {
  id: string;
  name: string;
  keywords: string[];
  sections: string[];
  types: string[];
  languages: string[];
  isActive: boolean;
  totalMatches: number;
  unreadMatches: number;
  createdAt: string;
}

interface MatchReport {
  id: string;
  title: string;
  summary: string | null;
  type: string;
  section: string;
  language: string;
  publishedAt: string | null;
  code: string | null;
}

interface Match {
  id: string;
  monitorId: string;
  monitorName: string;
  reportId: string;
  matchedOn: string[];
  isRead: boolean;
  createdAt: string;
  report: MatchReport;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SECTIONS = [
  "geopolitics-hard-security",
  "digital-power-ai",
  "energy-resources",
  "climate-environment-food",
  "economy-competitiveness",
  "society-migration-institutions",
];

const SECTION_LABELS: Record<string, string> = {
  "geopolitics-hard-security": "Geopolitics & Hard Security",
  "digital-power-ai": "Digital Power & AI",
  "energy-resources": "Energy & Resources",
  "climate-environment-food": "Climate, Environment & Food",
  "economy-competitiveness": "Economy & Competitiveness",
  "society-migration-institutions": "Society, Migration & Institutions",
};

const REPORT_TYPES = ["Analysis", "Daily Brief", "Intelligence Brief", "Opinion", "Research"];
const LANGUAGES = ["en", "de", "fr", "it"];
const LANG_LABELS: Record<string, string> = { en: "EN", de: "DE", fr: "FR", it: "IT" };

// ── Monitor form ─────────────────────────────────────────────────────────────

function parseKeywords(raw: string): string[] {
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

interface MonitorFormProps {
  initial?: Partial<Monitor>;
  onSave: (data: Partial<Monitor>) => void;
  onCancel: () => void;
  saving: boolean;
  tr: (k: string) => string;
}

function MonitorForm({ initial, onSave, onCancel, saving, tr }: MonitorFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [keywords, setKeywords] = useState((initial?.keywords ?? []).join(", "));
  const [sections, setSections] = useState<string[]>(initial?.sections ?? []);
  const [types, setTypes] = useState<string[]>(initial?.types ?? []);
  const [languages, setLanguages] = useState<string[]>(initial?.languages ?? []);

  const toggle = (arr: string[], val: string, set: (v: string[]) => void) => {
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, keywords: parseKeywords(keywords), sections, types, languages });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-[#F4F6F9] dark:bg-slate-800 rounded-lg p-4">
      <div>
        <label className="block text-xs font-semibold text-[#0A2540] dark:text-white mb-1">
          {tr("monitors.name-label")}
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={tr("monitors.name-placeholder")}
          required
          className="w-full px-3 py-2 text-sm border border-[#D8DEE6] dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540] dark:bg-slate-700 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#0A2540] dark:text-white mb-1">
          {tr("monitors.keywords-label")}
        </label>
        <input
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder={tr("monitors.keywords-placeholder")}
          className="w-full px-3 py-2 text-sm border border-[#D8DEE6] dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540] dark:bg-slate-700 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#0A2540] dark:text-white mb-1.5">
          {tr("monitors.sections-label")}
        </label>
        <div className="flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggle(sections, s, setSections)}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                sections.includes(s)
                  ? "bg-[#0A2540] text-white border-[#0A2540]"
                  : "border-[#D8DEE6] text-[#6B7280] hover:border-[#0A2540] hover:text-[#0A2540]"
              }`}
            >
              {SECTION_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#0A2540] dark:text-white mb-1.5">
          {tr("monitors.types-label")}
        </label>
        <div className="flex flex-wrap gap-2">
          {REPORT_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggle(types, t, setTypes)}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                types.includes(t)
                  ? "bg-[#0A2540] text-white border-[#0A2540]"
                  : "border-[#D8DEE6] text-[#6B7280] hover:border-[#0A2540] hover:text-[#0A2540]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#0A2540] dark:text-white mb-1.5">
          {tr("monitors.languages-label")}
        </label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => toggle(languages, l, setLanguages)}
              className={`px-3 py-1 text-xs font-bold rounded-full border transition-colors ${
                languages.includes(l)
                  ? "bg-[#0A2540] text-white border-[#0A2540]"
                  : "border-[#D8DEE6] text-[#6B7280] hover:border-[#0A2540] hover:text-[#0A2540]"
              }`}
            >
              {LANG_LABELS[l]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-[#0A2540] text-white text-sm rounded-lg hover:bg-[#0F3A5F] disabled:opacity-50 transition-colors"
        >
          {saving ? "…" : tr("monitors.save")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm border border-[#D8DEE6] rounded-lg hover:bg-[#F4F6F9] transition-colors"
        >
          {tr("monitors.cancel")}
        </button>
      </div>
    </form>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MonitorsPage() {
  const { t: tr } = useLang();
  const { data: session, status } = useSession();

  // Monitor list state
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loadingMonitors, setLoadingMonitors] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Match inbox state
  const [selectedMonitorId, setSelectedMonitorId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [markingRead, setMarkingRead] = useState(false);
  const [isPro, setIsPro] = useState<boolean | null>(null);

  const handleNav = (key: PageKey) => {
    window.location.href = key === "home" ? "/" : `/#${key}`;
  };

  // Check tier access
  useEffect(() => {
    if (status === "unauthenticated") { setIsPro(false); return; }
    if (status !== "authenticated") return;
    fetch("/api/monitors")
      .then((r) => {
        if (r.status === 403) { setIsPro(false); return null; }
        setIsPro(true);
        return r.json();
      })
      .then((d) => {
        if (d?.monitors) setMonitors(d.monitors);
        setLoadingMonitors(false);
      })
      .catch(() => setLoadingMonitors(false));
  }, [status]);

  // Load matches when monitor selection changes
  const loadMatches = useCallback((monitorId: string | null, page = 1) => {
    setLoadingMatches(true);
    const qs = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (monitorId) qs.set("monitorId", monitorId);
    fetch(`/api/monitors/matches?${qs}`)
      .then((r) => r.json())
      .then((d) => {
        setMatches(d.matches ?? []);
        setPagination(d.pagination ?? null);
      })
      .catch(() => {})
      .finally(() => setLoadingMatches(false));
  }, []);

  useEffect(() => {
    if (isPro) loadMatches(selectedMonitorId);
  }, [isPro, selectedMonitorId, loadMatches]);

  const handleCreate = async (data: Partial<Monitor>) => {
    setSaving(true);
    try {
      const r = await fetch("/api/monitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (r.ok) {
        const { monitor } = await r.json();
        setMonitors((prev) => [...prev, { ...monitor, totalMatches: 0, unreadMatches: 0 }]);
        setShowForm(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string, data: Partial<Monitor>) => {
    setSaving(true);
    try {
      const r = await fetch(`/api/monitors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (r.ok) {
        const { monitor } = await r.json();
        setMonitors((prev) => prev.map((m) => m.id === id ? { ...m, ...monitor } : m));
        setEditingId(null);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this monitor and all its matches?")) return;
    setDeletingId(id);
    try {
      const r = await fetch(`/api/monitors/${id}`, { method: "DELETE" });
      if (r.ok) {
        setMonitors((prev) => prev.filter((m) => m.id !== id));
        if (selectedMonitorId === id) setSelectedMonitorId(null);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    await handleUpdate(id, { isActive: !isActive });
  };

  const handleMarkAllRead = async () => {
    setMarkingRead(true);
    try {
      const body = selectedMonitorId ? { monitorId: selectedMonitorId } : {};
      await fetch("/api/monitors/matches/read-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setMatches((prev) => prev.map((m) => ({ ...m, isRead: true })));
      setMonitors((prev) =>
        prev.map((m) =>
          !selectedMonitorId || m.id === selectedMonitorId
            ? { ...m, unreadMatches: 0 }
            : m
        )
      );
    } finally {
      setMarkingRead(false);
    }
  };

  const formatMatchCriteria = (matchedOn: string[]): string => {
    return matchedOn
      .map((m) => {
        if (m.startsWith("keyword:")) return m.slice(8);
        if (m.startsWith("section:")) return SECTION_LABELS[m.slice(8)] ?? m.slice(8);
        if (m.startsWith("type:")) return m.slice(5);
        if (m === "all-content") return "All content";
        return m;
      })
      .join(", ");
  };

  // ── Upgrade wall ─────────────────────────────────────────────────────────────
  if (isPro === false) {
    return (
      <NavigationProvider currentPage="help" onNavigate={handleNav}>
        <SiteNavigation currentPage="help" onNavigate={handleNav} />
        <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center px-4">
          <div className="max-w-md text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F4F6F9] mb-6">
              <Bell className="h-8 w-8 text-[#0A2540]" />
            </div>
            <h1 className="text-2xl font-bold text-[#0A2540] dark:text-white mb-3">
              {tr("monitors.upgrade-title")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {tr("monitors.upgrade-body")}
            </p>
            <a
              href="/#membership"
              className="inline-block px-6 py-3 bg-[#0A2540] text-white rounded-lg font-semibold hover:bg-[#0F3A5F] transition-colors"
            >
              {tr("monitors.upgrade-cta")}
            </a>
          </div>
        </div>
        <SiteFooter />
      </NavigationProvider>
    );
  }

  const allUnread = monitors.reduce((sum, m) => sum + m.unreadMatches, 0);
  const selectedMonitor = monitors.find((m) => m.id === selectedMonitorId);
  const selectedUnread = selectedMonitor?.unreadMatches ?? allUnread;

  return (
    <NavigationProvider currentPage="help" onNavigate={handleNav}>
      <SiteNavigation currentPage="help" onNavigate={handleNav} />
      <div className="min-h-screen bg-white dark:bg-slate-950">
        {/* Header */}
        <div className="border-b border-[#D8DEE6] dark:border-slate-800 bg-gradient-to-br from-[#0A2540] via-[#0F3A5F] to-[#14445A] text-white py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Bell className="h-6 w-6 text-blue-200" />
                  <h1 className="text-3xl sm:text-4xl font-bold">{tr("monitors.page-title")}</h1>
                </div>
                <p className="text-blue-100 max-w-xl">{tr("monitors.page-subtitle")}</p>
              </div>
              {allUnread > 0 && (
                <span className="hidden sm:inline-flex items-center gap-1.5 bg-[#E8272C] text-white text-sm font-bold px-3 py-1.5 rounded-full">
                  <Bell className="h-4 w-4" />
                  {allUnread} {tr("monitors.unread")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Monitor list */}
            <div className="lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-[#0A2540] dark:text-white uppercase tracking-wider">
                  Monitors
                </h2>
                {monitors.length < 10 && !showForm && (
                  <button
                    onClick={() => { setShowForm(true); setEditingId(null); }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-[#0A2540] text-white rounded-lg hover:bg-[#0F3A5F] transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {tr("monitors.new")}
                  </button>
                )}
              </div>

              {showForm && (
                <div className="mb-4">
                  <MonitorForm
                    tr={tr}
                    onSave={handleCreate}
                    onCancel={() => setShowForm(false)}
                    saving={saving}
                  />
                </div>
              )}

              {monitors.length >= 10 && !showForm && (
                <p className="text-xs text-[#E8272C] mb-3">{tr("monitors.max")}</p>
              )}

              {loadingMonitors ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 rounded-lg bg-[#F4F6F9] animate-pulse" />
                  ))}
                </div>
              ) : monitors.length === 0 && !showForm ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 py-4">
                  {tr("monitors.empty")}
                </p>
              ) : (
                <div className="space-y-1.5">
                  {/* "All monitors" selector */}
                  <button
                    onClick={() => setSelectedMonitorId(null)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                      selectedMonitorId === null
                        ? "bg-[#0A2540] text-white"
                        : "hover:bg-[#F4F6F9] dark:hover:bg-slate-800 text-[#0A2540] dark:text-white"
                    }`}
                  >
                    <span>{tr("monitors.all-monitors")}</span>
                    {allUnread > 0 && (
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                        selectedMonitorId === null ? "bg-white/20 text-white" : "bg-[#E8272C] text-white"
                      }`}>
                        {allUnread}
                      </span>
                    )}
                  </button>

                  {monitors.map((m) => (
                    <div key={m.id}>
                      {editingId === m.id ? (
                        <MonitorForm
                          tr={tr}
                          initial={m}
                          onSave={(data) => handleUpdate(m.id, data)}
                          onCancel={() => setEditingId(null)}
                          saving={saving}
                        />
                      ) : (
                        <div
                          className={`rounded-lg border transition-colors ${
                            selectedMonitorId === m.id
                              ? "border-[#0A2540] bg-[#F4F6F9] dark:bg-slate-800"
                              : "border-[#D8DEE6] dark:border-slate-700 hover:border-[#0A2540]/40"
                          } ${!m.isActive ? "opacity-50" : ""}`}
                        >
                          <button
                            onClick={() => setSelectedMonitorId(m.id)}
                            className="w-full text-left px-3 py-2.5"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-semibold text-[#0A2540] dark:text-white truncate pr-2">
                                {m.name}
                              </span>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {m.unreadMatches > 0 && (
                                  <span className="bg-[#E8272C] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                                    {m.unreadMatches}
                                  </span>
                                )}
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                  m.isActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-500"
                                }`}>
                                  {m.isActive ? tr("monitors.active") : tr("monitors.paused")}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {m.keywords.slice(0, 4).map((k) => (
                                <span key={k} className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-1.5 py-0.5 rounded">
                                  {k}
                                </span>
                              ))}
                              {m.keywords.length > 4 && (
                                <span className="text-[10px] text-gray-400">+{m.keywords.length - 4}</span>
                              )}
                              {m.sections.slice(0, 2).map((s) => (
                                <span key={s} className="text-[10px] bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">
                                  {SECTION_LABELS[s]?.split(" ")[0] ?? s}
                                </span>
                              ))}
                            </div>
                          </button>
                          {/* Monitor actions */}
                          <div className="flex items-center gap-1 px-2 pb-2">
                            <button
                              onClick={() => setEditingId(m.id)}
                              className="flex-1 text-xs text-[#6B7280] hover:text-[#0A2540] px-2 py-1 rounded hover:bg-white dark:hover:bg-slate-700 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggle(m.id, m.isActive)}
                              className="p-1 text-[#6B7280] hover:text-[#0A2540] rounded hover:bg-white dark:hover:bg-slate-700 transition-colors"
                              title={m.isActive ? tr("monitors.toggle-off") : tr("monitors.toggle-on")}
                            >
                              {m.isActive
                                ? <PauseCircle className="h-4 w-4" />
                                : <PlayCircle className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => handleDelete(m.id)}
                              disabled={deletingId === m.id}
                              className="p-1 text-[#6B7280] hover:text-[#E8272C] rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                              title={tr("monitors.delete")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Match inbox */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-[#0A2540] dark:text-white uppercase tracking-wider">
                  {tr("monitors.matches-title")}
                  {selectedMonitor && (
                    <span className="ml-2 font-normal text-gray-500">— {selectedMonitor.name}</span>
                  )}
                </h2>
                {selectedUnread > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    disabled={markingRead}
                    className="flex items-center gap-1.5 text-xs font-medium text-[#0A2540] dark:text-blue-400 hover:underline disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" />
                    {tr("monitors.mark-all-read")}
                  </button>
                )}
              </div>

              {loadingMatches ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 rounded-lg bg-[#F4F6F9] animate-pulse" />
                  ))}
                </div>
              ) : matches.length === 0 ? (
                <div className="text-center py-16">
                  <Bell className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {tr("monitors.matches-empty")}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {matches.map((match) => (
                    <Link
                      key={match.id}
                      href={`/reports/${match.reportId}`}
                      className={`block rounded-lg border p-4 transition-colors hover:border-[#0A2540]/40 hover:bg-[#F4F6F9]/50 dark:hover:bg-slate-800/50 ${
                        match.isRead
                          ? "border-[#D8DEE6] dark:border-slate-700"
                          : "border-[#0A2540]/20 dark:border-blue-700/30 bg-blue-50/30 dark:bg-blue-900/10"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Unread dot */}
                        <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${
                          match.isRead ? "bg-transparent" : "bg-[#E8272C]"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[10px] font-semibold px-2 py-0.5 bg-[#0A2540] text-white rounded uppercase tracking-wide">
                              {match.report.type}
                            </span>
                            {!selectedMonitor && (
                              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                {match.monitorName}
                              </span>
                            )}
                            <span className="text-[10px] text-gray-400 ml-auto">
                              {match.report.publishedAt
                                ? new Date(match.report.publishedAt).toLocaleDateString("en-GB", {
                                    day: "numeric", month: "short", year: "numeric",
                                  })
                                : ""}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-[#0A2540] dark:text-white leading-snug mb-1.5 line-clamp-2">
                            {match.report.title}
                          </p>
                          {match.report.summary && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                              {match.report.summary}
                            </p>
                          )}
                          {/* Matched criteria */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-gray-400">{tr("monitors.matched-on")}</span>
                            {match.matchedOn.map((m, i) => (
                              <span key={i} className="text-[10px] font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 px-1.5 py-0.5 rounded">
                                {m.startsWith("keyword:") ? m.slice(8) :
                                 m.startsWith("section:") ? (SECTION_LABELS[m.slice(8)]?.split(" ")[0] ?? m.slice(8)) :
                                 m.startsWith("type:") ? m.slice(5) :
                                 m}
                              </span>
                            ))}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                      </div>
                    </Link>
                  ))}

                  {/* Pagination */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 pt-4">
                      <button
                        onClick={() => loadMatches(selectedMonitorId, pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="px-3 py-1.5 text-xs font-medium border border-[#D8DEE6] rounded-lg disabled:opacity-40 hover:bg-[#F4F6F9] transition-colors"
                      >
                        Previous
                      </button>
                      <span className="text-xs text-gray-500">
                        {pagination.page} / {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => loadMatches(selectedMonitorId, pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                        className="px-3 py-1.5 text-xs font-medium border border-[#D8DEE6] rounded-lg disabled:opacity-40 hover:bg-[#F4F6F9] transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </NavigationProvider>
  );
}
