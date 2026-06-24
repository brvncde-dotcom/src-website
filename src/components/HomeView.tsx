"use client";

import {
  BrainCircuit, ShieldCheck, ArrowRight, Lock, Scale,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PageKey } from "./SiteNavigation";

/* ── Latest reports (3-card tease) ── */
const MOCK_REPORTS = [
  {
    id: "1",
    title: "AI Governance Frameworks for Critical Infrastructure: A D-A-CH Comparative Analysis",
    section: "Digital Power & AI",
    date: "2026-06-18",
    type: "Analysis",
    summary:
      "An in-depth comparison of AI regulatory approaches across Switzerland, Germany, and Austria, with recommendations for harmonised governance of AI in critical infrastructure systems.",
  },
  {
    id: "2",
    title: "SMR Deployment Roadmap: Central Europe\u2019s Nuclear Renaissance",
    section: "Energy & Resources",
    date: "2026-06-12",
    type: "Report",
    summary:
      "Timeline analysis and regulatory pathway assessment for Small Modular Reactor deployment in the D-A-CH region, including supply chain and grid integration considerations.",
  },
  {
    id: "3",
    title: "Hybrid Threat Landscape Q2 2026: D-A-CH Threat Assessment",
    section: "Geopolitics & Security",
    date: "2026-06-05",
    type: "Intelligence Brief",
    summary:
      "Quarterly assessment of hybrid threats targeting D-A-CH critical infrastructure, including cyber-espionage campaigns, disinformation operations, and supply-chain manipulation.",
  },
];

/* ── Credibility differentiators ── */
const DIFFERENTIATORS = [
  {
    icon: BrainCircuit,
    title: "AI-Augmented Speed",
    desc: "A powerful AI research engine processes thousands of sources in near real-time, giving our experts a structured foundation to start from \u2014 not a blank page.",
  },
  {
    icon: ShieldCheck,
    title: "Expert-Validated Rigour",
    desc: "Every publication passes through at least two independent domain-expert reviews. AI drafts are the starting point, never the final word.",
  },
  {
    icon: Scale,
    title: "Non-Partisan & Swiss-Housed",
    desc: "Based in Zug, SRC operates with Swiss neutrality principles. We serve no political party, commercial interest, or ideological agenda.",
  },
];

interface Props {
  onNavigate: (page: PageKey) => void;
}

export function HomeView({ onNavigate }: Props) {
  return (
    <div>
      {/* ═══════ HERO ═══════ */}
      <section className="relative bg-primary text-primary-foreground overflow-hidden">
        {/* Subtle geometric grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-10 bg-[#E8272C]" />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50">
                D-A-CH Think Tank
              </span>
            </div>

            <h1 className="heading-serif text-3xl sm:text-4xl lg:text-[3.25rem] font-bold leading-[1.12] tracking-tight mb-6">
              Security & Resilience
              <br />
              <span className="text-[#E8272C]">for Critical Infrastructure</span>
            </h1>

            <p className="text-base sm:text-lg text-white/60 leading-relaxed max-w-xl mb-10">
              Independent, fact-based analysis on the most pressing security and
              resilience challenges facing the D-A-CH region.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => onNavigate("reports")}
                className="bg-[#E8272C] hover:bg-[#d02025] text-white gap-2"
              >
                Access Reports <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="border-white/20 text-white bg-transparent hover:bg-white/10 hover:text-white"
                onClick={() => onNavigate("approach")}
              >
                Our Approach
              </Button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ═══════ LATEST FROM SRC ═══════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#E8272C] mb-2 block">
              Latest
            </span>
            <h2 className="heading-serif text-2xl sm:text-3xl font-bold text-primary">
              From SRC
            </h2>
          </div>
          <Button
            variant="ghost"
            className="text-muted-foreground gap-2 text-sm hidden sm:flex"
            onClick={() => onNavigate("reports")}
          >
            All Reports <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {MOCK_REPORTS.map((report) => (
            <article
              key={report.id}
              className="group border border-border p-5 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold tracking-[0.1em] uppercase bg-secondary px-2 py-0.5 rounded-sm text-muted-foreground">
                  {report.type}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {report.date}
                </span>
              </div>
              <h3 className="font-semibold text-sm leading-snug text-primary mb-2 group-hover:text-[#E8272C] transition-colors">
                {report.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-3">
                {report.summary}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-muted-foreground">
                  {report.section}
                </span>
                <div className="flex items-center gap-1 text-[10px] text-[#E8272C] font-medium">
                  <Lock className="w-3 h-3" />
                  Members
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-4 sm:hidden">
          <Button
            variant="ghost"
            className="w-full text-muted-foreground gap-2 text-sm"
            onClick={() => onNavigate("reports")}
          >
            View All Reports <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* ═══════ WHY SRC ═══════ */}
      <section className="border-y border-border bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#E8272C] mb-2 block">
              Why SRC
            </span>
            <h2 className="heading-serif text-2xl sm:text-3xl font-bold text-primary">
              A Different Kind of Think Tank
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {DIFFERENTIATORS.map((d) => (
              <div key={d.title} className="group">
                <div className="w-10 h-10 bg-white border border-border flex items-center justify-center rounded-sm mb-4 group-hover:border-primary/30 transition-colors">
                  <d.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-base text-primary mb-2">
                  {d.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {d.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1.5"
              onClick={() => onNavigate("approach")}
            >
              Full Methodology <ArrowRight className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1.5"
              onClick={() => onNavigate("experts")}
            >
              Expert Panel <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════ CTA STRIP ═══════ */}
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="max-w-md">
              <h2 className="heading-serif text-xl sm:text-2xl font-bold mb-2">
                Access Our Research
              </h2>
              <p className="text-sm text-white/50 leading-relaxed">
                Membership includes full report access, weekly briefings, and
                expert Q&A sessions. New visitors start with 10 days free.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                className="bg-[#E8272C] hover:bg-[#d02025] text-white gap-2"
                onClick={() => onNavigate("contact")}
              >
                Contact Us <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="border-white/20 text-white bg-transparent hover:bg-white/10 hover:text-white"
                onClick={() => onNavigate("reports")}
              >
                Request Trial Access
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}