"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Send,
  RefreshCw,
  Filter,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Layers,
  Search,
} from "lucide-react";

const SECTION_LABELS: Record<string, string> = {
  "digital-power-ai": "Digital Power & AI",
  "geopolitics-hard-security": "Geopolitics & Hard Security",
  "energy-resources": "Energy & Resources",
  "climate-environment-food": "Climate, Environment & Food",
  "economy-competitiveness": "Economy & Competitiveness",
  "society-migration-institutions": "Society, Migration & Institutions",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  approved: "bg-blue-100 text-blue-800 border-blue-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
  published: "bg-green-100 text-green-800 border-green-300",
};

const LANG_LABELS: Record<string, string> = {
  en: "EN",
  de: "DE",
  fr: "FR",
  it: "IT",
};

const LANG_COLORS: Record<string, string> = {
  en: "bg-blue-100 text-blue-800 border-blue-300",
  de: "bg-purple-100 text-purple-800 border-purple-300",
  fr: "bg-orange-100 text-orange-800 border-orange-300",
  it: "bg-green-100 text-green-800 border-green-300",
};

interface CqrScore {
  composite: number;
  value: number;
  trustworthiness: number;
  sourceBias: number;
  worldviewAlignment: number;
  corruptionIndex: number;
  actionability: number;
  flags: string[];
  recommendedAction: string;
  scoredBy: string;
  frameworkVersion: number;
}

// Composite → chip color: mirrors the auto-publish floor (8.0).
function cqrChipClass(composite: number): string {
  if (composite >= 8) return "bg-green-100 text-green-800 border-green-300";
  if (composite >= 6) return "bg-amber-100 text-amber-800 border-amber-300";
  return "bg-red-100 text-red-800 border-red-300";
}

const CQR_DIMENSIONS: { key: keyof CqrScore; label: string }[] = [
  { key: "value", label: "Value" },
  { key: "trustworthiness", label: "Trustworthiness" },
  { key: "sourceBias", label: "Source Bias" },
  { key: "worldviewAlignment", label: "Worldview Alignment" },
  { key: "corruptionIndex", label: "Corruption Index" },
  { key: "actionability", label: "Actionability" },
];

interface Report {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  type: string;
  section: string;
  status: string;
  author: string | null;
  sourceRef: string | null;
  language: string;
  publishedAt: string | null;
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  reviewNote: string | null;
  minTierId: string | null;
  previewToken?: string | null;
  designSignedOffBy?: string | null;
  isFreeMonthlyPick?: boolean;
  contentScores?: CqrScore[];
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [totalInDb, setTotalInDb] = useState<number>(0);
  const [tiers, setTiers] = useState<{ id: string; name: string; sortOrder: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSection, setFilterSection] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterLang, setFilterLang] = useState<string>("all");
  const [groupBySource, setGroupBySource] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    report: Report | null;
    action: string;
  }>({ open: false, report: null, action: "" });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    report: Report | null;
  }>({ open: false, report: null });
  const [purgeDialog, setPurgeDialog] = useState(false);
  const [purging, setPurging] = useState(false);
  const [dedupDialog, setDedupDialog] = useState(false);
  const [deduping, setDeduping] = useState(false);
  const [dedupPreview, setDedupPreview] = useState<{ wouldDelete: number; wouldKeep: number } | null>(null);
  const [dedupPreviewing, setDedupPreviewing] = useState(false);
  const [actionNote, setActionNote] = useState("");
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("src_admin_key") || "";
    }
    return "";
  });
  const { data: session, status: sessionStatus } = useSession() ?? {};
  // Admin access is decided by the session (email in ADMIN_EMAILS). No key entry.
  const isAdmin = !!(session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;

  // Best-effort: fetch the admin key for the Bearer header (legacy path). The
  // admin APIs also accept the session cookie, so this is optional — never gated on.
  useEffect(() => {
    if (session?.user?.email && !apiKey) {
      fetch("/api/admin/auth-key")
        .then((r) => (r.ok ? r.json() : {}))
        .then((data: { key?: string }) => {
          if (data.key) {
            sessionStorage.setItem("src_admin_key", data.key);
            setApiKey(data.key);
          }
        })
        .catch(() => {});
    }
  }, [session, apiKey]);

  const fetchReports = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.set("view", "admin");
      params.set("limit", "2000");
      if (filterSection !== "all") params.set("section", filterSection);
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (filterLang !== "all") params.set("lang", filterLang);
      if (groupBySource) params.set("groupBy", "sourceRef");

      const res = await fetch(`/api/reports?${params.toString()}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (res.status === 401) {
        return;
      }
      const data = await res.json();
      if (data.grouped) {
        const flat: Report[] = [];
        for (const group of data.grouped) {
          flat.push(...group.versions);
        }
        flat.push(...(data.ungrouped || []));
        setReports(flat);
        setTotalInDb(flat.length);
      } else {
        setReports(data.reports || []);
        setTotalInDb(data.total ?? data.reports?.length ?? 0);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [apiKey, filterSection, filterStatus, filterLang, groupBySource]);

  useEffect(() => {
    if (isAdmin) {
      fetchReports();
    } else if (sessionStatus !== "loading") {
      setLoading(false);
    }
  }, [isAdmin, sessionStatus, fetchReports]);

  // Load the tier list for the "members-only" gating control.
  useEffect(() => {
    fetch("/api/tiers")
      .then((r) => (r.ok ? r.json() : { tiers: [] }))
      .then((d) => setTiers(d.tiers || []))
      .catch(() => {});
  }, []);

  // Set or clear a report's required tier (members-only gate).
  const handleSetTier = async (reportId: string, minTierId: string) => {
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ minTierId }),
      });
      if (res.ok) fetchReports();
    } catch {
      /* ignore */
    }
  };

  // Toggle the free monthly pick flag on a report.
  const handleToggleFreeMonthlyPick = async (reportId: string, current: boolean) => {
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ isFreeMonthlyPick: !current }),
      });
      if (res.ok) fetchReports();
    } catch {
      /* ignore */
    }
  };

  // Mint (or reuse) a draft preview token for the report and open it in a new
  // tab. Lets the board review the full draft before approval/publish.
  const openPreview = async (reportId: string) => {
    try {
      const res = await fetch(`/api/reports/${reportId}/preview-token`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.url) window.open(data.url, "_blank", "noopener,noreferrer");
    } catch {
      /* ignore */
    }
  };

  const handleAction = async () => {
    if (!actionDialog.report || !actionDialog.action) return;
    // A rejection must carry a reason (drives the re-approval loop).
    if (actionDialog.action === "rejected" && !actionNote.trim()) return;
    try {
      const res = await fetch(`/api/reports/${actionDialog.report.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          action: actionDialog.action,
          reviewNote: actionNote || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionDialog({ open: false, report: null, action: "" });
        setActionNote("");
        fetchReports();
      } else {
        alert(data.error || "Action failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openDedupDialog = async () => {
    setDedupPreview(null);
    setDedupDialog(true);
    setDedupPreviewing(true);
    try {
      const res = await fetch("/api/admin/purge-brief-duplicates");
      const data = await res.json();
      if (res.ok) setDedupPreview({ wouldDelete: data.wouldDelete, wouldKeep: data.wouldKeep });
    } catch {
      // preview failed — dialog still shows but no count
    } finally {
      setDedupPreviewing(false);
    }
  };

  const handleDedupBriefs = async () => {
    setDeduping(true);
    try {
      const res = await fetch("/api/admin/purge-brief-duplicates", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setDedupDialog(false);
        setDedupPreview(null);
        alert(data.message);
        fetchReports();
      } else {
        alert(data.error || "Dedup failed");
      }
    } catch (err) {
      console.error(err);
      alert("Dedup failed");
    } finally {
      setDeduping(false);
    }
  };

  const handlePurgeBriefs = async () => {
    setPurging(true);
    try {
      const res = await fetch("/api/admin/purge-briefs", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setPurgeDialog(false);
        alert(data.message);
        fetchReports();
      } else {
        alert(data.error || "Purge failed");
      }
    } catch (err) {
      console.error(err);
      alert("Purge failed");
    } finally {
      setPurging(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.report) return;
    try {
      const res = await fetch(`/api/reports/${deleteDialog.report.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (res.ok) {
        setDeleteDialog({ open: false, report: null });
        fetchReports();
      } else {
        alert("Delete failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredReports = searchQuery.trim()
    ? reports.filter((r) => {
        const q = searchQuery.toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          (r.author ?? "").toLowerCase().includes(q) ||
          (r.sourceRef ?? "").toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q) ||
          (r.summary ?? "").toLowerCase().includes(q)
        );
      })
    : reports;

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    let deleted = 0;
    for (const report of filteredReports) {
      try {
        const res = await fetch(`/api/reports/${report.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (res.ok) deleted++;
      } catch { /* ignore individual failures */ }
    }
    setBulkDeleting(false);
    setBulkDeleteDialog(false);
    setSearchQuery("");
    fetchReports();
    alert(`Deleted ${deleted} of ${filteredReports.length} matching reports.`);
  };

  // Access is session-based. No API key entry: sign in as an admin.
  if (sessionStatus === "loading") {
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center text-sm text-[#5A6B7F]">
        Loading…
      </div>
    );
  }
  if (!isAdmin) {
    const signedIn = !!session?.user;
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center px-4">
        <div className="bg-white border border-[#D8DEE6] rounded-sm p-8 w-full max-w-sm text-center">
          <div className="h-10 w-10 bg-[#0A2540] rounded-sm flex items-center justify-center mx-auto mb-4">
            <ShieldIcon className="h-5 w-5 text-white" />
          </div>
          <div className="font-bold text-sm mb-1">SRC Admin</div>
          <p className="text-xs text-[#5A6B7F] mb-6">
            {signedIn
              ? "Your account doesn't have administrator access."
              : "Please sign in with an administrator account to continue."}
          </p>
          <a href="/?tab=account">
            <Button className="w-full bg-[#0A2540] hover:bg-[#0A2540]/90 text-white font-semibold text-sm uppercase tracking-wider h-11">
              {signedIn ? "Switch account" : "Sign in"}
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      {/* Header */}
      <header className="bg-white border-b border-[#D8DEE6] sticky top-0 z-30">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-[#0A2540] rounded-sm flex items-center justify-center">
              <ShieldIcon className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm">Report Review Dashboard</h1>
              <p className="text-[10px] uppercase tracking-wider text-[#5A6B7F]">
                SRC Admin
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchReports}
              disabled={loading}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openDedupDialog}
              className="gap-1.5 text-xs border-orange-300 text-orange-600 hover:bg-orange-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Dedup Briefs
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPurgeDialog(true)}
              className="gap-1.5 text-xs border-red-300 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Purge All Briefs
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Filters */}
        <div className="bg-white border border-[#D8DEE6] rounded-sm p-4 mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-wrap">
          <Filter className="h-4 w-4 text-[#5A6B7F] shrink-0" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterSection} onValueChange={setFilterSection}>
            <SelectTrigger className="w-full sm:w-[220px] h-9 text-xs">
              <SelectValue placeholder="Section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              {Object.entries(SECTION_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterLang} onValueChange={setFilterLang}>
            <SelectTrigger className="w-full sm:w-[120px] h-9 text-xs">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              <SelectItem value="en">EN — English</SelectItem>
              <SelectItem value="de">DE — German</SelectItem>
              <SelectItem value="fr">FR — French</SelectItem>
              <SelectItem value="it">IT — Italian</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={groupBySource ? "default" : "outline"}
            size="sm"
            className="h-9 text-xs gap-1.5"
            onClick={() => setGroupBySource(!groupBySource)}
          >
            <Layers className="h-3.5 w-3.5" />
            Group by Source
          </Button>
          {/* Search */}
          <div className="relative sm:ml-auto">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-[#5A6B7F]" />
            <input
              type="text"
              placeholder="Search title, author, type…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-8 pr-3 text-xs border border-[#D8DEE6] rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#0A2540] w-full sm:w-56"
            />
          </div>
          <div className="text-xs text-[#5A6B7F] whitespace-nowrap">
            {searchQuery.trim()
              ? `${filteredReports.length} / ${reports.length}`
              : totalInDb > reports.length
                ? `${reports.length} loaded · ${totalInDb} total`
                : `${reports.length} report${reports.length !== 1 ? "s" : ""}`}
          </div>
          {searchQuery.trim() && filteredReports.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs gap-1.5 border-red-300 text-red-600 hover:bg-red-50 whitespace-nowrap"
              onClick={() => setBulkDeleteDialog(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete all {filteredReports.length} matching
            </Button>
          )}
        </div>

        {/* Report List */}
        {loading ? (
          <div className="text-center py-20 text-sm text-[#5A6B7F]">
            Loading reports...
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-[#5A6B7F] text-sm mb-2">No reports found</div>
            <div className="text-xs text-[#5A6B7F]/60">
              {searchQuery.trim()
                ? `No results for "${searchQuery}" — try a different search`
                : filterSection !== "all" || filterStatus !== "all"
                ? "Try adjusting your filters"
                : "Reports ingested from vnOrchestrator will appear here for review"}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-white border border-[#D8DEE6] rounded-sm overflow-hidden"
              >
                {/* Report Row */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-sm border ${STATUS_COLORS[report.status] || ""}`}
                        >
                          {report.status}
                        </span>
                        <span className="inline-flex items-center bg-[#0A2540] text-white px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-sm">
                          {report.type}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-sm border ${LANG_COLORS[report.language] || "bg-gray-100 text-gray-800 border-gray-300"}`}
                        >
                          {LANG_LABELS[report.language] || report.language}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-[#5A6B7F] font-semibold">
                          {SECTION_LABELS[report.section] || report.section}
                        </span>
                        {report.contentScores?.[0] && (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-sm border ${cqrChipClass(report.contentScores[0].composite)}`}
                            title={`${report.contentScores[0].recommendedAction} · scored by ${report.contentScores[0].scoredBy} · framework v${report.contentScores[0].frameworkVersion}`}
                          >
                            CQR {report.contentScores[0].composite.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm sm:text-base leading-snug mb-1">
                        {report.title}
                      </h3>
                      {report.summary && (
                        <p className="text-xs text-[#5A6B7F] leading-relaxed line-clamp-2">
                          {report.summary}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-[#5A6B7F]">
                        <span>Ingested: {formatDate(report.createdAt)}</span>
                        {report.author && <span>By: {report.author}</span>}
                        {report.sourceRef && (
                          <span className="font-mono">Ref: {report.sourceRef}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {report.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1 text-xs text-green-700 border-green-300 hover:bg-green-50"
                            onClick={() =>
                              setActionDialog({
                                open: true,
                                report,
                                action: "approved",
                              })
                            }
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Approve</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1 text-xs text-red-700 border-red-300 hover:bg-red-50"
                            onClick={() =>
                              setActionDialog({
                                open: true,
                                report,
                                action: "rejected",
                              })
                            }
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Reject</span>
                          </Button>
                        </>
                      )}
                      {report.status === "approved" && (
                        <>
                          <Button
                            size="sm"
                            className="h-8 gap-1 text-xs bg-green-700 hover:bg-green-800 text-white"
                            onClick={() =>
                              setActionDialog({
                                open: true,
                                report,
                                action: "published",
                              })
                            }
                          >
                            <Send className="h-3.5 w-3.5" />
                            Publish
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1 text-xs text-red-700 border-red-300 hover:bg-red-50"
                            onClick={() =>
                              setActionDialog({ open: true, report, action: "rejected" })
                            }
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Reject</span>
                          </Button>
                        </>
                      )}
                      {report.status === "rejected" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 text-xs text-green-700 border-green-300 hover:bg-green-50"
                          onClick={() =>
                            setActionDialog({ open: true, report, action: "approved" })
                          }
                          title="Re-approve after rework"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Re-approve</span>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1 text-xs text-amber-700 border-amber-300 hover:bg-amber-50"
                        onClick={() => openPreview(report.id)}
                        title="Open draft preview"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Preview</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8"
                        onClick={() =>
                          setExpandedId(expandedId === report.id ? null : report.id)
                        }
                      >
                        {expandedId === report.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() =>
                          setDeleteDialog({ open: true, report })
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedId === report.id && (
                    <div className="mt-4 pt-4 border-t border-[#D8DEE6]">
                      {report.content ? (
                        <div className="prose prose-sm max-w-none text-xs text-[#5A6B7F] leading-relaxed whitespace-pre-wrap bg-[#F4F6F9] p-4 rounded-sm max-h-96 overflow-y-auto">
                          {report.content}
                        </div>
                      ) : (
                        <div className="text-xs text-[#5A6B7F]/60 italic">
                          No full content available
                        </div>
                      )}
                      {/* CQR scorecard: why this piece was queued and what it needs
                          to clear the auto-publish floor (composite ≥ 8.0) */}
                      {report.contentScores?.[0] ? (
                        <div className="mt-3 p-3 bg-[#F4F6F9] border border-[#D8DEE6] rounded-sm">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#5A6B7F]">
                              CQR Scorecard
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-sm border ${cqrChipClass(report.contentScores[0].composite)}`}
                            >
                              {report.contentScores[0].composite.toFixed(1)} / 10
                            </span>
                            <span className="text-[10px] text-[#5A6B7F]">
                              {report.contentScores[0].recommendedAction} · scored by{" "}
                              {report.contentScores[0].scoredBy} · framework v
                              {report.contentScores[0].frameworkVersion}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5">
                            {CQR_DIMENSIONS.map(({ key, label }) => {
                              const v = report.contentScores![0][key] as number;
                              return (
                                <div key={key} className="flex items-center gap-2">
                                  <span className="text-[10px] text-[#5A6B7F] w-32 shrink-0">{label}</span>
                                  <div className="flex-1 h-1.5 bg-[#D8DEE6] rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${v >= 8 ? "bg-green-600" : v >= 6 ? "bg-amber-500" : "bg-red-500"}`}
                                      style={{ width: `${Math.min(v, 10) * 10}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] font-mono font-semibold text-[#0A2540] w-6 text-right">
                                    {v}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          {report.contentScores[0].flags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {report.contentScores[0].flags.map((f) => (
                                <span
                                  key={f}
                                  className="text-[9px] uppercase tracking-wider font-bold bg-orange-100 text-orange-800 border border-orange-300 rounded-sm px-1.5 py-0.5"
                                >
                                  {f.replace(/_/g, " ")}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mt-3 text-[10px] text-[#5A6B7F]/60 italic">
                          No CQR score yet — auto-publish requires a composite ≥ 8.0
                        </div>
                      )}

                      {/* Members-only gating: set the minimum tier required to read this report */}
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-[#5A6B7F]">
                          Members-only access
                        </span>
                        <select
                          value={report.minTierId || ""}
                          onChange={(e) => handleSetTier(report.id, e.target.value)}
                          className="text-xs border border-[#D8DEE6] rounded-sm px-2 py-1 bg-white"
                        >
                          <option value="">Public — no gate</option>
                          {tiers.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} tier or higher
                            </option>
                          ))}
                        </select>
                        {report.minTierId && (
                          <span className="text-[10px] text-[#0A2540] font-semibold">🔒 gated</span>
                        )}
                      </div>

                      {/* Free monthly pick: grants free-tier users full access to this one report */}
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-[#5A6B7F]">
                          Free monthly pick
                        </span>
                        <button
                          onClick={() => handleToggleFreeMonthlyPick(report.id, !!report.isFreeMonthlyPick)}
                          className={`text-xs px-2.5 py-1 rounded-sm border font-semibold transition-colors ${
                            report.isFreeMonthlyPick
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-50"
                              : "bg-white text-[#5A6B7F] border-[#D8DEE6] hover:border-[#0A2540]"
                          }`}
                        >
                          {report.isFreeMonthlyPick ? "✓ Active — click to remove" : "Set as free pick"}
                        </button>
                        {report.isFreeMonthlyPick && (
                          <span className="text-[10px] text-emerald-700 font-semibold">
                            Free users can read this report in full
                          </span>
                        )}
                      </div>
                      {report.reviewNote && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-sm">
                          <div className="text-[10px] uppercase tracking-wider font-semibold text-yellow-700 mb-1">
                            Review Note
                          </div>
                          <div className="text-xs text-yellow-800">
                            {report.reviewNote}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* API Usage Info — collapsed by default and not rendered while loading,
            so the dark code panel never flashes on screen during initial render */}
        {!loading && (
          <details className="mt-12 bg-white border border-[#D8DEE6] rounded-sm group">
            <summary className="flex items-center gap-2 cursor-pointer select-none p-6 font-bold text-sm">
              <ChevronDown className="h-4 w-4 -rotate-90 transition-transform group-open:rotate-0" />
              vnOrchestrator Ingestion Endpoint
            </summary>
            <div className="px-6 pb-6 -mt-2">
              <div className="bg-[#0A2540] text-green-400 text-xs font-mono p-4 rounded-sm overflow-x-auto">
            <pre>{`POST /api/reports
Authorization: Bearer <INGESTION_API_KEY>
Content-Type: application/json

{
  "title": "Report Title",
  "summary": "Brief summary",
  "content": "Full report content (markdown)",
  "type": "Analysis",
  "section": "energy-resources",
  "sourceRef": "paperclip-project-id",
  "language": "en",
  "author": "SRC Expert Panel"
}

Sections: digital-power-ai | geopolitics-hard-security | energy-resources | climate-environment-food | economy-competitiveness | society-migration-institutions
Types: Analysis | Strategy Paper | Statement | Brief | Report | Opinion
Languages: en | de | fr | it (default: en)
Unique constraint: (sourceRef, language) — one version per language per source
Publishing: all translations sharing a sourceRef publish simultaneously`}</pre>
              </div>
            </div>
          </details>
        )}
      </div>

      {/* Action Dialog */}
      <Dialog
        open={actionDialog.open}
        onOpenChange={(open) =>
          !open && setActionDialog({ open: false, report: null, action: "" })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action === "approved" && "Approve Report"}
              {actionDialog.action === "rejected" && "Reject Report"}
              {actionDialog.action === "published" && "Publish Report"}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.action === "approved" &&
                "Approving confirms this report is editorially and design-approved and ready to publish."}
              {actionDialog.action === "rejected" &&
                "Send this report back for rework. Your comment tells the desk what to change — it is required."}
              {actionDialog.action === "published" &&
                "This report will be published and visible on the public website. All translations sharing the same source reference will be published simultaneously."}
            </DialogDescription>
          </DialogHeader>
          {actionDialog.report && (
            <div className="py-2">
              <div className="text-sm font-semibold">{actionDialog.report.title}</div>
              <div className="text-xs text-[#5A6B7F] mt-1">
                {SECTION_LABELS[actionDialog.report.section]} · {actionDialog.report.type}
              </div>
            </div>
          )}
          <Textarea
            placeholder={
              actionDialog.action === "rejected"
                ? "Required — what needs to change before this can be approved?"
                : "Optional review note..."
            }
            value={actionNote}
            onChange={(e) => setActionNote(e.target.value)}
            rows={3}
            className={
              actionDialog.action === "rejected" && !actionNote.trim()
                ? "border-red-300 focus-visible:ring-red-300"
                : undefined
            }
          />
          {actionDialog.action === "rejected" && !actionNote.trim() && (
            <p className="text-xs text-red-600 -mt-1">A rejection comment is required.</p>
          )}
          <DialogFooter>
            {actionDialog.report && (
              <Button
                variant="outline"
                className="mr-auto gap-1 text-amber-700 border-amber-300 hover:bg-amber-50"
                onClick={() => actionDialog.report && openPreview(actionDialog.report.id)}
              >
                <Eye className="h-3.5 w-3.5" />
                Open Preview →
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() =>
                setActionDialog({ open: false, report: null, action: "" })
              }
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={actionDialog.action === "rejected" && !actionNote.trim()}
              className={
                actionDialog.action === "rejected"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : actionDialog.action === "published"
                    ? "bg-green-700 hover:bg-green-800 text-white disabled:opacity-50"
                    : "bg-[#0A2540] hover:bg-[#0A2540]/90 text-white disabled:opacity-50"
              }
            >
              {actionDialog.action === "approved" && "Approve"}
              {actionDialog.action === "rejected" && "Reject"}
              {actionDialog.action === "published" && "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          !open && setDeleteDialog({ open: false, report: null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Report
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. The report will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          {deleteDialog.report && (
            <div className="py-2">
              <div className="text-sm font-semibold">{deleteDialog.report.title}</div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, report: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dedup Daily Briefs Dialog */}
      <Dialog open={dedupDialog} onOpenChange={(open) => { if (!open) { setDedupDialog(false); setDedupPreview(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Remove Duplicate Daily Briefs
            </DialogTitle>
            <DialogDescription>
              Keeps the most recently ingested Daily Brief per calendar day. All older duplicates for the same day are permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 text-sm">
            {dedupPreviewing ? (
              <span className="text-[#5A6B7F]">Checking for duplicates…</span>
            ) : dedupPreview ? (
              dedupPreview.wouldDelete === 0 ? (
                <span className="text-green-700 font-semibold">No duplicates found — nothing to delete.</span>
              ) : (
                <span>
                  Will delete <strong className="text-red-600">{dedupPreview.wouldDelete}</strong> duplicate(s),
                  keeping <strong className="text-green-700">{dedupPreview.wouldKeep}</strong> brief(s) (one per day).
                </span>
              )
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDedupDialog(false); setDedupPreview(null); }} disabled={deduping}>
              Cancel
            </Button>
            <Button
              onClick={handleDedupBriefs}
              disabled={deduping || dedupPreviewing || dedupPreview?.wouldDelete === 0}
              className="bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
            >
              {deduping ? "Removing…" : `Remove ${dedupPreview?.wouldDelete ?? "…"} Duplicate(s)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Matching Dialog */}
      <Dialog open={bulkDeleteDialog} onOpenChange={(open) => !open && setBulkDeleteDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete {filteredReports.length} Matching Reports
            </DialogTitle>
            <DialogDescription>
              Permanently deletes all {filteredReports.length} report{filteredReports.length !== 1 ? "s" : ""} matching{" "}
              <strong>&ldquo;{searchQuery}&rdquo;</strong>. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 text-sm text-[#5A6B7F] max-h-48 overflow-y-auto space-y-1">
            {filteredReports.slice(0, 10).map((r) => (
              <div key={r.id} className="text-xs truncate">• {r.title}</div>
            ))}
            {filteredReports.length > 10 && (
              <div className="text-xs text-[#5A6B7F]/60">…and {filteredReports.length - 10} more</div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDeleteDialog(false)} disabled={bulkDeleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {bulkDeleting ? "Deleting…" : `Delete ${filteredReports.length} Reports`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Purge All Daily Briefs Dialog */}
      <Dialog open={purgeDialog} onOpenChange={(open) => !open && setPurgeDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Purge All Daily Briefs
            </DialogTitle>
            <DialogDescription>
              This permanently deletes <strong>every</strong> Daily Brief row from the database.
              Use this to clear bad ingestion batches before asking Paperclip to re-push.
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPurgeDialog(false)} disabled={purging}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handlePurgeBriefs}
              disabled={purging}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {purging ? "Deleting…" : "Delete All Daily Briefs"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Simple shield icon since we may not have it from lucide
function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}