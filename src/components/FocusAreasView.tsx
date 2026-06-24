"use client";

import {
  BrainCircuit, Swords, Zap, Leaf, TrendingUp, Scale,
  Shield, ArrowRight, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "./LangProvider";

const FOCUS_AREAS = [
  { icon: BrainCircuit, num: "01", titleKey: "focus.digital", descKey: "focus.d1.desc", topicKeys: ["focus.d1.t1","focus.d1.t2","focus.d1.t3","focus.d1.t4","focus.d1.t5","focus.d1.t6"], reports: 12, color: "#0A2540" },
  { icon: Swords, num: "02", titleKey: "focus.geopolitics", descKey: "focus.d2.desc", topicKeys: ["focus.d2.t1","focus.d2.t2","focus.d2.t3","focus.d2.t4","focus.d2.t5","focus.d2.t6"], reports: 9, color: "#1A3A5C" },
  { icon: Zap, num: "03", titleKey: "focus.energy", descKey: "focus.d3.desc", topicKeys: ["focus.d3.t1","focus.d3.t2","focus.d3.t3","focus.d3.t4","focus.d3.t5","focus.d3.t6"], reports: 7, color: "#E8272C" },
  { icon: Leaf, num: "04", titleKey: "focus.climate", descKey: "focus.d4.desc", topicKeys: ["focus.d4.t1","focus.d4.t2","focus.d4.t3","focus.d4.t4","focus.d4.t5","focus.d4.t6"], reports: 5, color: "#2D6A4F" },
  { icon: TrendingUp, num: "05", titleKey: "focus.economy", descKey: "focus.d5.desc", topicKeys: ["focus.d5.t1","focus.d5.t2","focus.d5.t3","focus.d5.t4","focus.d5.t5","focus.d5.t6"], reports: 8, color: "#7C3AED" },
  { icon: Scale, num: "06", titleKey: "focus.society", descKey: "focus.d6.desc", topicKeys: ["focus.d6.t1","focus.d6.t2","focus.d6.t3","focus.d6.t4","focus.d6.t5","focus.d6.t6"], reports: 6, color: "#B45309" },
];

export function FocusAreasView() {
  const { t: tr } = useLang();

  return (
    <div>
      {/* Hero */}
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#E8272C] mb-2 block">
            {tr("focus.hero.tag")}
          </span>
          <h1 className="heading-serif text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 max-w-xl">
            {tr("focus.hero.title")}
          </h1>
          <p className="text-sm text-white/60 max-w-lg leading-relaxed">
            {tr("focus.hero.desc")}
          </p>
        </div>
      </div>

      {/* Focus areas detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="space-y-0">
          {FOCUS_AREAS.map((area, idx) => (
            <div key={area.num}>
              {idx > 0 && <div className="border-t border-border" />}
              <div className="py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 lg:gap-14">
                {/* Left: Meta */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-12 h-12 flex items-center justify-center rounded-sm"
                      style={{ backgroundColor: `${area.color}15`, color: area.color }}
                    >
                      <area.icon className="w-6 h-6" />
                    </div>
                    <span className="section-num">{area.num}</span>
                  </div>
                  <h2 className="heading-serif text-xl sm:text-2xl font-bold text-primary mb-3">
                    {tr(area.titleKey)}
                  </h2>
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {area.reports} {tr("focus.reports-count")}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    {tr("focus.view-reports")}
                  </Button>
                </div>

                {/* Right: Content */}
                <div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    {tr(area.descKey)}
                  </p>
                  <h4 className="text-xs font-bold tracking-[0.1em] uppercase text-primary mb-3">
                    {tr("focus.topics-heading")}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    {area.topicKeys.map((tk) => (
                      <div key={tk} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="w-1 h-1 rounded-full bg-[#E8272C] mt-2 flex-shrink-0" />
                        {tr(tk)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cross-domain note */}
      <div className="bg-secondary/50 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            {tr("focus.cross-domain")}
          </p>
          <Button variant="outline" size="sm" className="mt-4 text-xs gap-1.5">
            {tr("focus.cta")} <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}