"use client";

import { useState } from "react";
import {
  Check, ArrowRight, Shield, BrainCircuit, Eye, Zap, Users,
  ChevronDown, Minus, Radio, Lock, FileText, Video,
  Building2, Star, Quote, Crown, Sparkles, ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SwissCrossMark } from "./SwissCrossLogo";
import { useLang } from "./LangProvider";
import { useNavigation } from "./NavigationProvider";

/* ═══════════════════════════════════════════════════════
   DATA LAYER
   ═══════════════════════════════════════════════════════ */

type TierKey = "free" | "basic" | "premium" | "expert";

interface FeatureRow {
  key: string;
  group: "content" | "events" | "delivery" | "support";
  access: [boolean, boolean, boolean, boolean];
}

const FEATURES: FeatureRow[] = [
  { key: "opinions",           group: "content",  access: [true,  true,  true,  true]  },
  { key: "reports-summary",   group: "content",  access: [true,  true,  true,  true]  },
  { key: "reports-basic",     group: "content",  access: [false, true,  true,  true]  },
  { key: "reports-strategy",  group: "content",  access: [false, true,  true,  true]  },
  { key: "video",             group: "content",  access: [false, true,  true,  true]  },
  { key: "interviews",        group: "content",  access: [false, false, true,  true]  },
  { key: "briefings",         group: "content",  access: [false, false, true,  true]  },
  { key: "early",             group: "content",  access: [false, false, true,  true]  },
  { key: "breaking",          group: "content",  access: [false, false, true,  true]  },
  { key: "archive",           group: "content",  access: [false, true,  true,  true]  },
  { key: "pdf",               group: "content",  access: [false, true,  true,  true]  },
  { key: "events-public",     group: "events",   access: [true,  true,  true,  true]  },
  { key: "events-priority",   group: "events",   access: [false, true,  true,  true]  },
  { key: "events-briefing",   group: "events",   access: [false, false, true,  true]  },
  { key: "events-live",       group: "events",   access: [false, false, false, true]  },
  { key: "events-qa",         group: "events",   access: [false, false, false, true]  },
  { key: "events-1to1",       group: "events",   access: [false, false, false, true]  },
  { key: "newsletter",        group: "delivery", access: [true,  true,  true,  true]  },
  { key: "section-news",      group: "delivery", access: [false, true,  true,  true]  },
  { key: "push",              group: "delivery", access: [false, false, true,  true]  },
  { key: "risk",              group: "delivery", access: [false, false, true,  true]  },
  { key: "topic-request",     group: "delivery", access: [false, false, false, true]  },
  { key: "support-email",     group: "support",  access: [true,  true,  true,  true]  },
  { key: "support-manager",   group: "support",  access: [false, false, false, true]  },
  { key: "support-invoice",   group: "support",  access: [false, false, false, true]  },
];

const GROUPS: { group: FeatureRow["group"]; icon: typeof Shield }[] = [
  { group: "content",  icon: FileText },
  { group: "events",   icon: Users },
  { group: "delivery", icon: Radio },
  { group: "support",  icon: Shield },
];

const TOP_FEATURES: { tierKey: TierKey; featKeys: string[] }[] = [
  { tierKey: "free",    featKeys: ["opinions", "reports-summary", "events-public", "newsletter", "support-email"] },
  { tierKey: "basic",   featKeys: ["reports-basic", "reports-strategy", "video", "archive", "pdf", "section-news"] },
  { tierKey: "premium", featKeys: ["interviews", "briefings", "early", "breaking", "push", "risk", "events-briefing"] },
  { tierKey: "expert",  featKeys: ["events-live", "events-qa", "events-1to1", "topic-request", "support-manager", "support-invoice"] },
];

const JOURNEY_STEPS: { icon: typeof Eye; numKey: "s1" | "s2" | "s3" | "s4"; tierKey: TierKey }[] = [
  { icon: Eye,  numKey: "s1", tierKey: "free" },
  { icon: FileText, numKey: "s2", tierKey: "basic" },
  { icon: Zap,  numKey: "s3", tierKey: "premium" },
  { icon: BrainCircuit, numKey: "s4", tierKey: "expert" },
];

const FAQ_ITEMS = ["q1", "q2", "q3", "q4", "q5"] as const;

const TESTIMONIALS = [
  { quoteKey: "t1.quote", roleKey: "t1.role", orgKey: "t1.org", tierKey: "premium" as TierKey },
  { quoteKey: "t2.quote", roleKey: "t2.role", orgKey: "t2.org", tierKey: "expert" as TierKey },
  { quoteKey: "t3.quote", roleKey: "t3.role", orgKey: "t3.org", tierKey: "basic" as TierKey },
];

/* ═══════════════════════════════════════════════════════
   BILLING TOGGLE
   ═══════════════════════════════════════════════════════ */

function BillingToggle({ annual, setAnnual }: { annual: boolean; setAnnual: (v: boolean) => void }) {
  const { t: tr } = useLang();
  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <span className={`text-xs font-medium transition-colors ${!annual ? "text-white" : "text-white/40"}`}>
        {tr("membership.toggle.monthly")}
      </span>
      <button
        onClick={() => setAnnual(!annual)}
        className="relative w-12 h-6 rounded-full transition-colors duration-300"
        style={{ backgroundColor: annual ? "#E8272C" : "rgba(255,255,255,0.15)" }}
      >
        <div
          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300"
          style={{ left: annual ? "26px" : "2px" }}
        />
      </button>
      <span className={`text-xs font-medium transition-colors ${annual ? "text-white" : "text-white/40"}`}>
        {tr("membership.toggle.annual")}
      </span>
      {annual && (
        <span className="text-[10px] font-bold tracking-wide uppercase bg-[#E8272C]/20 text-[#E8272C] px-2.5 py-1 rounded-sm">
          {tr("membership.toggle.save")}
        </span>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   STAT BLOCK
   ═══════════════════════════════════════════════════════ */

function StatBlock() {
  const { t: tr } = useLang();
  const stats = [
    { value: "membership.hero.stat1.value", label: "membership.hero.stat1.label" },
    { value: "membership.hero.stat2.value", label: "membership.hero.stat2.label" },
    { value: "membership.hero.stat3.value", label: "membership.hero.stat3.label" },
  ];
  return (
    <div className="flex items-center justify-center gap-10 sm:gap-16 mt-12">
      {stats.map((s, i) => (
        <div key={s.value} className="relative text-center">
          <div className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            {tr(s.value)}
          </div>
          <div className="text-[10px] sm:text-xs text-white/35 tracking-wider uppercase mt-1.5 font-medium">
            {tr(s.label)}
          </div>
          {i < stats.length - 1 && (
            <div className="hidden sm:block absolute -right-8 top-1/2 -translate-y-1/2 w-px h-10 bg-white/10" />
          )}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TIER CARD — World Class Design
   ═══════════════════════════════════════════════════════ */

function TierCard({ tierKey, annual }: { tierKey: TierKey; annual: boolean }) {
  const { t: tr } = useLang();
  const { navigate } = useNavigation();
  const topFeats = TOP_FEATURES.find((t) => t.tierKey === tierKey)?.featKeys || [];
  const isPremium = tierKey === "premium";
  const isExpert = tierKey === "expert";
  const isHighlighted = isPremium;
  const isDark = isPremium || isExpert;

  const handleCta = () => {
    if (tierKey === "expert") navigate("contact");
    else if (tierKey === "free") navigate("opinions");
    else navigate("reports");
  };

  /* Price display */
  const getPrice = () => {
    if (tierKey === "free") return tr("membership.price.free");
    if (tierKey === "expert") return tr("membership.price.expert");
    const monthly = tr(`membership.price.${tierKey}`);
    if (annual) {
      const yearly = tr(`membership.price.${tierKey}.annual`);
      return { monthly: yearly.split("/")[0], period: yearly.includes("/") ? yearly.split("/").slice(1).join("/") : "" };
    }
    return { monthly, period: tr(`membership.price.${tierKey}.period`) };
  };

  const price = getPrice();
  const isAnnualObj = typeof price === "object";

  return (
    <div
      className={`relative flex flex-col rounded-sm transition-all duration-500 group overflow-hidden ${
        isPremium
          ? "bg-[#0A2540] text-white border-2 border-[#E8272C] shadow-2xl shadow-[#0A2540]/30 lg:scale-[1.04] z-10"
          : isExpert
            ? "bg-gradient-to-b from-[#0A2540] to-[#061829] text-white border border-white/10 shadow-xl shadow-[#0A2540]/20"
            : "bg-white text-primary border border-border hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
      }`}
    >
      {/* Top accent line */}
      {isPremium && (
        <div className="h-1 bg-gradient-to-r from-[#E8272C] via-[#ff4d52] to-[#E8272C]" />
      )}
      {isExpert && (
        <div className="h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
      )}

      {/* "Most Popular" badge */}
      {isHighlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
          <span className="bg-[#E8272C] text-white text-[10px] font-bold tracking-[0.12em] uppercase px-5 py-1.5 rounded-sm shadow-lg shadow-[#E8272C]/30 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            {tr("membership.badge.popular")}
          </span>
        </div>
      )}

      {/* Expert badge */}
      {isExpert && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
          <span className="bg-amber-500 text-[#0A2540] text-[10px] font-bold tracking-[0.12em] uppercase px-5 py-1.5 rounded-sm shadow-lg shadow-amber-500/20 flex items-center gap-1.5">
            <Crown className="w-3 h-3" />
            {tr("membership.badge.institutional")}
          </span>
        </div>
      )}

      {/* Card header */}
      <div className={`px-5 sm:px-6 pt-8 pb-6 ${isDark ? "" : "border-b border-border"}`}>
        <div className="flex items-center gap-2 mb-3">
          <h3 className={`text-[11px] font-bold tracking-[0.14em] uppercase ${
            isDark ? "text-white/50" : "text-muted-foreground"
          }`}>
            {tr(`membership.tier.${tierKey}`)}
          </h3>
          {isExpert && <Crown className="w-3.5 h-3.5 text-amber-400" />}
        </div>

        {/* Price block */}
        {tierKey === "free" ? (
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tight">{price}</span>
          </div>
        ) : tierKey === "expert" ? (
          <div className="mt-2">
            <span className="text-4xl font-bold tracking-tight">{price}</span>
            <p className={`text-[11px] mt-2 ${isDark ? "text-white/35" : "text-muted-foreground/60"}`}>
              {tr(`membership.price.expert.annual`)}
            </p>
          </div>
        ) : (
          <div className="mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight">{isAnnualObj ? price.monthly : price}</span>
              <span className={`text-sm ${isDark ? "text-white/40" : "text-muted-foreground"}`}>
                {isAnnualObj ? (price as { period: string }).period : tr(`membership.price.${tierKey}.period`)}
              </span>
            </div>
            {annual && (
              <div className={`text-[11px] mt-1.5 ${isDark ? "text-white/35" : "text-muted-foreground/60"}`}>
                <span className="text-[#E8272C] font-semibold">
                  {tr(`membership.price.${tierKey}.save`)}
                </span>
              </div>
            )}
            {!annual && (
              <div className={`text-[11px] mt-1.5 ${isDark ? "text-white/25" : "text-muted-foreground/40"}`}>
                {tr(`membership.price.${tierKey}.annual`)}
              </div>
            )}
          </div>
        )}

        {/* "For whom" */}
        <p className={`text-xs leading-relaxed mt-4 ${
          isDark ? "text-white/50" : "text-muted-foreground"
        }`}>
          {tr(`membership.forwhom.${tierKey}`)}
        </p>

        {/* CTA button */}
        <Button
          className={`w-full mt-6 gap-2 text-xs font-semibold tracking-wide transition-all duration-300 ${
            isPremium
              ? "bg-[#E8272C] hover:bg-[#cc1f24] text-white shadow-lg shadow-[#E8272C]/20 hover:shadow-xl hover:shadow-[#E8272C]/30 hover:-translate-y-0.5"
              : isExpert
                ? "bg-amber-500 hover:bg-amber-400 text-[#0A2540] shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5"
                : tierKey === "free"
                  ? "bg-white hover:bg-secondary text-primary border border-border hover:border-primary/30"
                  : "bg-primary hover:bg-primary/90 text-white hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5"
          }`}
          onClick={handleCta}
        >
          {tr(`membership.cta.${tierKey}`)} <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Feature list */}
      <div className="flex-1 px-5 sm:px-6 py-6">
        <ul className="space-y-3">
          {topFeats.map((fk) => (
            <li key={fk} className="flex items-start gap-2.5 group/feat">
              <div className={`w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                isPremium
                  ? "bg-white/10 group-hover/feat:bg-[#E8272C]/30"
                  : isExpert
                    ? "bg-white/10 group-hover/feat:bg-amber-400/20"
                    : "bg-[#E8272C]/8 group-hover/feat:bg-[#E8272C]/15"
              }`}>
                <Check className={`w-2.5 h-2.5 ${
                  isPremium ? "text-[#E8272C]" : isExpert ? "text-amber-400" : "text-[#E8272C]"
                }`} strokeWidth={3} />
              </div>
              <span className={`text-[12px] leading-relaxed ${
                isDark ? "text-white/65 group-hover/feat:text-white/85" : "text-muted-foreground group-hover/feat:text-primary"
              } transition-colors`}>
                {tr(`membership.feat.${fk}`)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom glow for premium */}
      {isPremium && (
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#E8272C]/10 to-transparent pointer-events-none" />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   COMPARISON TABLE
   ═══════════════════════════════════════════════════════ */

function ComparisonTable() {
  const { t: tr } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="mx-auto flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors group"
      >
        {tr("membership.compare.title")}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-8 overflow-x-auto -mx-4 px-4">
          <table className="w-full min-w-[680px] text-xs">
            <thead>
              <tr className="border-b-2 border-primary">
                <th className="text-left py-4 px-3 font-bold text-muted-foreground uppercase tracking-[0.08em] text-[10px]">
                  {tr("membership.compare.feature")}
                </th>
                {(["free", "basic", "premium", "expert"] as TierKey[]).map((t) => (
                  <th
                    key={t}
                    className={`py-4 px-3 text-center font-bold uppercase tracking-[0.08em] text-[10px] ${
                      t === "premium" ? "text-[#E8272C] bg-[#E8272C]/5" : t === "expert" ? "text-amber-600 bg-amber-50/50" : "text-muted-foreground"
                    }`}
                  >
                    {tr(`membership.tier.${t}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GROUPS.map(({ group, icon: GrpIcon }) => {
                const rows = FEATURES.filter((f) => f.group === group);
                return (
                  <FeatureGroup key={group} group={group} Icon={GrpIcon} rows={rows} />
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FeatureGroup({ group, Icon, rows }: { group: string; Icon: typeof Shield; rows: FeatureRow[] }) {
  const { t: tr } = useLang();
  return (
    <>
      <tr>
        <td colSpan={5} className="pt-6 pb-2 px-3 text-[10px] font-bold tracking-[0.1em] uppercase text-primary bg-secondary/50">
          <span className="inline-flex items-center gap-2">
            <Icon className="w-3 h-3" />
            {tr(`membership.group.${group}`)}
          </span>
        </td>
      </tr>
      {rows.map((row) => (
        <tr key={row.key} className="border-t border-border/50 hover:bg-secondary/30 transition-colors">
          <td className="py-2.5 px-3 text-muted-foreground">{tr(`membership.feat.${row.key}`)}</td>
          {row.access.map((has, i) => (
            <td key={i} className="py-2.5 px-3 text-center">
              {has ? (
                <Check className="w-3.5 h-3.5 text-[#E8272C] mx-auto" strokeWidth={2.5} />
              ) : (
                <Minus className="w-3.5 h-3.5 text-border mx-auto" strokeWidth={2} />
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   INTELLIGENCE JOURNEY
   ═══════════════════════════════════════════════════════ */

function JourneySection() {
  const { t: tr } = useLang();
  return (
    <section className="border-t border-border bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#E8272C] mb-3 block">
            {tr("membership.journey.tag")}
          </span>
          <h2 className="heading-serif text-2xl sm:text-3xl lg:text-[2.5rem] font-bold text-primary mb-4 max-w-2xl mx-auto leading-[1.15]">
            {tr("membership.journey.title")}
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            {tr("membership.journey.desc")}
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Horizontal connector line (desktop) */}
          <div className="hidden lg:block absolute top-[52px] left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] h-px bg-gradient-to-r from-border via-[#E8272C]/30 to-border" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {JOURNEY_STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              const isLast = idx === JOURNEY_STEPS.length - 1;
              return (
                <div key={step.numKey} className="relative group">
                  {/* Vertical connector (mobile) */}
                  {!isLast && (
                    <div className="lg:hidden absolute top-16 left-[26px] w-px h-[calc(100%-16px)] bg-border" />
                  )}

                  <div className="relative">
                    {/* Step icon circle */}
                    <div className="relative w-14 h-14 rounded-full border-2 border-[#E8272C]/30 bg-white flex items-center justify-center flex-shrink-0 mx-auto mb-5 group-hover:border-[#E8272C] group-hover:shadow-lg group-hover:shadow-[#E8272C]/10 transition-all duration-300">
                      <StepIcon className="w-6 h-6 text-[#E8272C]" />
                      {/* Step number */}
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#E8272C] rounded-full flex items-center justify-center">
                        <span className="text-[9px] font-bold text-white">
                          {idx === 0 ? "01" : idx === 1 ? "02" : idx === 2 ? "03" : "04"}
                        </span>
                      </div>
                    </div>

                    <div className="text-center">
                      <h3 className="font-bold text-sm text-primary tracking-wide mb-1">
                        {tr(`membership.journey.${step.numKey}.title`)}
                      </h3>
                      <span className="inline-block text-[9px] font-bold tracking-[0.12em] uppercase bg-secondary border border-border px-2.5 py-0.5 rounded-sm text-muted-foreground mb-3">
                        {tr(`membership.tier.${step.tierKey}`)}
                      </span>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {tr(`membership.journey.${step.numKey}.desc`)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   TESTIMONIALS
   ═══════════════════════════════════════════════════════ */

function TestimonialsSection() {
  const { t: tr } = useLang();
  return (
    <section className="border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-14">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#E8272C] mb-3 block">
            {tr("membership.testimonial.tag")}
          </span>
          <h2 className="heading-serif text-2xl sm:text-3xl font-bold text-primary">
            {tr("membership.testimonial.title")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {TESTIMONIALS.map((tm, idx) => (
            <div
              key={tm.quoteKey}
              className="relative bg-secondary/40 border border-border p-6 sm:p-8 hover:border-primary/20 hover:shadow-sm transition-all duration-300 group"
            >
              {/* Quote mark */}
              <div className="absolute top-5 right-6 text-[#E8272C]/10 group-hover:text-[#E8272C]/20 transition-colors">
                <Quote className="w-10 h-10" />
              </div>

              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-sm text-primary leading-relaxed mb-6 italic">
                &ldquo;{tr(`membership.testimonial.${tm.quoteKey}`)}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary">
                    {tr(`membership.testimonial.${tm.roleKey}`)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {tr(`membership.testimonial.${tm.orgKey}`)}
                  </p>
                </div>
              </div>

              {/* Tier badge */}
              <div className="absolute bottom-5 right-6">
                <span className={`text-[9px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 rounded-sm ${
                  tm.tierKey === "premium" ? "bg-[#E8272C]/10 text-[#E8272C]" :
                  tm.tierKey === "expert" ? "bg-amber-100 text-amber-700" :
                  "bg-secondary text-muted-foreground"
                }`}>
                  {tr(`membership.tier.${tm.tierKey}`)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   ENTERPRISE / INSTITUTIONAL SECTION
   ═══════════════════════════════════════════════════════ */

function EnterpriseSection() {
  const { t: tr } = useLang();
  const { navigate } = useNavigation();
  return (
    <section className="relative bg-gradient-to-br from-[#0A2540] via-[#0d2d4f] to-[#0A2540] text-white overflow-hidden">
      {/* Subtle geometric pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* Gold glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-400/70">
                {tr("membership.enterprise.tag")}
              </span>
            </div>
            <h2 className="heading-serif text-2xl sm:text-3xl font-bold mb-4 leading-[1.15]">
              {tr("membership.enterprise.title")}
            </h2>
            <p className="text-sm text-white/50 leading-relaxed mb-8 max-w-md">
              {tr("membership.enterprise.desc")}
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                className="bg-amber-500 hover:bg-amber-400 text-[#0A2540] gap-2 shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300"
                onClick={() => navigate("contact")}
              >
                {tr("membership.enterprise.cta")} <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Right: Feature list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: Shield, key: "enterprise.f1" },
              { icon: Users, key: "enterprise.f2" },
              { icon: BrainCircuit, key: "enterprise.f3" },
              { icon: FileText, key: "enterprise.f4" },
              { icon: Video, key: "enterprise.f5" },
              { icon: Star, key: "enterprise.f6" },
            ].map(({ icon: Icon, key }) => (
              <div
                key={key}
                className="flex items-start gap-3 p-3.5 rounded-sm border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300"
              >
                <div className="w-8 h-8 rounded-sm bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-xs text-white/60 leading-relaxed pt-1">
                  {tr(`membership.${key}`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   TRUST SECTION
   ═══════════════════════════════════════════════════════ */

function TrustSection() {
  const { t: tr } = useLang();
  return (
    <section className="border-t border-border bg-secondary/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
        <h2 className="heading-serif text-xl sm:text-2xl font-bold text-primary mb-12">
          {tr("membership.trust.title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {(["independent", "swiss", "methodology"] as const).map((key) => (
            <div key={key} className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-white border border-border rounded-full flex items-center justify-center mb-5 shadow-sm group-hover:border-primary/30 group-hover:shadow-md transition-all duration-300">
                {key === "independent" && <Shield className="w-7 h-7 text-primary" />}
                {key === "swiss" && <SwissCrossMark size={34} />}
                {key === "methodology" && <BrainCircuit className="w-7 h-7 text-primary" />}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                {tr(`membership.trust.${key}`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   FAQ SECTION
   ═══════════════════════════════════════════════════════ */

function FAQSection() {
  const { t: tr } = useLang();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="bg-secondary/50 border-t border-border">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-12">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#E8272C] mb-3 block">
            {tr("membership.faq.tag")}
          </span>
          <h2 className="heading-serif text-2xl sm:text-3xl font-bold text-primary">
            {tr("membership.faq.title")}
          </h2>
        </div>

        <div className="space-y-0 border border-border bg-white rounded-sm overflow-hidden">
          {FAQ_ITEMS.map((qKey, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={qKey}>
                {idx > 0 && <div className="border-t border-border" />}
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-start justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 text-left hover:bg-secondary/50 transition-colors"
                >
                  <span className="font-semibold text-sm text-primary leading-snug">
                    {tr(`membership.faq.${qKey}`)}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tr(`membership.faq.a${qKey.replace("q", "")}`)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   FINAL CTA
   ═══════════════════════════════════════════════════════ */

function FinalCTA() {
  const { t: tr } = useLang();
  const { navigate } = useNavigation();
  return (
    <section className="relative bg-[#0A2540] text-white overflow-hidden">
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Red gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#E8272C]/10 rounded-full blur-[120px] pointer-events-none" />
      {/* Bottom glow */}
      <div className="absolute bottom-0 left-1/3 w-[400px] h-[200px] bg-[#E8272C]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
        <div className="w-16 h-16 mx-auto mb-8 rounded-full border-2 border-white/10 flex items-center justify-center bg-white/5">
          <SwissCrossMark size={36} />
        </div>
        <h2 className="heading-serif text-2xl sm:text-3xl lg:text-4xl font-bold leading-[1.15] tracking-tight mb-5">
          {tr("membership.final.title")}
        </h2>
        <p className="text-sm sm:text-base text-white/45 leading-relaxed max-w-xl mx-auto mb-10">
          {tr("membership.final.desc")}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            className="bg-[#E8272C] hover:bg-[#cc1f24] text-white gap-2 px-8 shadow-lg shadow-[#E8272C]/20 hover:shadow-xl hover:shadow-[#E8272C]/30 transition-all duration-300"
            onClick={() => navigate("reports")}
          >
            {tr("membership.final.cta")} <ArrowRight className="w-4 h-4" />
          </Button>
          <span
            className="text-xs text-white/35 hover:text-white/70 cursor-pointer transition-colors underline underline-offset-2 decoration-white/20"
            onClick={() => navigate("reports")}
          >
            {tr("membership.final.login")}
          </span>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN VIEW
   ═══════════════════════════════════════════════════════ */

export function MembershipView() {
  const { t: tr } = useLang();
  const [annual, setAnnual] = useState(false);

  return (
    <div>
      {/* ═══ HERO ═══ */}
      <section className="relative bg-[#0A2540] text-white overflow-hidden">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Radial glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E8272C]/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-16 sm:pb-20 text-center">
          <div className="inline-flex items-center gap-2.5 mb-8 border border-white/10 rounded-full px-5 py-2 bg-white/[0.03] backdrop-blur-sm">
            <Lock className="w-3.5 h-3.5 text-[#E8272C]" />
            <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-white/50">
              {tr("membership.hero.tag")}
            </span>
          </div>

          <h1 className="heading-serif text-3xl sm:text-4xl lg:text-[3.5rem] font-bold leading-[1.08] tracking-tight mb-6 max-w-3xl mx-auto">
            {tr("membership.hero.title.1")}{" "}
            <span className="text-[#E8272C]">{tr("membership.hero.title.2")}</span>
          </h1>
          <p className="text-sm sm:text-base text-white/40 leading-relaxed max-w-2xl mx-auto">
            {tr("membership.hero.desc")}
          </p>

          <StatBlock />
          <BillingToggle annual={annual} setAnnual={setAnnual} />
        </div>

        {/* Fade to background */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ═══ PRICING CARDS ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-4 items-start">
          {(["free", "basic", "premium", "expert"] as TierKey[]).map((key) => (
            <TierCard
              key={key}
              tierKey={key}
              annual={annual}
            />
          ))}
        </div>
      </section>

      {/* ═══ COMPARISON TABLE ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <ComparisonTable />
      </section>

      {/* ═══ INTELLIGENCE JOURNEY ═══ */}
      <JourneySection />

      {/* ═══ TESTIMONIALS ═══ */}
      <TestimonialsSection />

      {/* ═══ ENTERPRISE / INSTITUTIONAL ═══ */}
      <EnterpriseSection />

      {/* ═══ TRUST SECTION ═══ */}
      <TrustSection />

      {/* ═══ FAQ ═══ */}
      <FAQSection />

      {/* ═══ FINAL CTA ═══ */}
      <FinalCTA />
    </div>
  );
}