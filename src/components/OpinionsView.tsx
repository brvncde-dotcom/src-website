"use client";

import { useState } from "react";
import {
  ArrowRight, Clock,
} from "lucide-react";
import { useLang } from "./LangProvider";

const MOCK_OPINIONS = [
  { id: "o1", title: "Why Europe's AI Act Needs a Swiss Amendment", author: "Dr. Bernd R.", role: "President, SRC", date: "2026-06-20", readTime: "4 min", excerpt: "The EU AI Act sets a global benchmark, but Switzerland's unique position as a non-EU member with deep economic integration requires a tailored approach that preserves innovation while maintaining alignment with European standards.", fullContent: "The EU AI Act sets a global benchmark, but Switzerland's unique position as a non-EU member with deep economic integration requires a tailored approach that preserves innovation while maintaining alignment with European standards.\n\nThe current one-size-fits-all approach risks either over-regulating Swiss AI startups or creating compliance gaps that undermine the Act's objectives. Switzerland's bilateral agreements with the EU create a de facto regulatory dependency.\n\nHowever, Switzerland's constitutional framework, direct democracy instruments, and federal structure create both opportunities and constraints that the AI Act does not adequately address. A Swiss amendment could bridge this gap while maintaining the regulatory coherence that makes the single market function." },
  { id: "o2", title: "The 2.5% GDP Defence Target: A Swiss Perspective", author: "Thomas H.", role: "VP Operations, SRC", date: "2026-06-15", readTime: "5 min", excerpt: "While NATO's 2.5% target dominates headlines, Switzerland must evaluate its defence spending through a different lens — one that accounts for armed neutrality, conscription-based readiness, and the specific threats to Alpine infrastructure.", fullContent: "While NATO's 2.5% target dominates headlines, Switzerland must evaluate its defence spending through a different lens — one that accounts for armed neutrality, conscription-based readiness, and the specific threats to Alpine infrastructure.\n\nSwitzerland's militia system provides a cost-effective force multiplier that no NATO member can replicate. The real question is not whether Switzerland should hit an arbitrary GDP percentage, but whether current spending adequately addresses the specific threats facing a small, wealthy, highly networked nation." },
  { id: "o3", title: "Grid Resilience Is the Quiet Crisis Nobody Talks About", author: "Prof. Dr. Maria K.", role: "VP Research, SRC", date: "2026-06-10", readTime: "3 min", excerpt: "As Europe debates energy transition timelines, an uncomfortable truth remains: our electricity grids are ageing faster than we can replace them, and the pace of electrification is accelerating the problem.", fullContent: "As Europe debates energy transition timelines, an uncomfortable truth remains: our electricity grids are ageing faster than we can replace them, and the pace of electrification is accelerating the problem.\n\nThe average age of transmission infrastructure exceeds 40 years. At the same time, electrification of transport, heating, and industry is projected to increase electricity demand by 30-50% by 2040. The math is unforgiving." },
  { id: "o4", title: "Information Warfare and the European Information Space", author: "Dr. Anna W.", role: "Head of Analysis, SRC", date: "2026-06-02", readTime: "6 min", excerpt: "The information environment is under sustained pressure from state and non-state actors. Unlike kinetic attacks, information operations leave no physical trace — making attribution difficult and response complex.", fullContent: "The information environment is under sustained pressure from state and non-state actors. Unlike kinetic attacks, information operations leave no physical trace — making attribution difficult and response complex.\n\nOur analysis identifies three primary vectors: social media manipulation targeting domestic political debates, state-controlled media outlets producing content designed to influence public opinion, and cyber-enabled influence operations that compromise trusted institutions." },
  { id: "o5", title: "Critical Minerals: Europe's Strategic Blind Spot", author: "Dr. Bernd R.", role: "President, SRC", date: "2026-05-25", readTime: "4 min", excerpt: "The energy transition depends on minerals Europe does not produce. Current supply chains pass through a single strategic chokepoint — and alternatives are years away from operational capacity.", fullContent: "The energy transition depends on minerals Europe does not produce. Current supply chains pass through a single strategic chokepoint — and alternatives are years away from operational capacity.\n\nLithium, cobalt, rare earth elements, and gallium — the building blocks of batteries, semiconductors, and defence systems — are concentrated in a handful of countries, many with geopolitical interests that diverge from Europe's." },
];

export function OpinionsView() {
  const { t: tr } = useLang();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Header */}
      <div className="max-w-2xl mb-10">
        <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#E8272C] mb-2 block">
          {tr("opinions.tag")}
        </span>
        <h1 className="heading-serif text-2xl sm:text-3xl font-bold text-primary mb-3">
          {tr("opinions.heading")}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {tr("opinions.desc")}
        </p>
      </div>

      {/* Opinions list */}
      <div className="max-w-3xl space-y-0">
        {MOCK_OPINIONS.map((op, idx) => (
          <article key={op.id}>
            {idx > 0 && <div className="border-t border-border" />}

            <div
              className="py-8 cursor-pointer group"
              onClick={() => setExpandedId(expandedId === op.id ? null : op.id)}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-bold tracking-[0.08em] uppercase bg-secondary px-2 py-0.5 rounded-sm text-muted-foreground">
                  {tr("opinions.badge")}
                </span>
                <span className="text-[10px] text-muted-foreground">{op.date}</span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {op.readTime}
                </span>
              </div>

              <h2 className="heading-serif text-lg sm:text-xl font-bold text-primary group-hover:text-[#E8272C] transition-colors mb-2">
                {op.title}
              </h2>

              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[9px] font-bold">
                  {op.author.split(" ").map(n => n[0]).join("").replace("Dr.", "D")}
                </div>
                <span className="text-xs font-medium text-primary">{op.author}</span>
                <span className="text-[10px] text-muted-foreground">{op.role}</span>
              </div>

              {expandedId === op.id ? (
                <div className="prose-src text-sm mt-4">
                  {op.fullContent.split("\n\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {op.excerpt}
                </p>
              )}

              <div className="mt-3 flex items-center gap-1 text-xs font-medium text-[#E8272C]">
                {expandedId === op.id ? tr("opinions.collapse") : tr("opinions.read-full")}
                <ArrowRight className={`w-3.5 h-3.5 transition-transform ${expandedId === op.id ? "rotate-90" : ""}`} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}