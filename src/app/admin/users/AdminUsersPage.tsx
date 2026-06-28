"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Eye,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Shield,
  UserCog,
  Unlock,
  ArrowRightLeft,
  X,
  Check,
  Loader2,
} from "lucide-react";

// ── Types ──

interface TierInfo {
  id: string;
  slug: string;
  name: string;
}

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isMember: boolean;
  currentTierId: string | null;
  trialStart: string | null;
  trialEnd: string | null;
  phone: string | null;
  organization: string | null;
  country: string | null;
  languagePref: string;
  createdAt: string;
  updatedAt: string;
  currentTier: TierInfo | null;
  _count: {
    subscriptions: number;
    accessGrants: number;
    savedContents: number;
  };
}

interface UserProfile extends UserRow {
  _count: UserRow["_count"] & { contentShares: number };
  phone: string | null;
  organization: string | null;
  country: string | null;
  languagePref: string;
  marketingConsent: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptions: {
    id: string;
    status: string;
    billingInterval: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    amountChf: string;
    stripeStatus: string | null;
    tier: TierInfo;
  }[];
  accessGrants: {
    id: string;
    grantType: string;
    startsAt: string;
    expiresAt: string | null;
    isPermanent: boolean;
    grantedBy: string;
    reason: string;
    status: string;
    createdAt: string;
    tier: TierInfo | null;
  }[];
  accessType: string;
}

// ── Constants ──

const TIER_OPTIONS: { slug: string; label: string }[] = [
  { slug: "observer", label: "Observer" },
  { slug: "essential", label: "Essential" },
  { slug: "professional", label: "Professional" },
  { slug: "executive", label: "Executive" },
];

const TIER_COLORS: Record<string, string> = {
  observer: "bg-gray-100 text-gray-700 border-gray-300",
  essential: "bg-emerald-100 text-emerald-800 border-emerald-300",
  professional: "bg-blue-100 text-blue-800 border-blue-300",
  executive: "bg-amber-100 text-amber-800 border-amber-300",
};

const ACCESS_TYPE_LABELS: Record<string, string> = {
  subscription: "Subscription",
  grant: "Granted",
  trial: "Trial",
  none: "None",
};

const ACCESS_TYPE_COLORS: Record<string, string> = {
  subscription: "bg-green-100 text-green-800 border-green-300",
  grant: "bg-purple-100 text-purple-800 border-purple-300",
  trial: "bg-yellow-100 text-yellow-800 border-yellow-300",
  none: "bg-gray-100 text-gray-500 border-gray-200",
};

const GRANT_TYPE_LABELS: Record<string, string> = {
  free_tier: "Free Tier",
  complimentary_period: "Complimentary Period",
  content_unlock: "Content Unlock",
};

// ── Component ──

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [tierPopoverUserId, setTierPopoverUserId] = useState<string | null>(null);
  const [tierChanging, setTierChanging] = useState(false);

  // Grant access modal
  const [grantModal, setGrantModal] = useState<{
    open: boolean;
    user: UserRow | null;
  }>({ open: false, user: null });
  const [grantForm, setGrantForm] = useState({
    grantType: "",
    tierSlug: "",
    durationDays: "30",
    reason: "",
  });
  const [grantSubmitting, setGrantSubmitting] = useState(false);

  // Auth
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("src_admin_key") || "";
    }
    return "";
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { data: session } = useSession();

  // Auto-fetch API key if logged in via NextAuth
  useEffect(() => {
    if (session?.user?.email && !apiKey) {
      fetch("/api/admin/auth-key")
        .then(r => r.json())
        .then(data => {
          if (data.key) {
            sessionStorage.setItem("src_admin_key", data.key);
            setApiKey(data.key);
            setIsAuthenticated(true);
          }
        })
        .catch(() => {});
    }
  }, [session, apiKey]);

  // ── Fetch users ──

  const fetchUsers = useCallback(async () => {
    if (!apiKey) return;
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }

      if (!res.ok) {
        // API not available — fallback to empty
        setUsers([]);
        setTotal(0);
        return;
      }

      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch {
      // Network error or API not available — fallback to empty
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [apiKey, search]);

  useEffect(() => {
    if (apiKey) {
      setIsAuthenticated(true);
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [apiKey, fetchUsers]);

  // ── Fetch user profile ──

  const fetchUserProfile = async (userId: string) => {
    if (expandedId === userId) {
      setExpandedId(null);
      setUserProfile(null);
      return;
    }
    setExpandedId(userId);
    setProfileLoading(true);
    setUserProfile(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data);
      }
    } catch {
      // Silently fail
    } finally {
      setProfileLoading(false);
    }
  };

  // ── Change tier ──

  const handleChangeTier = async (userId: string, tierSlug: string) => {
    setTierChanging(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ field: "tier", tierSlug }),
      });
      if (res.ok) {
        setTierPopoverUserId(null);
        fetchUsers();
        // If expanded, refresh profile
        if (expandedId === userId) {
          fetchUserProfile(userId);
        }
      } else {
        const data = await res.json();
        alert(data.error || "Failed to change tier");
      }
    } catch {
      alert("Failed to change tier");
    } finally {
      setTierChanging(false);
    }
  };

  // ── Grant access ──

  const handleGrantAccess = async () => {
    if (!grantModal.user) return;

    if (!grantForm.reason.trim()) {
      alert("Reason is required");
      return;
    }

    setGrantSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        grantType: grantForm.grantType,
        reason: grantForm.reason.trim(),
      };

      if (grantForm.grantType === "free_tier" && grantForm.tierSlug) {
        body.tierSlug = grantForm.tierSlug;
      }
      if (grantForm.grantType === "complimentary_period") {
        if (grantForm.tierSlug) body.tierSlug = grantForm.tierSlug;
        body.durationDays = parseInt(grantForm.durationDays, 10) || 30;
      }

      const res = await fetch(
        `/api/admin/users/${grantModal.user.id}/grant-access`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (res.ok) {
        setGrantModal({ open: false, user: null });
        setGrantForm({ grantType: "", tierSlug: "", durationDays: "30", reason: "" });
        fetchUsers();
        if (expandedId === grantModal.user.id) {
          fetchUserProfile(grantModal.user.id);
        }
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create access grant");
      }
    } catch {
      alert("Failed to create access grant");
    } finally {
      setGrantSubmitting(false);
    }
  };

  // ── Helpers ──

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getAccessType = (user: UserRow): string => {
    if (user._count.subscriptions > 0) return "subscription";
    if (user._count.accessGrants > 0) return "grant";
    if (user.trialEnd && new Date(user.trialEnd) > new Date()) return "trial";
    return "none";
  };

  const openGrantModal = (user: UserRow) => {
    setGrantModal({ open: true, user });
    setGrantForm({ grantType: "", tierSlug: "", durationDays: "30", reason: "" });
  };

  const handleLogin = () => {
    sessionStorage.setItem("src_admin_key", apiKey);
    setIsAuthenticated(true);
    fetchUsers();
  };

  // ── Login screen ──

  if (!isAuthenticated || !apiKey) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center px-4">
        <div className="bg-white border border-[#D8DEE6] rounded-sm p-8 w-full max-w-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-[#0A2540] rounded-sm flex items-center justify-center">
              <ShieldIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm">SRC Admin</div>
              <div className="text-[10px] uppercase tracking-wider text-[#5A6B7F]">
                User Management
              </div>
            </div>
          </div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
            Admin API Key
          </label>
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your admin key"
            className="h-11 mb-4"
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <Button
            onClick={handleLogin}
            className="w-full bg-[#0A2540] hover:bg-[#0A2540]/90 text-white font-semibold text-sm uppercase tracking-wider h-11"
          >
            Access Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // ── Main dashboard ──

  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      {/* Header */}
      <header className="bg-white border-b border-[#D8DEE6] sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-[#0A2540] rounded-sm flex items-center justify-center">
              <ShieldIcon className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm">User Management</h1>
              <p className="text-[10px] uppercase tracking-wider text-[#5A6B7F]">
                SRC Admin
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
            className="gap-1.5 text-xs"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Search & Filters */}
        <div className="bg-white border border-[#D8DEE6] rounded-sm p-4 mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-wrap">
          <Search className="h-4 w-4 text-[#5A6B7F] shrink-0" />
          <div className="relative flex-1 min-w-[200px]">
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 text-xs pl-3"
              onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
            />
          </div>
          <div className="ml-auto text-xs text-[#5A6B7F]">
            {total} user{total !== 1 ? "s" : ""}
          </div>
        </div>

        {/* User Table */}
        {loading ? (
          <div className="text-center py-20 text-sm text-[#5A6B7F]">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-[#5A6B7F] text-sm mb-2">No users found</div>
            <div className="text-xs text-[#5A6B7F]/60">
              {search
                ? "Try adjusting your search query"
                : "Users will appear here once they register on the platform"}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#D8DEE6] rounded-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F8F9FA] border-b border-[#D8DEE6] hover:bg-[#F8F9FA]">
                    <TableHead className="text-[10px] uppercase tracking-wider font-bold text-[#5A6B7F] h-10 px-4">
                      Name
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-bold text-[#5A6B7F] h-10 px-4">
                      Email
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-bold text-[#5A6B7F] h-10 px-4">
                      Role
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-bold text-[#5A6B7F] h-10 px-4">
                      Tier
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-bold text-[#5A6B7F] h-10 px-4">
                      Access Type
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-bold text-[#5A6B7F] h-10 px-4">
                      Status
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-bold text-[#5A6B7F] h-10 px-4">
                      Joined
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-bold text-[#5A6B7F] h-10 px-4 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const accessType = getAccessType(user);
                    const isExpanded = expandedId === user.id;
                    return (
                      <>
                        <TableRow
                          key={user.id}
                          className="border-b border-[#D8DEE6]/60"
                        >
                          <TableCell className="px-4 py-3">
                            <span className="text-sm font-semibold text-[#0A2540]">
                              {user.name || "—"}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <span className="text-xs font-mono text-[#5A6B7F]">
                              {user.email}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-sm border bg-[#0A2540] text-white border-[#0A2540]">
                              {user.role}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            {user.currentTier ? (
                              <span
                                className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-sm border ${
                                  TIER_COLORS[user.currentTier.slug] || "bg-gray-100 text-gray-700 border-gray-300"
                                }`}
                              >
                                {user.currentTier.name}
                              </span>
                            ) : (
                              <span className="text-xs text-[#5A6B7F]/50">—</span>
                            )}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-sm border ${
                                ACCESS_TYPE_COLORS[accessType] || ""
                              }`}
                            >
                              {ACCESS_TYPE_LABELS[accessType] || accessType}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-sm border ${
                                user.isMember
                                  ? "bg-green-100 text-green-800 border-green-300"
                                  : "bg-gray-100 text-gray-500 border-gray-200"
                              }`}
                            >
                              {user.isMember ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <span className="text-xs text-[#5A6B7F]">
                              {formatDate(user.createdAt)}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* View */}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                onClick={() => fetchUserProfile(user.id)}
                                title="View details"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-3.5 w-3.5" />
                                ) : (
                                  <Eye className="h-3.5 w-3.5" />
                                )}
                              </Button>

                              {/* Change Tier */}
                              <Popover
                                open={tierPopoverUserId === user.id}
                                onOpenChange={(open) =>
                                  setTierPopoverUserId(open ? user.id : null)
                                }
                              >
                                <PopoverTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0"
                                    title="Change tier"
                                  >
                                    <UserCog className="h-3.5 w-3.5" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  align="end"
                                  className="w-48 p-2"
                                >
                                  <div className="text-[10px] uppercase tracking-wider font-bold text-[#5A6B7F] mb-2 px-2">
                                    Change Tier
                                  </div>
                                  <div className="space-y-0.5">
                                    {TIER_OPTIONS.map((tier) => (
                                      <button
                                        key={tier.slug}
                                        disabled={tierChanging}
                                        onClick={() =>
                                          handleChangeTier(user.id, tier.slug)
                                        }
                                        className={`w-full text-left px-2 py-1.5 text-xs rounded-sm hover:bg-[#F4F6F9] transition-colors flex items-center justify-between ${
                                          user.currentTier?.slug === tier.slug
                                            ? "text-[#0A2540] font-semibold bg-[#F4F6F9]"
                                            : "text-[#5A6B7F]"
                                        }`}
                                      >
                                        <span>{tier.label}</span>
                                        {user.currentTier?.slug === tier.slug && (
                                          <Check className="h-3 w-3 text-[#0A2540]" />
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                </PopoverContent>
                              </Popover>

                              {/* Grant Access */}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                onClick={() => openGrantModal(user)}
                                title="Grant access"
                              >
                                <Unlock className="h-3.5 w-3.5" />
                              </Button>

                              {/* Impersonate */}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-[#E8272C] hover:text-[#E8272C] hover:bg-red-50"
                                title="Impersonate"
                              >
                                <ArrowRightLeft className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Expanded Profile Row */}
                        {isExpanded && (
                          <TableRow key={`${user.id}-detail`}>
                            <TableCell
                              colSpan={8}
                              className="bg-[#F8F9FA] border-b border-[#D8DEE6] p-0"
                            >
                              <div className="p-6">
                                {profileLoading ? (
                                  <div className="flex items-center gap-2 text-xs text-[#5A6B7F]">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Loading profile...
                                  </div>
                                ) : userProfile ? (
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Column 1: User Info */}
                                    <div>
                                      <div className="text-[10px] uppercase tracking-wider font-bold text-[#5A6B7F] mb-3">
                                        User Details
                                      </div>
                                      <dl className="space-y-2 text-xs">
                                        <div className="flex justify-between">
                                          <dt className="text-[#5A6B7F]">ID</dt>
                                          <dd className="font-mono text-[#0A2540]">
                                            {userProfile.id.slice(0, 12)}…
                                          </dd>
                                        </div>
                                        <div className="flex justify-between">
                                          <dt className="text-[#5A6B7F]">Phone</dt>
                                          <dd>{userProfile.phone || "—"}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                          <dt className="text-[#5A6B7F]">Org</dt>
                                          <dd className="max-w-[140px] truncate">
                                            {userProfile.organization || "—"}
                                          </dd>
                                        </div>
                                        <div className="flex justify-between">
                                          <dt className="text-[#5A6B7F]">Country</dt>
                                          <dd>{userProfile.country || "—"}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                          <dt className="text-[#5A6B7F]">Language</dt>
                                          <dd className="uppercase font-semibold">
                                            {userProfile.languagePref}
                                          </dd>
                                        </div>
                                        <div className="flex justify-between">
                                          <dt className="text-[#5A6B7F]">
                                            Stripe Cust.
                                          </dt>
                                          <dd className="font-mono text-[10px]">
                                            {userProfile.stripeCustomerId || "—"}
                                          </dd>
                                        </div>
                                        <div className="flex justify-between">
                                          <dt className="text-[#5A6B7F]">
                                            Trial
                                          </dt>
                                          <dd>
                                            {userProfile.trialStart
                                              ? `${formatDate(userProfile.trialStart)} → ${formatDate(userProfile.trialEnd)}`
                                              : "—"}
                                          </dd>
                                        </div>
                                      </dl>
                                    </div>

                                    {/* Column 2: Subscriptions */}
                                    <div>
                                      <div className="text-[10px] uppercase tracking-wider font-bold text-[#5A6B7F] mb-3">
                                        Subscriptions (
                                        {userProfile.subscriptions.length})
                                      </div>
                                      {userProfile.subscriptions.length === 0 ? (
                                        <div className="text-xs text-[#5A6B7F]/50 italic">
                                          No subscriptions
                                        </div>
                                      ) : (
                                        <div className="space-y-2">
                                          {userProfile.subscriptions.map(
                                            (sub) => (
                                              <div
                                                key={sub.id}
                                                className="bg-white border border-[#D8DEE6] rounded-sm p-3"
                                              >
                                                <div className="flex items-center justify-between mb-1">
                                                  <span className="text-xs font-semibold">
                                                    {sub.tier.name}
                                                  </span>
                                                  <span
                                                    className={`inline-flex items-center px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-bold rounded-sm border ${
                                                      sub.status === "active"
                                                        ? "bg-green-100 text-green-800 border-green-300"
                                                        : "bg-gray-100 text-gray-500 border-gray-200"
                                                    }`}
                                                  >
                                                    {sub.status}
                                                  </span>
                                                </div>
                                                <div className="text-[10px] text-[#5A6B7F]">
                                                  {sub.billingInterval}ly ·{" "}
                                                  {sub.amountChf} CHF
                                                </div>
                                                <div className="text-[10px] text-[#5A6B7F]">
                                                  {formatDate(
                                                    sub.currentPeriodStart
                                                  )}{" "}
                                                  →{" "}
                                                  {formatDate(
                                                    sub.currentPeriodEnd
                                                  )}
                                                </div>
                                                {sub.cancelAtPeriodEnd && (
                                                  <div className="text-[10px] text-[#E8272C] font-semibold mt-1">
                                                    Cancels at period end
                                                  </div>
                                                )}
                                              </div>
                                            )
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    {/* Column 3: Access Grants */}
                                    <div>
                                      <div className="text-[10px] uppercase tracking-wider font-bold text-[#5A6B7F] mb-3">
                                        Access Grants (
                                        {userProfile.accessGrants.length})
                                      </div>
                                      {userProfile.accessGrants.length === 0 ? (
                                        <div className="text-xs text-[#5A6B7F]/50 italic">
                                          No access grants
                                        </div>
                                      ) : (
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                          {userProfile.accessGrants.map(
                                            (grant) => (
                                              <div
                                                key={grant.id}
                                                className="bg-white border border-[#D8DEE6] rounded-sm p-3"
                                              >
                                                <div className="flex items-center justify-between mb-1">
                                                  <span className="text-xs font-semibold">
                                                    {GRANT_TYPE_LABELS[grant.grantType] ||
                                                      grant.grantType}
                                                  </span>
                                                  <span
                                                    className={`inline-flex items-center px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-bold rounded-sm border ${
                                                      grant.status === "active"
                                                        ? "bg-green-100 text-green-800 border-green-300"
                                                        : "bg-gray-100 text-gray-500 border-gray-200"
                                                    }`}
                                                  >
                                                    {grant.status}
                                                  </span>
                                                </div>
                                                {grant.tier && (
                                                  <div className="text-[10px] text-[#5A6B7F]">
                                                    Tier: {grant.tier.name}
                                                  </div>
                                                )}
                                                <div className="text-[10px] text-[#5A6B7F]">
                                                  {formatDate(grant.startsAt)}
                                                  {grant.expiresAt &&
                                                    ` → ${formatDate(grant.expiresAt)}`}
                                                  {grant.isPermanent &&
                                                    !grant.expiresAt &&
                                                    " · Permanent"}
                                                </div>
                                                <div className="text-[10px] text-[#5A6B7F] italic mt-1">
                                                  {grant.reason}
                                                </div>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      )}

                                      {/* Stats */}
                                      <div className="mt-4 pt-4 border-t border-[#D8DEE6]">
                                        <div className="text-[10px] uppercase tracking-wider font-bold text-[#5A6B7F] mb-2">
                                          Stats
                                        </div>
                                        <dl className="space-y-1 text-xs text-[#5A6B7F]">
                                          <div className="flex justify-between">
                                            <dt>Saved content</dt>
                                            <dd className="font-semibold text-[#0A2540]">
                                              {userProfile._count.savedContents}
                                            </dd>
                                          </div>
                                          <div className="flex justify-between">
                                            <dt>Content shares</dt>
                                            <dd className="font-semibold text-[#0A2540]">
                                              {userProfile._count.contentShares}
                                            </dd>
                                          </div>
                                        </dl>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-xs text-[#5A6B7F]/60 italic">
                                    Could not load profile details
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Grant Access Modal */}
      <Dialog
        open={grantModal.open}
        onOpenChange={(open) =>
          !open && setGrantModal({ open: false, user: null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant Access</DialogTitle>
            <DialogDescription>
              {grantModal.user && (
                <>
                  Create an access grant for{" "}
                  <span className="font-semibold text-[#0A2540]">
                    {grantModal.user.name || grantModal.user.email}
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Grant Type */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
                Grant Type
              </label>
              <Select
                value={grantForm.grantType}
                onValueChange={(v) =>
                  setGrantForm((f) => ({ ...f, grantType: v, tierSlug: "" }))
                }
              >
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="Select grant type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free_tier">Free Tier Assignment</SelectItem>
                  <SelectItem value="complimentary_period">
                    Complimentary Period
                  </SelectItem>
                  <SelectItem value="content_unlock">
                    Content Unlock
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tier Selector (for free_tier and complimentary_period) */}
            {(grantForm.grantType === "free_tier" ||
              grantForm.grantType === "complimentary_period") && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
                  Tier
                  {grantForm.grantType === "complimentary_period" && (
                    <span className="text-[#5A6B7F] font-normal normal-case tracking-normal ml-1">
                      (optional)
                    </span>
                  )}
                </label>
                <Select
                  value={grantForm.tierSlug}
                  onValueChange={(v) =>
                    setGrantForm((f) => ({ ...f, tierSlug: v }))
                  }
                >
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIER_OPTIONS.map((tier) => (
                      <SelectItem key={tier.slug} value={tier.slug}>
                        {tier.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Duration (for complimentary_period) */}
            {grantForm.grantType === "complimentary_period" && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
                  Duration (days)
                </label>
                <Input
                  type="number"
                  min={1}
                  value={grantForm.durationDays}
                  onChange={(e) =>
                    setGrantForm((f) => ({ ...f, durationDays: e.target.value }))
                  }
                  className="h-10 text-sm"
                  placeholder="30"
                />
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
                Reason <span className="text-[#E8272C]">*</span>
              </label>
              <Textarea
                placeholder="Why is this access being granted?"
                value={grantForm.reason}
                onChange={(e) =>
                  setGrantForm((f) => ({ ...f, reason: e.target.value }))
                }
                rows={3}
                className="text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setGrantModal({ open: false, user: null })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGrantAccess}
              disabled={
                grantSubmitting ||
                !grantForm.grantType ||
                (grantForm.grantType === "free_tier" && !grantForm.tierSlug) ||
                !grantForm.reason.trim()
              }
              className="bg-[#0A2540] hover:bg-[#0A2540]/90 text-white"
            >
              {grantSubmitting && (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              )}
              Grant Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Simple shield icon matching the admin reports page
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