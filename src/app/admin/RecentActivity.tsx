"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

type Log = {
  id: string;
  actor: string;
  action: string;
  targetType: string | null;
  detail: string | null;
  createdAt: string;
};

const ACTION_LABELS: Record<string, string> = {
  grant_created: "Granted access",
  grant_extended: "Extended access",
  grant_revoked: "Revoked access",
  grant_expired: "Access expired",
  invitation_sent: "Invitation sent",
  invitation_revoked: "Invitation revoked",
  tier_changed: "Tier changed",
};

export function RecentActivity() {
  const { data: session } = useSession();
  const isAdmin = !!(session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    fetch("/api/admin/audit")
      .then((r) => (r.ok ? r.json() : { logs: [] }))
      .then((d) => setLogs(d.logs || []))
      .catch(() => {});
  }, [isAdmin]);

  if (!isAdmin || logs.length === 0) return null;

  return (
    <div className="mt-10 max-w-3xl">
      <div className="text-[10px] uppercase tracking-wider font-bold text-[#5A6B7F] mb-3">Recent activity</div>
      <div className="border border-[#D8DEE6] rounded-lg bg-white divide-y divide-[#EEF1F5]">
        {logs.slice(0, 12).map((l) => (
          <div key={l.id} className="flex items-center justify-between px-4 py-2.5 text-xs">
            <div className="min-w-0">
              <span className="font-semibold text-[#0A2540]">{ACTION_LABELS[l.action] || l.action}</span>
              {l.detail && <span className="text-[#5A6B7F]"> · {l.detail}</span>}
            </div>
            <div className="text-[#5A6B7F]/70 shrink-0 ml-3">
              {l.actor} · {new Date(l.createdAt).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
