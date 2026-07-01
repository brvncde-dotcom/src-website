"use client";

import { useState, useEffect, useCallback } from "react";
import { useLang } from "@/components/LangProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  User,
  Bookmark,
  Share2,
  CreditCard,
  LogOut,
  Loader2,
  Check,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

// ── Types ──

interface ProfileData {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  phone: string | null;
  organization: string | null;
  country: string | null;
  languagePref: string;
  marketingConsent: boolean;
  currentTier: { id: string; slug: string; name: string } | null;
  effectiveTier: { id: string; slug: string; name: string } | null;
  trialEnd: string | null;
  isMember: boolean;
}

interface SavedItem {
  id: string;
  note: string | null;
  folder: string;
  createdAt: string;
  report: {
    id: string;
    title: string;
    type: string;
    section: string;
    author: string | null;
    publishedAt: string | null;
  };
}

interface ShareItem {
  id: string;
  shareChannel: string;
  shareUrl: string;
  clicks: number;
  createdAt: string;
  report: {
    id: string;
    title: string;
  };
}

interface SubItem {
  id: string;
  status: string;
  billingInterval: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  amountChf: string;
  tier: { id: string; slug: string; name: string };
}

// ── Component ──

export function UserAccountView() {
  const { t: tr } = useLang();
  const { data: session, status: sessionStatus, update: updateSession } = useSession();
  const [activeTab, setActiveTab] = useState("profile");

  // Profile
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  // Editable profile fields
  const [editName, setEditName] = useState("");
  const [editOrg, setEditOrg] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // Saved content
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);

  // Shares
  const [shares, setShares] = useState<ShareItem[]>([]);
  const [sharesLoading, setSharesLoading] = useState(false);

  // Subscriptions
  const [subs, setSubs] = useState<SubItem[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);

  // ── Fetch profile ──

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/me/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setEditName(data.name || "");
        setEditOrg(data.organization || "");
        setEditCountry(data.country || "");
        setEditPhone(data.phone || "");
      }
    } catch {
      // silently fail
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // ── Fetch saved ──

  const fetchSaved = useCallback(async () => {
    setSavedLoading(true);
    try {
      const res = await fetch("/api/me/saved");
      if (res.ok) {
        const data = await res.json();
        setSavedItems(data.saved || []);
      }
    } catch {
      // silently fail
    } finally {
      setSavedLoading(false);
    }
  }, []);

  // ── Fetch shares ──

  const fetchShares = useCallback(async () => {
    setSharesLoading(true);
    try {
      const res = await fetch("/api/me/shares");
      if (res.ok) {
        const data = await res.json();
        setShares(data.shares || []);
      }
    } catch {
      // silently fail
    } finally {
      setSharesLoading(false);
    }
  }, []);

  // ── Fetch subscriptions ──

  const fetchSubs = useCallback(async () => {
    setSubsLoading(true);
    try {
      const res = await fetch("/api/me/profile");
      if (res.ok) {
        const data = await res.json();
        setSubs(data.subscriptions || []);
      }
    } catch {
      // silently fail
    } finally {
      setSubsLoading(false);
    }
  }, []);

  // Load profile on mount
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetchProfile();
    } else if (sessionStatus === "unauthenticated") {
      setProfileLoading(false);
    }
  }, [sessionStatus, fetchProfile]);

  // Load tab data on tab change
  useEffect(() => {
    if (sessionStatus !== "authenticated") return;
    if (activeTab === "saved") fetchSaved();
    if (activeTab === "shares") fetchShares();
    if (activeTab === "subscription") fetchSubs();
  }, [activeTab, sessionStatus, fetchSaved, fetchShares, fetchSubs]);

  // ── Save profile ──

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          organization: editOrg,
          country: editCountry,
          phone: editPhone,
        }),
      });
      if (res.ok) {
        setSaved(true);
        fetchProfile();
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  // ── Profile picture ──

  // Downscale + center-crop the chosen file to a 256px square JPEG data URL in
  // the browser, so we store a small avatar (no external storage needed).
  const fileToAvatarDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("read failed"));
      reader.onload = () => {
        const img = new window.Image();
        img.onerror = () => reject(new Error("decode failed"));
        img.onload = () => {
          const SIZE = 256;
          const canvas = document.createElement("canvas");
          canvas.width = SIZE;
          canvas.height = SIZE;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("no canvas"));
          const side = Math.min(img.width, img.height);
          const sx = (img.width - side) / 2;
          const sy = (img.height - side) / 2;
          ctx.drawImage(img, sx, sy, side, side, 0, 0, SIZE, SIZE);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });

  const handleAvatarChange = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    setAvatarBusy(true);
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      const res = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      if (res.ok) {
        await fetchProfile();
        await updateSession(); // refresh nav avatar
      }
    } catch {
      // silently fail
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleAvatarRemove = async () => {
    setAvatarBusy(true);
    try {
      const res = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: null }),
      });
      if (res.ok) {
        await fetchProfile();
        await updateSession();
      }
    } catch {
      // silently fail
    } finally {
      setAvatarBusy(false);
    }
  };

  // ── Remove saved item ──

  const handleRemoveSaved = async (reportId: string) => {
    try {
      await fetch(`/api/me/saved/${reportId}`, { method: "DELETE" });
      setSavedItems((prev) => prev.filter((s) => s.report.id !== reportId));
    } catch {
      // silently fail
    }
  };

  // ── Sign out ──

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
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

  // ── Loading state ──

  if (sessionStatus === "loading" || profileLoading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-[#0A2540] animate-spin" />
      </main>
    );
  }

  if (sessionStatus === "unauthenticated" || !profile) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <User className="h-10 w-10 text-[#5A6B7F]/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">
            Please sign in to access your account.
          </p>
        </div>
      </main>
    );
  }

  const LANG_OPTIONS = [
    { value: "en", label: "English" },
    { value: "de", label: "Deutsch" },
    { value: "fr", label: "Français" },
    { value: "it", label: "Italiano" },
  ];

  return (
    <main className="min-h-screen bg-[#F4F6F9]">
      {/* Header */}
      <div className="bg-white border-b border-[#D8DEE6]">
        <div className="mx-auto max-w-5xl px-6 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="heading-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#0A2540]">
                {tr("account.title")}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {profile.email}
                {(profile.effectiveTier || profile.currentTier) && (
                  <Badge
                    variant="outline"
                    className="ml-2 text-[10px] uppercase tracking-wider font-bold"
                  >
                    {(profile.effectiveTier || profile.currentTier)!.name}
                  </Badge>
                )}
                {profile.trialEnd && new Date(profile.trialEnd) > new Date() && (
                  <span className="ml-2 text-xs text-amber-600 font-medium">
                    Trial ends {formatDate(profile.trialEnd)}
                  </span>
                )}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="gap-2 text-xs"
            >
              <LogOut className="h-3.5 w-3.5" />
              {tr("account.signout")}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mx-auto max-w-5xl px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-[#D8DEE6] rounded-sm h-10 p-1">
            <TabsTrigger
              value="profile"
              className="text-xs font-semibold uppercase tracking-wider gap-1.5 data-[state=active]:bg-[#0A2540] data-[state=active]:text-white rounded-sm"
            >
              <User className="h-3.5 w-3.5" />
              {tr("account.profile")}
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              className="text-xs font-semibold uppercase tracking-wider gap-1.5 data-[state=active]:bg-[#0A2540] data-[state=active]:text-white rounded-sm"
            >
              <Bookmark className="h-3.5 w-3.5" />
              {tr("account.saved")}
            </TabsTrigger>
            <TabsTrigger
              value="shares"
              className="text-xs font-semibold uppercase tracking-wider gap-1.5 data-[state=active]:bg-[#0A2540] data-[state=active]:text-white rounded-sm"
            >
              <Share2 className="h-3.5 w-3.5" />
              {tr("account.shares")}
            </TabsTrigger>
            <TabsTrigger
              value="subscription"
              className="text-xs font-semibold uppercase tracking-wider gap-1.5 data-[state=active]:bg-[#0A2540] data-[state=active]:text-white rounded-sm"
            >
              <CreditCard className="h-3.5 w-3.5" />
              {tr("account.subscription")}
            </TabsTrigger>
          </TabsList>

          {/* ── Profile Tab ── */}
          <TabsContent value="profile" className="mt-6">
            <div className="bg-white border border-[#D8DEE6] rounded-sm p-6 sm:p-8 max-w-2xl">
              {/* Profile picture */}
              <div className="flex items-center gap-5 mb-7 pb-7 border-b border-[#EDF0F4]">
                {profile.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.image}
                    alt={profile.name || "Profile"}
                    className="h-20 w-20 rounded-full object-cover border border-[#D8DEE6]"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-[#0A2540] flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {(profile.name || profile.email || "?")[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label
                      className={`inline-flex items-center h-9 px-3 rounded-sm border border-[#D8DEE6] text-sm font-medium cursor-pointer hover:bg-[#F4F6F9] transition-colors ${
                        avatarBusy ? "opacity-60 pointer-events-none" : ""
                      }`}
                    >
                      {avatarBusy ? "Uploading…" : profile.image ? "Change photo" : "Upload photo"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleAvatarChange(e.target.files?.[0] ?? null)}
                      />
                    </label>
                    {profile.image && !avatarBusy && (
                      <button
                        type="button"
                        onClick={handleAvatarRemove}
                        className="h-9 px-3 rounded-sm text-sm font-medium text-[#E8272C] hover:bg-red-50 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-[#5A6B7F]">
                    Square image works best. Auto-resized to 256px.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider">
                    {tr("account.profile.name")}
                  </Label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-10 mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider">
                    {tr("account.profile.email")}
                  </Label>
                  <Input
                    value={profile.email}
                    disabled
                    className="h-10 mt-1.5 bg-[#F4F6F9]"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider">
                    {tr("account.profile.organization")}
                  </Label>
                  <Input
                    value={editOrg}
                    onChange={(e) => setEditOrg(e.target.value)}
                    className="h-10 mt-1.5"
                    placeholder="Organisation"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider">
                    {tr("account.profile.country")}
                  </Label>
                  <Input
                    value={editCountry}
                    onChange={(e) => setEditCountry(e.target.value)}
                    className="h-10 mt-1.5"
                    placeholder="Country"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider">
                    {tr("account.profile.phone")}
                  </Label>
                  <Input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="h-10 mt-1.5"
                    placeholder="+41 ..."
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider">
                    {tr("account.profile.language")}
                  </Label>
                  <div className="flex gap-2 mt-1.5">
                    {LANG_OPTIONS.map((l) => (
                      <button
                        key={l.value}
                        onClick={() => {
                          setProfile((p) => p ? { ...p, languagePref: l.value } : p);
                          localStorage.setItem("src_lang", l.value);
                          window.dispatchEvent(new Event("lang-change"));
                        }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-sm border transition-colors ${
                          profile.languagePref === l.value
                            ? "bg-[#0A2540] text-white border-[#0A2540]"
                            : "border-[#D8DEE6] text-[#5A6B7F] hover:bg-[#F4F6F9]"
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="bg-[#0A2540] hover:bg-[#0A2540]/90 text-white text-xs font-semibold uppercase tracking-wider h-10"
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  ) : saved ? (
                    <Check className="h-3.5 w-3.5 mr-1.5" />
                  ) : null}
                  {saved
                    ? tr("account.profile.saved")
                    : saving
                      ? tr("account.profile.saving")
                      : tr("account.profile.save")}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ── Saved Tab ── */}
          <TabsContent value="saved" className="mt-6">
            <div className="bg-white border border-[#D8DEE6] rounded-sm">
              {savedLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-5 w-5 text-[#5A6B7F] animate-spin" />
                </div>
              ) : savedItems.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <Bookmark className="h-8 w-8 text-[#5A6B7F]/20 mx-auto mb-3" />
                  <p className="text-sm text-[#5A6B7F]">
                    {tr("account.saved.empty")}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#D8DEE6]/60">
                  {savedItems.map((item) => (
                    <div
                      key={item.id}
                      className="px-6 py-4 flex items-start justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <a
                          href={`/reports/${item.report.id}`}
                          className="text-sm font-semibold text-[#0A2540] hover:underline block truncate"
                        >
                          {item.report.title}
                        </a>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] uppercase tracking-wider text-[#5A6B7F] font-semibold">
                          <span>{item.report.type}</span>
                          {item.report.publishedAt && (
                            <span>{formatDate(item.report.publishedAt)}</span>
                          )}
                          <span className="capitalize">{item.report.section.replace(/-/g, " ")}</span>
                        </div>
                        {item.note && (
                          <p className="text-xs text-muted-foreground mt-1.5 italic">
                            {item.note}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-[#5A6B7F] hover:text-[#E8272C] shrink-0"
                        onClick={() => handleRemoveSaved(item.report.id)}
                        title={tr("account.saved.remove")}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Shares Tab ── */}
          <TabsContent value="shares" className="mt-6">
            <div className="bg-white border border-[#D8DEE6] rounded-sm">
              {sharesLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-5 w-5 text-[#5A6B7F] animate-spin" />
                </div>
              ) : shares.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <Share2 className="h-8 w-8 text-[#5A6B7F]/20 mx-auto mb-3" />
                  <p className="text-sm text-[#5A6B7F]">
                    {tr("account.shares.empty")}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F8F9FA] hover:bg-[#F8F9FA]">
                      <TableHead className="text-[10px] uppercase tracking-wider font-bold text-[#5A6B7F]">
                        {tr("account.shares.report")}
                      </TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider font-bold text-[#5A6B7F]">
                        {tr("account.shares.channel")}
                      </TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider font-bold text-[#5A6B7F]">
                        {tr("account.shares.clicks")}
                      </TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider font-bold text-[#5A6B7F]">
                        {tr("account.shares.date")}
                      </TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shares.map((share) => (
                      <TableRow key={share.id} className="border-b border-[#D8DEE6]/60">
                        <TableCell className="py-3">
                          <span className="text-sm font-medium text-[#0A2540] truncate block max-w-[300px]">
                            {share.report.title}
                          </span>
                        </TableCell>
                        <TableCell className="py-3">
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold">
                            {share.shareChannel}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 text-sm text-[#5A6B7F]">
                          {share.clicks}
                        </TableCell>
                        <TableCell className="py-3 text-xs text-[#5A6B7F]">
                          {formatDate(share.createdAt)}
                        </TableCell>
                        <TableCell className="py-3">
                          <a
                            href={share.shareUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#5A6B7F] hover:text-[#0A2540]"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* ── Subscription Tab ── */}
          <TabsContent value="subscription" className="mt-6">
            <div className="bg-white border border-[#D8DEE6] rounded-sm p-6 sm:p-8 max-w-2xl">
              {subsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 text-[#5A6B7F] animate-spin" />
                </div>
              ) : subs.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-8 w-8 text-[#5A6B7F]/20 mx-auto mb-3" />
                  <p className="text-sm text-[#5A6B7F]">
                    {tr("account.subscription.no-sub")}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {subs.map((sub) => (
                    <div
                      key={sub.id}
                      className="border border-[#D8DEE6] rounded-sm p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-[#0A2540]">
                          {tr("account.subscription.tier")}: {sub.tier.name}
                        </span>
                        <Badge
                          variant={sub.status === "active" ? "default" : "outline"}
                          className={
                            sub.status === "active"
                              ? "bg-green-100 text-green-800 border-green-300 text-[10px] uppercase tracking-wider font-bold"
                              : "text-[10px] uppercase tracking-wider font-bold"
                          }
                        >
                          {sub.status === "active"
                            ? tr("account.subscription.active")
                            : tr("account.subscription.inactive")}
                        </Badge>
                      </div>
                      <dl className="grid grid-cols-2 gap-2 text-xs text-[#5A6B7F]">
                        <div>
                          <dt className="font-semibold uppercase tracking-wider text-[10px]">
                            {tr("account.subscription.period")}
                          </dt>
                          <dd>
                            {formatDate(sub.currentPeriodStart)} → {formatDate(sub.currentPeriodEnd)}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-semibold uppercase tracking-wider text-[10px]">
                            {tr("account.subscription.amount")}
                          </dt>
                          <dd>
                            {sub.amountChf} CHF / {sub.billingInterval}
                          </dd>
                        </div>
                        {sub.cancelAtPeriodEnd && (
                          <div className="col-span-2 text-xs text-[#E8272C] font-medium">
                            {tr("account.subscription.cancel-at-end")}
                          </div>
                        )}
                      </dl>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}