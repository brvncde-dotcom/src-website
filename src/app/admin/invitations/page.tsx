"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Send, Copy, Check, X, Search } from "lucide-react";

type Tier = { id: string; slug: string; name: string };
type Invitation = {
  id: string;
  email: string;
  status: string;
  grantType: string | null;
  tierSlug: string | null;
  durationDays: number | null;
  expiresAt: string;
  createdAt: string;
};

export default function AdminInvitationsPage() {
  const { data: session } = useSession();
  const isAdmin = !!(session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;
  const [apiKey, setApiKey] = useState(() =>
    typeof window !== "undefined" ? sessionStorage.getItem("src_admin_key") || "" : ""
  );
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [query, setQuery] = useState("");
  const [lastResult, setLastResult] = useState<{ url: string; emailSent: boolean } | null>(null);

  // Form
  const [email, setEmail] = useState("");
  const [accessType, setAccessType] = useState<"trial" | "free_tier" | "complimentary_period">("complimentary_period");
  const [tierSlug, setTierSlug] = useState("");
  const [durationDays, setDurationDays] = useState("90");
  const [reason, setReason] = useState("");

  // Pull the admin key for a whitelisted, logged-in admin.
  useEffect(() => {
    if (session?.user?.email && !apiKey) {
      fetch("/api/admin/auth-key")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.key) {
            setApiKey(d.key);
            sessionStorage.setItem("src_admin_key", d.key);
          }
        })
        .catch(() => {});
    }
  }, [session, apiKey]);

  useEffect(() => {
    fetch("/api/tiers")
      .then((r) => (r.ok ? r.json() : { tiers: [] }))
      .then((d) => setTiers(d.tiers || []))
      .catch(() => {});
  }, []);

  const fetchInvitations = useCallback(() => {
    if (!isAdmin) return;
    fetch("/api/admin/invitations")
      .then((r) => (r.ok ? r.json() : { invitations: [] }))
      .then((d) => setInvitations(d.invitations || []))
      .catch(() => {});
  }, [isAdmin]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setSubmitting(true);
    setLastResult(null);
    try {
      const body: Record<string, unknown> = { email, reason };
      if (accessType !== "trial") {
        body.grantType = accessType;
        if (tierSlug) body.tierSlug = tierSlug;
        if (accessType === "complimentary_period") body.durationDays = parseInt(durationDays, 10) || 90;
      }
      const res = await fetch("/api/admin/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setLastResult({ url: data.inviteUrl, emailSent: data.emailSent });
        setEmail("");
        setReason("");
        fetchInvitations();
      } else {
        alert(data.error || "Failed to send invitation");
      }
    } catch {
      alert("Failed to send invitation");
    } finally {
      setSubmitting(false);
    }
  };

  const revoke = async (id: string) => {
    if (!confirm("Revoke this invitation?")) return;
    await fetch(`/api/admin/invitations/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    fetchInvitations();
  };

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  };

  const statusColor = (s: string) =>
    s === "pending"
      ? "bg-amber-100 text-amber-800 border-amber-300"
      : s === "accepted"
        ? "bg-green-100 text-green-800 border-green-300"
        : "bg-gray-100 text-gray-500 border-gray-200";

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-sm text-[#5A6B7F]">
        Sign in as an administrator to manage invitations.
      </div>
    );
  }

  // Text search over the list — email, status, grant type, tier.
  const q = query.trim().toLowerCase();
  const visibleInvitations = q
    ? invitations.filter((inv) =>
        [inv.email, inv.status, inv.grantType, inv.tierSlug]
          .some((f) => (f ?? "").toLowerCase().includes(q))
      )
    : invitations;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-[#0A2540] mb-1">Invitations</h1>
      <p className="text-sm text-[#5A6B7F] mb-8">
        Invite a member by email and optionally grant them access (e.g. a free Professional membership for 90 days).
      </p>

      {/* Invite form */}
      <form onSubmit={handleInvite} className="border border-[#D8DEE6] rounded-lg p-5 bg-white mb-8 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-[10px] uppercase tracking-wider font-bold text-[#5A6B7F]">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="person@example.com"
            className="w-full mt-1 border border-[#D8DEE6] rounded-sm px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider font-bold text-[#5A6B7F]">Access</label>
          <select value={accessType} onChange={(e) => setAccessType(e.target.value as typeof accessType)} className="w-full mt-1 border border-[#D8DEE6] rounded-sm px-3 py-2 text-sm bg-white">
            <option value="trial">Trial only (no grant)</option>
            <option value="complimentary_period">Complimentary — free for a period</option>
            <option value="free_tier">Free tier — permanent</option>
          </select>
        </div>
        {accessType !== "trial" && (
          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-[#5A6B7F]">Tier</label>
            <select value={tierSlug} onChange={(e) => setTierSlug(e.target.value)} className="w-full mt-1 border border-[#D8DEE6] rounded-sm px-3 py-2 text-sm bg-white">
              <option value="">Select tier…</option>
              {tiers.map((t) => (
                <option key={t.id} value={t.slug}>{t.name}</option>
              ))}
            </select>
          </div>
        )}
        {accessType === "complimentary_period" && (
          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-[#5A6B7F]">Duration (days)</label>
            <input type="number" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} className="w-full mt-1 border border-[#D8DEE6] rounded-sm px-3 py-2 text-sm" min={1} />
          </div>
        )}
        <div className="sm:col-span-2">
          <label className="text-[10px] uppercase tracking-wider font-bold text-[#5A6B7F]">Reason (optional)</label>
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. pilot partner" className="w-full mt-1 border border-[#D8DEE6] rounded-sm px-3 py-2 text-sm" />
        </div>
        <div className="sm:col-span-2">
          <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 bg-[#0A2540] hover:bg-[#0A2540]/90 text-white font-semibold text-sm px-5 py-2.5 rounded-md disabled:opacity-60">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send invitation
          </button>
        </div>
      </form>

      {lastResult && (
        <div className="border border-green-200 bg-green-50 rounded-sm p-4 mb-8 text-sm">
          <div className="text-green-800 font-semibold mb-1">
            {lastResult.emailSent ? "Invitation sent by email." : "Invitation created (email not sent — share the link below)."}
          </div>
          <div className="flex items-center gap-2">
            <code className="text-xs bg-white border border-[#D8DEE6] rounded px-2 py-1 truncate max-w-md">{lastResult.url}</code>
            <button onClick={() => copy(lastResult.url)} className="inline-flex items-center gap-1 text-xs font-semibold text-[#0A2540]">
              {copied === lastResult.url ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} Copy
            </button>
          </div>
        </div>
      )}

      {/* Invitations list */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="text-[10px] uppercase tracking-wider font-bold text-[#5A6B7F]">
          Invitations ({visibleInvitations.length}{q ? ` of ${invitations.length}` : ""})
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#5A6B7F]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search email, status, tier…"
            className="w-full border border-[#D8DEE6] rounded-md pl-8 pr-7 py-1.5 text-xs focus:outline-none focus:border-[#0A2540]"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#5A6B7F] hover:text-[#0A2540]" aria-label="Clear search">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      <div className="space-y-2">
        {visibleInvitations.length === 0 ? (
          <div className="text-sm text-[#5A6B7F]/60 italic">
            {q ? `No invitations match "${query.trim()}".` : "No invitations yet."}
          </div>
        ) : (
          visibleInvitations.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between border border-[#D8DEE6] rounded-sm px-4 py-3 bg-white">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[#0A2540] truncate">{inv.email}</div>
                <div className="text-[11px] text-[#5A6B7F]">
                  {inv.grantType ? `${inv.tierSlug || ""} ${inv.grantType.replace("_", " ")}` : "trial"}
                  {inv.durationDays ? ` · ${inv.durationDays}d` : ""}
                  {" · expires "}
                  {new Date(inv.expiresAt).toLocaleDateString("en-GB")}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`inline-flex px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-bold rounded-sm border ${statusColor(inv.status)}`}>
                  {inv.status}
                </span>
                {inv.status === "pending" && (
                  <button onClick={() => revoke(inv.id)} title="Revoke" className="text-[#E8272C] hover:text-red-700">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
