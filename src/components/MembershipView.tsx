"use client";

import { useState } from "react";
import {
  Star, Crown, ArrowRight, Check, Lock, BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/AuthDialog";
import { useLang } from "@/components/LangProvider";
import { useNavigation } from "@/components/NavigationProvider";

/* ── Billing toggle ── */
type BillingCycle = "monthly" | "annual";

/* ── Feature key mapping ── */
const FEAT_KEYS: string[] = [
  "opinions", "exec-summaries", "newsletter", "standard-reports",
  "daily-brief", "pdf", "archive", "video", "early", "forecasts",
  "studies", "live-calls", "breaking", "summit", "bespoke", "account-director",
];

/* ── Feature access matrix ── */
const FEAT_ACCESS: Record<string, { essential: boolean; premium: boolean; expert: boolean }> = {
  "opinions":         { essential: true,  premium: true,  expert: true  },
  "exec-summaries":   { essential: true,  premium: true,  expert: true  },
  "newsletter":       { essential: true,  premium: true,  expert: true  },
  "standard-reports": { essential: true,  premium: true,  expert: true  },
  "daily-brief":      { essential: false, premium: true,  expert: true  },
  "pdf":              { essential: false, premium: true,  expert: true  },
  "archive":          { essential: false, premium: true,  expert: true  },
  "video":            { essential: false, premium: true,  expert: true  },
  "early":            { essential: false, premium: true,  expert: true  },
  "forecasts":        { essential: false, premium: true,  expert: true  },
  "studies":          { essential: false, premium: true,  expert: true  },
  "live-calls":       { essential: false, premium: false, expert: true  },
  "breaking":         { essential: false, premium: false, expert: true  },
  "summit":           { essential: false, premium: false, expert: true  },
  "bespoke":          { essential: false, premium: false, expert: true  },
  "account-director": { essential: false, premium: false, expert: true  },
};

/* ── Mock studies ── */
const MOCK_STUDIES = [
  {
    id: "s1",
    title: "European Energy Security Architecture 2030–2040",
    topics: ["Energy & Resources", "Geopolitics & Hard Security"],
    wordCount: "~8,200 words",
    date: "2026-05",
    status: "Published",
  },
  {
    id: "s2",
    title: "AI-Powered Disinformation: Threat Vectors for D-A-CH Democracies",
    topics: ["Digital Power & AI", "Society, Migration & Institutions"],
    wordCount: "~6,400 words",
    date: "2026-04",
    status: "Published",
  },
  {
    id: "s3",
    title: "Critical Supply Chain Resilience in Central Europe",
    topics: ["Economy & Competitiveness", "Energy & Resources"],
    wordCount: "~7,100 words",
    date: "2026-03",
    status: "Published",
  },
  {
    id: "s4",
    title: "Climate Migration and Border Infrastructure Stress Testing",
    topics: ["Climate, Environment & Food", "Society, Migration & Institutions"],
    wordCount: "~5,800 words",
    date: "2026-06",
    status: "In Progress",
  },
];

export function MembershipView() {
  const { t: tr } = useLang();
  const { navigate } = useNavigation();
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [authOpen, setAuthOpen] = useState(false);

  const isAnnual = billing === "annual";
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  // Start Stripe checkout for a tier. If the user isn't signed in, the
  // create endpoint returns 401 → open the auth dialog so they can register/
  // log in, then click again.
  async function startCheckout(tierSlug: string) {
    setLoadingTier(tierSlug);
    try {
      const res = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierSlug, interval: isAnnual ? "year" : "month" }),
      });
      if (res.status === 401) {
        setAuthOpen(true);
        setLoadingTier(null);
        return;
      }
      const data = await res.json();
      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setLoadingTier(null);
      }
    } catch {
      setLoadingTier(null);
    }
  }

  return (
    <div>
      {/* ═══════ HEADER BAR ═══════ */}
      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top stats strip */}
          <div className="flex items-center justify-center gap-6 sm:gap-12 lg:gap-16 py-8 sm:py-10">
            {[
              { value: "v3.stat1.value", label: "v3.stat1.label" },
              { value: "v3.stat2.value", label: "v3.stat2.label" },
              { value: "v3.stat3.value", label: "v3.stat3.label" },
            ].map((stat, i) => (
              <div key={stat.label} className="contents">
                <div className="text-center min-w-0 flex-1">
                  <div className="text-2xl sm:text-3xl font-bold text-primary-foreground tracking-tight">
                    {tr(`membership.${stat.value}`)}
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold tracking-[0.12em] sm:tracking-[0.15em] uppercase text-white/40 mt-1 truncate">
                    {tr(`membership.${stat.label}`)}
                  </div>
                </div>
                {i < 2 && <div className="w-px h-10 bg-white/10 flex-shrink-0" />}
              </div>
            ))}
          </div>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 pb-8">
            <span
              className={`text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                !isAnnual ? "text-primary-foreground" : "text-white/40"
              }`}
            >
              {tr("membership.toggle.monthly")}
            </span>
            <button
              onClick={() => setBilling(isAnnual ? "monthly" : "annual")}
              className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
              style={{ backgroundColor: isAnnual ? "#E8272C" : "rgba(255,255,255,0.2)" }}
              aria-label="Toggle annual billing"
            >
              <span
                className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm"
                style={{ transform: isAnnual ? "translateX(20px)" : "translateX(0)" }}
              />
            </button>
            <span
              className={`text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                isAnnual ? "text-primary-foreground" : "text-white/40"
              }`}
            >
              {tr("membership.toggle.annual")}
            </span>
            {isAnnual && (
              <span className="text-[10px] font-bold tracking-wider uppercase bg-[#E8272C] text-white px-2 py-0.5 rounded-sm ml-1 whitespace-nowrap">
                {tr("membership.v3.save-badge")}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ═══════ PRICING CARDS ═══════ */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 overflow-visible">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-0 overflow-visible">

          {/* ── ESSENTIAL ── */}
          <div className="border border-border p-6 lg:p-8 flex flex-col">
            <div className="mb-6">
              <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground mb-1">
                {tr("membership.v3.essential")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {tr("membership.v3.essential.desc")}
              </p>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="heading-serif text-3xl sm:text-4xl font-bold text-primary">
                  CHF {isAnnual ? "24" : "29"}
                </span>
                <span className="text-sm text-muted-foreground">
                  {tr("membership.v3.per-month")}
                </span>
              </div>
              {isAnnual && (
                <p className="text-xs text-muted-foreground mt-1">
                  CHF 290/{tr("membership.v3.young.per-year").replace("/", "")} &middot; {tr("membership.v3.billed-annual")}
                </p>
              )}
            </div>

            <Button
              variant="outline"
              className="w-full mb-8 text-sm"
              onClick={() => startCheckout("essential")}
              disabled={loadingTier === "essential"}
            >
              {loadingTier === "essential" ? "…" : tr("membership.v3.start-trial")}
            </Button>

            <ul className="space-y-3 flex-1">
              {FEAT_KEYS.filter((k) => FEAT_ACCESS[k]?.essential).map((k) => (
                <li key={k} className="flex items-start gap-2.5 text-sm">
                  <Check className="w-4 h-4 text-[#E8272C] mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{tr(`membership.v3.feat.${k}`)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── PREMIUM ── */}
          <div className="relative border-2 border-[#E8272C] bg-primary text-primary-foreground p-6 lg:p-8 flex flex-col md:-my-5 lg:shadow-xl z-10">
            {/* Badge */}
            <div className="absolute -top-3.5 left-6 flex items-center gap-1.5 bg-[#E8272C] text-white text-[10px] font-bold tracking-[0.12em] uppercase px-3 py-1 rounded-sm z-20">
              <Star className="w-3 h-3" />
              {tr("membership.v3.most-popular")}
            </div>

            <div className="mb-6 mt-2">
              <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-white/50 mb-1">
                {tr("membership.v3.premium")}
              </h3>
              <p className="text-sm text-white/60 leading-relaxed">
                {tr("membership.v3.premium.desc")}
              </p>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="heading-serif text-3xl sm:text-4xl font-bold text-white">
                  CHF {isAnnual ? "66" : "79"}
                </span>
                <span className="text-sm text-white/50">
                  {tr("membership.v3.per-month")}
                </span>
              </div>
              {isAnnual && (
                <p className="text-xs text-white/40 mt-1">
                  CHF 790/{tr("membership.v3.young.per-year").replace("/", "")} &middot; {tr("membership.v3.billed-annual")}
                </p>
              )}
            </div>

            <Button className="w-full mb-8 bg-[#E8272C] hover:bg-[#d02025] text-white text-sm" onClick={() => startCheckout("professional")} disabled={loadingTier === "professional"}>
              {loadingTier === "professional" ? "…" : tr("membership.v3.get-started")}
            </Button>

            <ul className="space-y-3 flex-1">
              {FEAT_KEYS.filter((k) => FEAT_ACCESS[k]?.premium).map((k) => (
                <li key={k} className="flex items-start gap-2.5 text-sm">
                  <Check className="w-4 h-4 text-[#E8272C] mt-0.5 flex-shrink-0" />
                  <span className="text-white/70">{tr(`membership.v3.feat.${k}`)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── EXPERT / CUSTOM ── */}
          <div className="border border-border p-6 lg:p-8 flex flex-col">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground">
                  {tr("membership.v3.expert")}
                </h3>
                <Crown className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {tr("membership.v3.expert.desc")}
              </p>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="heading-serif text-3xl sm:text-4xl font-bold text-primary">
                  CHF {isAnnual ? "124" : "149"}
                </span>
                <span className="text-sm text-muted-foreground">
                  {tr("membership.v3.per-month")}
                </span>
              </div>
              {isAnnual && (
                <p className="text-xs text-muted-foreground mt-1">
                  CHF 1490/{tr("membership.v3.young.per-year").replace("/", "")} &middot; {tr("membership.v3.billed-annual")}
                </p>
              )}
            </div>

            <Button
              variant="outline"
              className="w-full mb-8 text-sm"
              onClick={() => startCheckout("executive")}
              disabled={loadingTier === "executive"}
            >
              {loadingTier === "executive" ? "…" : tr("membership.v3.get-started")}
            </Button>

            <ul className="space-y-3 flex-1">
              {FEAT_KEYS.filter((k) => FEAT_ACCESS[k]?.expert).map((k) => (
                <li key={k} className="flex items-start gap-2.5 text-sm">
                  {k === "bespoke" || k === "account-director" ? (
                    <Star className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Check className="w-4 h-4 text-[#E8272C] mt-0.5 flex-shrink-0" />
                  )}
                  <span className="text-muted-foreground">{tr(`membership.v3.feat.${k}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ═══════ STUDIES SECTION ═══════ */}
      <section className="border-t border-border bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-[#E8272C]" />
                <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#E8272C]">
                  {tr("membership.v3.studies.tag")}
                </span>
              </div>
              <h2 className="heading-serif text-2xl sm:text-3xl font-bold text-primary mb-2">
                {tr("membership.v3.studies.heading")}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {tr("membership.v3.studies.desc")}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] font-bold tracking-[0.1em] uppercase bg-[#E8272C] text-white px-2.5 py-1 rounded-sm">
                {tr("membership.v3.premium")}
              </span>
              <span className="text-muted-foreground text-xs">+</span>
              <span className="text-[10px] font-bold tracking-[0.1em] uppercase bg-primary text-white px-2.5 py-1 rounded-sm flex items-center gap-1">
                <Crown className="w-3 h-3" />
                {tr("membership.v3.expert")}
              </span>
            </div>
          </div>

          {/* Studies list */}
          <div className="space-y-4">
            {MOCK_STUDIES.map((study) => (
              <article
                key={study.id}
                className="group border border-border bg-white p-5 sm:p-6 hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold tracking-[0.08em] uppercase px-2 py-0.5 rounded-sm ${
                        study.status === "Published"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}>
                        {study.status}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{study.date}</span>
                      <span className="text-[10px] text-muted-foreground">{study.wordCount}</span>
                    </div>

                    <h3 className="font-semibold text-base text-primary group-hover:text-[#E8272C] transition-colors leading-snug mb-2">
                      {study.title}
                    </h3>

                    <div className="flex flex-wrap gap-1.5">
                      {study.topics.map((topic) => (
                        <span
                          key={topic}
                          className="text-[10px] font-medium bg-secondary text-muted-foreground px-2 py-0.5 rounded-sm"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 sm:ml-auto sm:pt-1">
                    {study.status === "Published" ? (
                      <>
                        <span className="text-xs text-muted-foreground hidden sm:block">{tr("membership.v3.studies.read")}</span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-[#E8272C] transition-colors" />
                      </>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-amber-600">
                        <Lock className="w-3.5 h-3.5" />
                        <span className="hidden sm:block">{tr("membership.v3.studies.coming-soon")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Studies access note */}
          <div className="mt-8 bg-primary/5 border border-border p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-primary mb-1">
                {tr("membership.v3.studies.access-title")}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {tr("membership.v3.studies.access-desc")}
              </p>
            </div>
            <Button className="bg-[#E8272C] hover:bg-[#d02025] text-white text-sm flex-shrink-0 gap-2" onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}>
              {tr("membership.v3.studies.view-plans")} <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════ FEATURE COMPARISON TABLE ═══════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="text-center mb-10">
          <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#E8272C] mb-2 block">
            {tr("membership.v3.compare.tag")}
          </span>
          <h2 className="heading-serif text-2xl sm:text-3xl font-bold text-primary">
            {tr("membership.v3.compare.heading")}
          </h2>
        </div>

        <div className="border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary">
                <th className="text-left py-3 px-4 text-xs font-bold tracking-[0.08em] uppercase text-muted-foreground w-[45%]">
                  {tr("membership.v3.compare.feature")}
                </th>
                <th className="text-center py-3 px-4 text-xs font-bold tracking-[0.08em] uppercase text-muted-foreground w-[18.3%]">
                  {tr("membership.v3.essential")}
                </th>
                <th className="text-center py-3 px-4 text-xs font-bold tracking-[0.08em] uppercase text-[#E8272C] w-[18.3%]">
                  {tr("membership.v3.premium")}
                </th>
                <th className="text-center py-3 px-4 text-xs font-bold tracking-[0.08em] uppercase text-muted-foreground w-[18.3%]">
                  {tr("membership.v3.expert")}
                </th>
              </tr>
            </thead>
            <tbody>
              {FEAT_KEYS.map((k, i) => (
                <tr
                  key={k}
                  className={i % 2 === 0 ? "bg-white" : "bg-secondary/30"}
                >
                  <td className="py-3 px-4 text-muted-foreground">{tr(`membership.v3.feat.${k}`)}</td>
                  {(["essential", "premium", "expert"] as const).map((tier) => (
                    <td key={tier} className="py-3 px-4 text-center">
                      {FEAT_ACCESS[k]?.[tier] ? (
                        <Check className="w-4 h-4 text-[#E8272C] mx-auto" />
                      ) : (
                        <span className="text-muted-foreground/30">&mdash;</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>


      {/* ═══════ CTA STRIP ═══════ */}
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="max-w-md">
              <h2 className="heading-serif text-xl sm:text-2xl font-bold mb-2">
                {tr("membership.v3.cta.heading")}
              </h2>
              <p className="text-sm text-white/50 leading-relaxed">
                {tr("membership.v3.cta.desc")}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                className="bg-[#E8272C] hover:bg-[#d02025] text-white gap-2"
                onClick={() => navigate("contact")}
              >
                {tr("membership.v3.contact-us")} <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="border-white/20 text-[#0A2540] bg-white hover:bg-white/90 hover:text-[#0A2540]"
                onClick={() => setAuthOpen(true)}
              >
                {tr("membership.v3.start-trial")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Dialog for trial / premium sign-up */}
      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        defaultMode="register"
      />
    </div>
  );
}