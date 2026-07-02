"use client";

// Ingestion Log — the observability layer between Paperclip and the review
// queue. Every POST /api/reports attempt (accepted / rejected / error /
// unauthorized) is one row here. First stop when content "disappears":
// if it's not in this log, Paperclip never sent it; if it's here as
// rejected/unauthorized, the reason column says why.

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ShieldOff,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface LogEntry {
  id: string;
  outcome: string;
  reason: string | null;
  code: string | null;
  httpStatus: number;
  title: string | null;
  sourceRef: string | null;
  language: string | null;
  type: string | null;
  section: string | null;
  reportId: string | null;
  createdAt: string;
}

const OUTCOME_META: Record<
  string,
  { label: string; chip: string; icon: React.ComponentType<{ className?: string }> }
> = {
  accepted: {
    label: "Accepted",
    chip: "bg-green-100 text-green-800 border-green-300",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    chip: "bg-red-100 text-red-800 border-red-300",
    icon: XCircle,
  },
  error: {
    label: "Error",
    chip: "bg-orange-100 text-orange-800 border-orange-300",
    icon: AlertTriangle,
  },
  unauthorized: {
    label: "Unauthorized",
    chip: "bg-purple-100 text-purple-800 border-purple-300",
    icon: ShieldOff,
  },
};

export default function AdminIngestionLogPage() {
  const { data: session, status } = useSession();
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("outcome", filter);
      const r = await fetch(`/api/admin/ingestion-log?${params.toString()}`);
      if (!r.ok) return;
      const data = await r.json();
      setEntries(data.entries ?? []);
      setCounts(data.counts ?? {});
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (status === "authenticated" && isAdmin) load();
  }, [status, isAdmin, load]);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-[#5A6B7F]" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center text-sm text-[#5A6B7F]">
        Administrator access required.
      </div>
    );
  }

  const totalAll = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-[#0A2540]">Ingestion Log</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={load}
          disabled={loading}
          className="gap-1.5 text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      <p className="text-sm text-[#5A6B7F] mb-6">
        Every push Paperclip made to <code className="font-mono text-xs">/api/reports</code> —
        including the ones that were turned away. If content is missing from the review
        queue and it isn&apos;t here either, Paperclip never sent it.
      </p>

      {/* Outcome filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-colors ${
            filter === "all"
              ? "bg-[#0A2540] text-white border-[#0A2540]"
              : "bg-white text-[#5A6B7F] border-[#D8DEE6] hover:border-[#0A2540]"
          }`}
        >
          All ({totalAll})
        </button>
        {Object.entries(OUTCOME_META).map(([key, meta]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-colors ${
              filter === key
                ? "bg-[#0A2540] text-white border-[#0A2540]"
                : `${meta.chip} hover:opacity-80`
            }`}
          >
            {meta.label} ({counts[key] ?? 0})
          </button>
        ))}
      </div>

      {/* Log table */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-6 w-6 animate-spin text-[#5A6B7F]" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[#D8DEE6] rounded-lg">
          <Inbox className="h-8 w-8 text-[#5A6B7F]/40 mx-auto mb-3" />
          <div className="text-sm text-[#5A6B7F] mb-1">No ingestion attempts logged yet</div>
          <div className="text-xs text-[#5A6B7F]/60 max-w-md mx-auto">
            Logging started with this deploy — the next push from Paperclip will appear
            here, whether it is accepted or rejected.
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto border border-[#D8DEE6] rounded-lg bg-white">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#D8DEE6] bg-[#F4F6F9] text-left text-[#5A6B7F]">
                <th className="px-3 py-2.5 font-semibold whitespace-nowrap">When</th>
                <th className="px-3 py-2.5 font-semibold">Outcome</th>
                <th className="px-3 py-2.5 font-semibold">Title</th>
                <th className="px-3 py-2.5 font-semibold whitespace-nowrap">Source Ref</th>
                <th className="px-3 py-2.5 font-semibold">Type</th>
                <th className="px-3 py-2.5 font-semibold">Lang</th>
                <th className="px-3 py-2.5 font-semibold">Reason</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => {
                const meta = OUTCOME_META[e.outcome] ?? OUTCOME_META.error;
                const Icon = meta.icon;
                return (
                  <tr key={e.id} className="border-b border-[#D8DEE6]/60 last:border-0 align-top">
                    <td className="px-3 py-2.5 whitespace-nowrap text-[#5A6B7F] font-mono">
                      {formatTime(e.createdAt)}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-semibold ${meta.chip}`}
                      >
                        <Icon className="h-3 w-3" />
                        {meta.label} · {e.httpStatus}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 max-w-[280px]">
                      <div className="font-semibold text-[#0A2540] truncate" title={e.title ?? ""}>
                        {e.title || <span className="text-[#5A6B7F]/50 italic">—</span>}
                      </div>
                      {e.reportId && (
                        <div className="text-[10px] text-[#5A6B7F] font-mono truncate">
                          report: {e.reportId}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap font-mono text-[#5A6B7F]">
                      {e.sourceRef || "—"}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-[#5A6B7F]">
                      {e.type || "—"}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap uppercase text-[#5A6B7F]">
                      {e.language || "—"}
                    </td>
                    <td className="px-3 py-2.5 max-w-[320px] text-[#5A6B7F]">
                      {e.code && (
                        <span className="font-mono text-[10px] bg-[#F4F6F9] border border-[#D8DEE6] rounded px-1 py-0.5 mr-1.5">
                          {e.code}
                        </span>
                      )}
                      {e.reason || ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
