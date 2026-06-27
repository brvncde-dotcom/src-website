"use client";

import { useState } from "react";
import {
  Star, Crown, ArrowRight, Check, Lock, BookOpen, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ── Billing toggle ── */
type BillingCycle = "monthly" | "annual";

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

/* ── Tier feature rows ── */
interface FeatureRow {
  label: string;
  essential: string | boolean;
  premium: string | boolean;
  expert: string | boolean;
}

const FEATURE_ROWS: FeatureRow[] = [
  { label: "Opinions & Briefs", essential: true, premium: true, expert: true },
  { label: "Executive Summaries", essential: true, premium: true, expert: true },
  { label: "Weekly Newsletter", essential: true, premium: true, expert: true },
  { label: "Standard Reports (2,000–4,000 words)", essential: true, premium: true, expert: true },
  { label: "Daily Intelligence Brief", essential: false, premium: true, expert: true },
  { label: "PDF Downloads", essential: false, premium: true, expert: true },
  { label: "12-Month Archive", essential: false, premium: true, expert: true },
  { label: "vAvatar Video Briefings", essential: false, premium: true, expert: true },
  { label: "Early Access (24h)", essential: false, premium: true, expert: true },
  { label: "Quarterly Forecasts", essential: false, premium: true, expert: true },
  { label: "Studies (long-term research)", essential: false, premium: true, expert: true },
  { label: "Live Analyst Calls", essential: false, premium: false, expert: true },
  { label: "Breaking News Alerts (<4h)", essential: false, premium: false, expert: true },
  { label: "Annual Summit Invitation", essential: false, premium: false, expert: true },
  { label: "Bespoke Research Requests", essential: false, premium: false, expert: true },
  { label: "Dedicated Account Director", essential: false, premium: false, expert: true },
];

export function MembershipView() {
  const [billing, setBilling] = useState<BillingCycle>("monthly");

  const isAnnual = billing === "annual";

  return (
    <div>
      {/* ═══════ HEADER BAR ═══════ */}
      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top stats strip */}
          <div className="flex items-center justify-center gap-6 sm:gap-12 lg:gap-16 py-8 sm:py-10">
            <div className="text-center min-w-0 flex-1">
              <div className="text-2xl sm:text-3xl font-bold text-primary-foreground tracking-tight">
                24/7
              </div>
              <div className="text-[10px] sm:text-xs font-bold tracking-[0.12em] sm:tracking-[0.15em] uppercase text-white/40 mt-1 truncate">
                Monitoring Cycle
              </div>
            </div>

            <div className="w-px h-10 bg-white/10 flex-shrink-0" />

            <div className="text-center min-w-0 flex-1">
              <div className="text-2xl sm:text-3xl font-bold text-primary-foreground tracking-tight">
                2x
              </div>
              <div className="text-[10px] sm:text-xs font-bold tracking-[0.12em] sm:tracking-[0.15em] uppercase text-white/40 mt-1">
                Expert Review
              </div>
            </div>

            <div className="w-px h-10 bg-white/10 flex-shrink-0" />

            <div className="text-center min-w-0 flex-1">
              <div className="text-2xl sm:text-3xl font-bold text-primary-foreground tracking-tight">
                6
              </div>
              <div className="text-[10px] sm:text-xs font-bold tracking-[0.12em] sm:tracking-[0.15em] uppercase text-white/40 mt-1">
                Focus Areas
              </div>
            </div>
          </div>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 pb-8">
            <span
              className={`text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                !isAnnual ? "text-primary-foreground" : "text-white/40"
              }`}
            >
              Monthly
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
              Annual
            </span>
            {isAnnual && (
              <span className="text-[10px] font-bold tracking-wider uppercase bg-[#E8272C] text-white px-2 py-0.5 rounded-sm ml-1 whitespace-nowrap">
                Save 17%
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ═══════ PRICING CARDS ═══════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 overflow-visible">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-0 overflow-visible">

          {/* ── ESSENTIAL ── */}
          <div className="border border-border p-6 lg:p-8 flex flex-col">
            <div className="mb-6">
              <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground mb-1">
                Essential
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                For professionals who need reliable intelligence and full report access.
              </p>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="heading-serif text-3xl sm:text-4xl font-bold text-primary">
                  CHF {isAnnual ? "24" : "29"}
                </span>
                <span className="text-sm text-muted-foreground">
                  /{isAnnual ? "month" : "month"}
                </span>
              </div>
              {isAnnual && (
                <p className="text-xs text-muted-foreground mt-1">
                  CHF 290/year &middot; billed annually
                </p>
              )}
            </div>

            <Button
              variant="outline"
              className="w-full mb-8 text-sm"
              onClick={() => window.open("mailto:contact@src-advisory.ch?subject=Membership%20Inquiry%20-%20Essential", "_self")}
            >
              Get Started
            </Button>

            <ul className="space-y-3 flex-1">
              {FEATURE_ROWS.filter((f) => f.essential).map((f) => (
                <li key={f.label} className="flex items-start gap-2.5 text-sm">
                  <Check className="w-4 h-4 text-[#E8272C] mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{f.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── PREMIUM ── */}
          <div className="relative border-2 border-[#E8272C] bg-primary text-primary-foreground p-6 lg:p-8 flex flex-col md:-my-5 lg:shadow-xl z-10">
            {/* Badge */}
            <div className="absolute -top-3.5 left-6 flex items-center gap-1.5 bg-[#E8272C] text-white text-[10px] font-bold tracking-[0.12em] uppercase px-3 py-1 rounded-sm z-20">
              <Star className="w-3 h-3" />
              Most Popular
            </div>

            <div className="mb-6 mt-2">
              <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-white/50 mb-1">
                Premium
              </h3>
              <p className="text-sm text-white/60 leading-relaxed">
                For leaders and decision-makers who require early signals, exclusive briefings, and strategic depth.
              </p>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="heading-serif text-3xl sm:text-4xl font-bold text-white">
                  CHF {isAnnual ? "66" : "79"}
                </span>
                <span className="text-sm text-white/50">
                  /month
                </span>
              </div>
              {isAnnual && (
                <p className="text-xs text-white/40 mt-1">
                  CHF 790/year &middot; billed annually
                </p>
              )}
            </div>

            <Button className="w-full mb-8 bg-[#E8272C] hover:bg-[#d02025] text-white text-sm">
              Get Started
            </Button>

            <ul className="space-y-3 flex-1">
              {FEATURE_ROWS.filter((f) => f.premium).map((f) => (
                <li key={f.label} className="flex items-start gap-2.5 text-sm">
                  <Check className="w-4 h-4 text-[#E8272C] mt-0.5 flex-shrink-0" />
                  <span className="text-white/70">{f.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── EXPERT / CUSTOM ── */}
          <div className="border border-border p-6 lg:p-8 flex flex-col">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground">
                  Expert
                </h3>
                <Crown className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tailored pricing for institutions. Direct expert access, bespoke research, and bespoke briefings.
              </p>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="heading-serif text-3xl sm:text-4xl font-bold text-primary">
                  Custom
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Institutional pricing &middot; contact for details
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full mb-8 text-sm"
              onClick={() => window.open("mailto:contact@src-advisory.ch?subject=Membership%20Inquiry%20-%20Expert", "_self")}
            >
              Contact Us
            </Button>

            <ul className="space-y-3 flex-1">
              {FEATURE_ROWS.filter((f) => f.expert).map((f) => (
                <li key={f.label} className="flex items-start gap-2.5 text-sm">
                  {f.label === "Bespoke Research Requests" || f.label === "Dedicated Account Director" ? (
                    <Star className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Check className="w-4 h-4 text-[#E8272C] mt-0.5 flex-shrink-0" />
                  )}
                  <span className="text-muted-foreground">{f.label}</span>
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
                  Studies
                </span>
              </div>
              <h2 className="heading-serif text-2xl sm:text-3xl font-bold text-primary mb-2">
                In-Depth Research
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Studies are long-term, comprehensive research projects examining critical topics
                in depth. Spanning 5,000 to 10,000 words, they combine extensive source analysis,
                expert validation, and multi-domain perspectives to deliver authoritative assessments.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] font-bold tracking-[0.1em] uppercase bg-[#E8272C] text-white px-2.5 py-1 rounded-sm">
                Premium
              </span>
              <span className="text-muted-foreground text-xs">+</span>
              <span className="text-[10px] font-bold tracking-[0.1em] uppercase bg-primary text-white px-2.5 py-1 rounded-sm flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Custom
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
                        <span className="text-xs text-muted-foreground hidden sm:block">Read Study</span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-[#E8272C] transition-colors" />
                      </>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-amber-600">
                        <Lock className="w-3.5 h-3.5" />
                        <span className="hidden sm:block">Coming Soon</span>
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
                Access all current and upcoming studies
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Studies are exclusively available to Premium and Custom members. New studies are
                published quarterly, covering the most critical resilience and security topics
                across our six focus areas.
              </p>
            </div>
            <Button className="bg-[#E8272C] hover:bg-[#d02025] text-white text-sm flex-shrink-0 gap-2">
              View Membership Plans <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════ FEATURE COMPARISON TABLE ═══════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="text-center mb-10">
          <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#E8272C] mb-2 block">
            Compare
          </span>
          <h2 className="heading-serif text-2xl sm:text-3xl font-bold text-primary">
            Full Feature Comparison
          </h2>
        </div>

        <div className="border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary">
                <th className="text-left py-3 px-4 text-xs font-bold tracking-[0.08em] uppercase text-muted-foreground w-[45%]">
                  Feature
                </th>
                <th className="text-center py-3 px-4 text-xs font-bold tracking-[0.08em] uppercase text-muted-foreground w-[18.3%]">
                  Essential
                </th>
                <th className="text-center py-3 px-4 text-xs font-bold tracking-[0.08em] uppercase text-[#E8272C] w-[18.3%]">
                  Premium
                </th>
                <th className="text-center py-3 px-4 text-xs font-bold tracking-[0.08em] uppercase text-muted-foreground w-[18.3%]">
                  Expert
                </th>
              </tr>
            </thead>
            <tbody>
              {FEATURE_ROWS.map((row, i) => (
                <tr
                  key={row.label}
                  className={i % 2 === 0 ? "bg-white" : "bg-secondary/30"}
                >
                  <td className="py-3 px-4 text-muted-foreground">{row.label}</td>
                  {(["essential", "premium", "expert"] as const).map((tier) => (
                    <td key={tier} className="py-3 px-4 text-center">
                      {row[tier] === true ? (
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

      {/* ═══════ STUDENT / YOUNG PROFESSIONAL ═══════ */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Users className="w-4 h-4 text-[#E8272C]" />
              <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#E8272C]">
                For the Next Generation
              </span>
            </div>
            <h2 className="heading-serif text-2xl sm:text-3xl font-bold text-primary mb-3">
              Student & Young Professional
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Under 30? Access all Essential features at a reduced rate.
              We believe in investing in the next generation of security and resilience leaders.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="text-center sm:text-left">
                <div className="text-2xl font-bold text-primary">CHF 190<span className="text-sm font-normal text-muted-foreground">/year</span></div>
                <div className="text-xs text-muted-foreground">Young Professionals (under 30)</div>
              </div>
              <div className="w-px h-10 bg-border hidden sm:block" />
              <div className="text-center sm:text-left">
                <div className="text-2xl font-bold text-primary">CHF 160<span className="text-sm font-normal text-muted-foreground">/year</span></div>
                <div className="text-xs text-muted-foreground">Students (with valid enrollment)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ CTA STRIP ═══════ */}
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="max-w-md">
              <h2 className="heading-serif text-xl sm:text-2xl font-bold mb-2">
                Not Sure Which Plan?
              </h2>
              <p className="text-sm text-white/50 leading-relaxed">
                Start with a 10-day free trial. Full access to all published reports, opinions,
                and briefings. No credit card required.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                className="bg-[#E8272C] hover:bg-[#d02025] text-white gap-2"
                onClick={() => window.open("mailto:contact@src-advisory.ch?subject=Membership%20Inquiry", "_self")}
              >
                Contact Us <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 hover:text-white"
              >
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}