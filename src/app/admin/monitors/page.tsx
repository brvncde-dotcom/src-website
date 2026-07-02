"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Bell, RefreshCw, Loader2, Play, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MonitorRow {
  id: string;
  name: string;
  keywords: string[];
  sections: string[];
  types: string[];
  languages: string[];
  isActive: boolean;
  createdAt: string;
  _count: { matches: number };
  unread: number;
  user: { id: string; name: string | null; email: string | null };
}

interface Stats {
  totalMonitors: number;
  activeMonitors: number;
  totalMatches: number;
  unreadMatches: number;
  usersWithMonitors: number;
}

export default function AdminMonitorsPage() {
  const { data: session, status } = useSession();
  const [monitors, setMonitors] = useState<MonitorRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ scanned: number; matched: number } | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/monitors");
      if (!r.ok) return;
      const data = await r.json();
      setMonitors(data.monitors ?? []);
      setStats(data.stats ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && isAdmin) load();
  }, [status, isAdmin, load]);

  const runScan = async () => {
    setScanning(true);
    setScanResult(null);
    try {
      const r = await fetch("/api/admin/run-monitor-scan", { method: "POST" });
      if (r.ok) {
        const data = await r.json();
        setScanResult({ scanned: data.scanned, matched: data.matched });
        load();
      }
    } finally {
      setScanning(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-[#5A6B7F]" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-sm text-[#E8272C]">Administrator access required.</p>
      </div>
    );
  }

  // Group monitors by user
  const byUser = monitors.reduce<Record<string, MonitorRow[]>>((acc, m) => {
    const uid = m.user.id;
    if (!acc[uid]) acc[uid] = [];
    acc[uid].push(m);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2540] flex items-center gap-2">
            <Bell className="h-6 w-6" /> Content Monitors
          </h1>
          <p className="text-sm text-[#5A6B7F] mt-1">All member monitors and match activity.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={runScan} disabled={scanning}>
            {scanning ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-1.5" />
            )}
            Run scan now
          </Button>
        </div>
      </div>

      {scanResult && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          Scan complete — scanned <strong>{scanResult.scanned}</strong> reports, created/confirmed{" "}
          <strong>{scanResult.matched}</strong> match(es).
        </div>
      )}

      {/* Stats strip */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total monitors", value: stats.totalMonitors },
            { label: "Active", value: stats.activeMonitors },
            { label: "Total matches", value: stats.totalMatches },
            { label: "Unread", value: stats.unreadMatches },
            { label: "Users", value: stats.usersWithMonitors },
          ].map((s) => (
            <div key={s.label} className="border border-[#D8DEE6] rounded-lg p-4 bg-white">
              <div className="text-2xl font-bold text-[#0A2540]">{s.value}</div>
              <div className="text-xs text-[#5A6B7F] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Per-user accordion */}
      {Object.keys(byUser).length === 0 ? (
        <div className="text-center py-16 text-[#5A6B7F]">
          <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No monitors created yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {Object.entries(byUser).map(([uid, rows]) => {
            const user = rows[0].user;
            const totalMatches = rows.reduce((s, m) => s + m._count.matches, 0);
            const unread = rows.reduce((s, m) => s + m.unread, 0);
            const isOpen = expandedUser === uid;

            return (
              <div key={uid} className="border border-[#D8DEE6] rounded-lg bg-white overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[#F5F7FA] transition-colors"
                  onClick={() => setExpandedUser(isOpen ? null : uid)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-[#0A2540] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {(user.name || user.email || "?")[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="text-left min-w-0">
                      <div className="text-sm font-semibold text-[#0A2540] truncate">
                        {user.name || user.email}
                      </div>
                      {user.name && (
                        <div className="text-xs text-[#5A6B7F] truncate">{user.email}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <span className="text-xs text-[#5A6B7F]">
                      {rows.length} monitor{rows.length !== 1 ? "s" : ""}
                    </span>
                    <span className="text-xs text-[#5A6B7F]">{totalMatches} matches</span>
                    {unread > 0 && (
                      <Badge className="bg-[#E8272C] text-white text-[10px] px-1.5">
                        {unread} unread
                      </Badge>
                    )}
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-[#5A6B7F]" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-[#5A6B7F]" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-[#D8DEE6] divide-y divide-[#D8DEE6]">
                    {rows.map((m) => (
                      <div key={m.id} className="px-5 py-3 flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-[#0A2540]">{m.name}</span>
                            <Badge
                              variant={m.isActive ? "default" : "secondary"}
                              className="text-[10px] px-1.5"
                            >
                              {m.isActive ? "active" : "paused"}
                            </Badge>
                          </div>
                          {m.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-1">
                              {m.keywords.map((k) => (
                                <span
                                  key={k}
                                  className="text-[10px] bg-orange-50 text-orange-700 border border-orange-200 rounded px-1.5 py-0.5"
                                >
                                  {k}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex flex-wrap gap-1">
                            {m.sections.map((s) => (
                              <span
                                key={s}
                                className="text-[10px] bg-[#F5F7FA] text-[#5A6B7F] border border-[#D8DEE6] rounded px-1.5 py-0.5"
                              >
                                {s}
                              </span>
                            ))}
                            {m.types.map((t) => (
                              <span
                                key={t}
                                className="text-[10px] bg-[#F5F7FA] text-[#5A6B7F] border border-[#D8DEE6] rounded px-1.5 py-0.5"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-semibold text-[#0A2540]">
                            {m._count.matches}
                          </div>
                          <div className="text-[10px] text-[#5A6B7F]">matches</div>
                          {m.unread > 0 && (
                            <div className="text-[10px] text-[#E8272C] font-semibold">
                              {m.unread} unread
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
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
