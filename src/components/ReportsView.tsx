"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  BrainCircuit, Swords, Zap, Leaf, TrendingUp, Scale,
  ArrowRight, Lock, Search, Filter, UserPlus, LogIn,
  ShieldCheck, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuickSaveButton } from "@/components/ContentActions";
import { useLang } from "./LangProvider";

interface Member { id: string; name: string; }
type GateState = "register" | "welcome" | "login" | "access";

const FOCUS_KEYS = [
  { icon: BrainCircuit, labelKey: "focus.digital", slug: "digital-power-ai" },
  { icon: Swords, labelKey: "focus.geopolitics", slug: "geopolitics-hard-security" },
  { icon: Zap, labelKey: "focus.energy", slug: "energy-resources" },
  { icon: Leaf, labelKey: "focus.climate", slug: "climate-environment-food" },
  { icon: TrendingUp, labelKey: "focus.economy", slug: "economy-competitiveness" },
  { icon: Scale, labelKey: "focus.society", slug: "society-migration-institutions" },
];

const MOCK_REPORTS = [
  { id: "1", sectionKey: "focus.digital", date: "2026-06-18", type: "Analysis", title: "AI Governance Frameworks for Critical Infrastructure: A D-A-CH Comparative Analysis", language: "en" },
  { id: "2", sectionKey: "focus.energy", date: "2026-06-12", type: "Report", title: "SMR Deployment Roadmap: Central Europe\u2019s Nuclear Renaissance", language: "en" },
  { id: "3", sectionKey: "focus.geopolitics", date: "2026-06-05", type: "Intelligence Brief", title: "Hybrid Threat Landscape Q2 2026: D-A-CH Threat Assessment", language: "en" },
  { id: "4", sectionKey: "focus.digital", date: "2026-05-28", type: "Technical Report", title: "Cyber-Physical Attack Vectors on Swiss Power Grids", language: "en" },
  { id: "5", sectionKey: "focus.energy", date: "2026-05-20", type: "Analysis", title: "LNG Terminal Security: Baltic Sea Supply Chain Risk Assessment", language: "en" },
  { id: "6", sectionKey: "focus.society", date: "2026-05-15", type: "Report", title: "Migration Pressure Points: Eastern Border Infrastructure Stress Test", language: "en" },
  { id: "7", sectionKey: "focus.geopolitics", date: "2026-05-10", type: "Policy Brief", title: "EU Defence Industrial Strategy: Implications for Austrian Procurement", language: "en" },
  { id: "8", sectionKey: "focus.climate", date: "2026-05-05", type: "Analysis", title: "Food Supply Chain Resilience Under Climate Stress Scenarios", language: "en" },
  { id: "9", sectionKey: "focus.economy", date: "2026-04-28", type: "Report", title: "Economic Coercion Playbook: How Authoritarian States Target D-A-CH Economies", language: "en" },
];

function WelcomeMessage({ onContinue }: { onContinue: () => void }) {
  const { t: tr } = useLang();
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-lg w-full mx-4">
        <div className="border border-border p-8 sm:p-10 text-center">
          <div className="w-14 h-14 bg-[#E8272C]/10 text-[#E8272C] rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="heading-serif text-2xl font-bold text-primary mb-4">{tr("welcome.title")}</h2>
          <div className="bg-secondary/50 border border-border p-5 mb-6 text-left">
            <p className="text-sm text-primary leading-relaxed">{tr("welcome.message")}</p>
          </div>
          <Button className="w-full h-10 bg-primary hover:bg-primary/90 text-sm font-medium" onClick={onContinue}>
            {tr("welcome.cta")} <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function RegisterForm({ onRegistered }: { onRegistered: (member: Member) => void }) {
  const { t: tr } = useLang();
  const [form, setForm] = useState({ name: "", address: "", email: "", profession: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!form.name.trim() || !form.address.trim() || !form.email.trim() || !form.profession.trim()) {
      setError(tr("reports.error.fields-required")); return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/members/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || tr("reports.error.registration-failed")); return; }
      localStorage.setItem("src_member", JSON.stringify({ id: data.member.id, name: data.member.name }));
      onRegistered(data.member);
    } catch { setError(tr("reports.error.network")); } finally { setLoading(false); }
  };

  const fields = [
    { key: "name" as const, labelKey: "reports.gate.name", phKey: "reports.gate.name.placeholder", type: "text" },
    { key: "address" as const, labelKey: "reports.gate.address", phKey: "reports.gate.address.placeholder", type: "text" },
    { key: "email" as const, labelKey: "reports.gate.email", phKey: "reports.gate.email.placeholder", type: "email" },
    { key: "profession" as const, labelKey: "reports.gate.profession", phKey: "reports.gate.profession.placeholder", type: "text" },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="border border-border p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4"><UserPlus className="w-6 h-6" /></div>
            <h1 className="heading-serif text-2xl font-bold text-primary mb-2">{tr("reports.gate.title")}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">{tr("reports.gate.subtitle")}</p>
          </div>
          <div className="space-y-4 mb-6">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">{tr(f.labelKey)}</label>
                <Input type={f.type} placeholder={tr(f.phKey)} className="h-10 text-sm" value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
              </div>
            ))}
          </div>
          {error && <p className="text-xs text-[#E8272C] mb-3">{error}</p>}
          <Button className="w-full h-10 bg-primary hover:bg-primary/90 text-sm font-medium" onClick={submit} disabled={loading}>
            {loading ? tr("reports.gate.submitting") : tr("reports.gate.submit")}
          </Button>
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-background px-3 text-muted-foreground">{tr("reports.error.or")}</span></div>
          </div>
          <p className="text-xs text-center text-muted-foreground mb-3">{tr("reports.gate.returning")}</p>
          <button onClick={() => { const s = localStorage.getItem("src_member"); if (s) { try { onRegistered(JSON.parse(s)); return; } catch {} } window.dispatchEvent(new CustomEvent("src:show-login")); }} className="block w-full text-center text-sm font-medium text-[#E8272C] hover:underline">
            {tr("reports.gate.returning-btn")}
          </button>
          <p className="text-[10px] text-center text-muted-foreground mt-5 leading-relaxed">{tr("reports.gate.disclaimer")}</p>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onAccess }: { onAccess: (member: Member) => void }) {
  const { t: tr } = useLang();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!name.trim()) { setError(" "); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/members/access", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim() }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || " "); return; }
      if (data.members.length === 1) { localStorage.setItem("src_member", JSON.stringify(data.members[0])); onAccess(data.members[0]); }
      else { setError(tr("reports.error.multiple-members")); }
    } catch { setError(tr("reports.error.network")); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="border border-border p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4"><LogIn className="w-6 h-6" /></div>
            <h1 className="heading-serif text-2xl font-bold text-primary mb-2">{tr("login.title")}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">{tr("login.subtitle")}</p>
          </div>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">{tr("login.name")}</label>
              <Input placeholder={tr("login.name.placeholder")} className="h-10 text-sm" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
            </div>
          </div>
          {error && <p className="text-xs text-[#E8272C] mb-3">{error}</p>}
          <Button className="w-full h-10 bg-primary hover:bg-primary/90 text-sm font-medium" onClick={submit} disabled={loading}>
            {loading ? tr("login.submitting") : tr("login.submit")}
          </Button>
          <button onClick={() => window.dispatchEvent(new CustomEvent("src:show-register"))} className="block w-full text-center text-sm font-medium text-muted-foreground hover:text-primary mt-4">
            {tr("login.new-here")}
          </button>
        </div>
      </div>
    </div>
  );
}

const SECTION_TO_FOCUS_KEY: Record<string, string> = {
  "digital-power-ai": "focus.digital",
  "geopolitics-hard-security": "focus.geopolitics",
  "energy-resources": "focus.energy",
  "climate-environment-food": "focus.climate",
  "economy-competitiveness": "focus.economy",
  "society-migration-institutions": "focus.society",
};

interface ApiReport {
  id: string;
  title: string;
  summary: string | null;
  type: string;
  section: string;
  status: string;
  language: string;
  sourceRef: string | null;
  author: string | null;
  publishedAt: string | null;
  createdAt: string;
}

export function ReportsView() {
  const { lang, t: tr } = useLang();
  const { data: session } = useSession() ?? {};
  // Report list is public: everyone sees the teaser list. Full content is
  // gated per-report by tier at the detail page (canAccessContent), not by a
  // lead-capture wall. (Default "access" = no register gate.)
  const [gate, setGate] = useState<GateState>("access");
  const [member, setMember] = useState<Member | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [apiReports, setApiReports] = useState<ApiReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Fetch reports for the selected language, falling back to English
  useEffect(() => {
    let cancelled = false;
    const fetchReports = async (language: string) => {
      setLoadingReports(true);
      try {
        const res = await fetch(`/api/reports?lang=${language}&limit=100`);
        const data = await res.json();
        if (!cancelled) {
          const reports = data.reports || [];
          if (reports.length > 0 || language === "en") {
            setApiReports(reports);
          } else {
            // Fall back to English if no reports in selected language
            const enRes = await fetch(`/api/reports?lang=en&limit=100`);
            const enData = await enRes.json();
            if (!cancelled) setApiReports(enData.reports || []);
          }
        }
      } catch {
        if (!cancelled) setApiReports([]);
      } finally {
        if (!cancelled) setLoadingReports(false);
      }
    };
    fetchReports(lang);
    return () => { cancelled = true; };
  }, [lang]);

  useEffect(() => {
    const saved = localStorage.getItem("src_member");
    if (saved) { try { const m = JSON.parse(saved); setMember(m); setGate("access"); } catch {} }
  }, []);

  // A logged-in account (invited member, subscriber, admin) is already a real
  // member — bypass the lead-capture register/access gate and show reports.
  // The lead-capture gate remains only for anonymous visitors.
  useEffect(() => {
    if (session?.user) {
      const u = session.user as { email?: string | null; name?: string | null };
      setMember({ id: u.email || "account", name: u.name || u.email || "Member" });
      setGate("access");
    }
  }, [session]);

  useEffect(() => {
    const showLogin = () => setGate("login");
    const showRegister = () => setGate("register");
    window.addEventListener("src:show-login", showLogin);
    window.addEventListener("src:show-register", showRegister);
    return () => { window.removeEventListener("src:show-login", showLogin); window.removeEventListener("src:show-register", showRegister); };
  }, []);

  const handleRegistered = useCallback((m: Member) => { setMember(m); setGate("welcome"); }, []);
  const handleContinue = useCallback(() => { setGate("access"); }, []);

  if (gate === "welcome") return <WelcomeMessage onContinue={handleContinue} />;
  if (gate === "login") return <LoginForm onAccess={(m) => { setMember(m); setGate("access"); }} />;
  if (gate === "register") return <RegisterForm onRegistered={handleRegistered} />;

  // Use API reports if available, otherwise fall back to mock data
  const hasApiReports = apiReports.length > 0;
  const reports = hasApiReports
    ? apiReports.map((r) => ({
        id: r.id,
        sectionKey: SECTION_TO_FOCUS_KEY[r.section] || r.section,
        date: r.publishedAt ? new Date(r.publishedAt).toISOString().split("T")[0] : new Date(r.createdAt).toISOString().split("T")[0],
        type: r.type,
        title: r.title,
        language: r.language,
      }))
    : MOCK_REPORTS;

  const q = searchQuery.trim().toLowerCase();
  const filtered = reports.filter((r) => {
    if (activeFilter && FOCUS_KEYS.find((fa) => fa.slug === activeFilter)?.labelKey !== r.sectionKey) return false;
    if (q && !r.title.toLowerCase().includes(q) && !r.type.toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#E8272C] mb-2 block">{tr("nav.reports")}</span>
          <h1 className="heading-serif text-2xl sm:text-3xl font-bold text-primary">{tr("reports.heading")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} {tr("reports.count")}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={tr("reports.search")}
              className="pl-9 h-9 w-48 sm:w-64 text-base sm:text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs"><Filter className="w-3.5 h-3.5" />{tr("reports.filters")}</Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-8">
        <button onClick={() => setActiveFilter(null)} className={`px-3 py-1.5 text-[11px] font-medium rounded-sm border transition-colors ${!activeFilter ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/30 hover:text-primary"}`}>
          {tr("reports.all-sections")}
        </button>
        {FOCUS_KEYS.map((area) => (
          <button key={area.slug} onClick={() => setActiveFilter(activeFilter === area.slug ? null : area.slug)} className={`px-3 py-1.5 text-[11px] font-medium rounded-sm border transition-colors flex items-center gap-1.5 ${activeFilter === area.slug ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/30 hover:text-primary"}`}>
            <area.icon className="w-3 h-3" />{tr(area.labelKey)}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {loadingReports && (
          <div className="text-center py-12 text-sm text-muted-foreground">Loading reports…</div>
        )}
        {!loadingReports && filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-muted-foreground">No reports found.</div>
        )}
        {!loadingReports && filtered.map((report) => {
          const isApiReport = hasApiReports;
          const content = (
            <article className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 p-4 border border-border hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold tracking-[0.08em] uppercase bg-secondary px-2 py-0.5 rounded-sm text-muted-foreground flex-shrink-0">{report.type}</span>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">{report.date}</span>
                  {hasApiReports && report.language !== lang && (
                    <span className="text-[9px] font-bold uppercase bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-sm flex-shrink-0">
                      {report.language}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-sm text-primary group-hover:text-[#E8272C] transition-colors leading-snug">{report.title}</h3>
                <span className="text-[10px] text-muted-foreground mt-1 block">{tr(report.sectionKey)}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 sm:ml-auto">
                {isApiReport && <QuickSaveButton reportId={report.id} />}
                <span className="text-xs text-muted-foreground hidden sm:block">{tr("reports.read")}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-[#E8272C] transition-colors" />
              </div>
            </article>
          );
          return isApiReport ? (
            <Link key={report.id} href={`/reports/${report.id}`}>{content}</Link>
          ) : (
            <div key={report.id}>{content}</div>
          );
        })}
      </div>
      {member && (
        <div className="mt-10 bg-secondary/50 border border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">{tr("reports.signed-in")} <span className="font-medium text-primary">{member.name}</span></span>
          </div>
          <button onClick={() => { localStorage.removeItem("src_member"); setMember(null); setGate("register"); }} className="text-xs text-muted-foreground hover:text-[#E8272C] transition-colors">
            {tr("reports.sign-out")}
          </button>
        </div>
      )}
    </div>
  );
}