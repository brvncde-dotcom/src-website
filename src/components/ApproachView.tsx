"use client";

import {
  BrainCircuit, ShieldCheck, FileCheck, Users, ArrowRight, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "./LangProvider";

const PRINCIPLES = [
  { icon: BrainCircuit, titleKey: "approach.p1.title", descKey: "approach.p1.desc" },
  { icon: ShieldCheck, titleKey: "approach.p2.title", descKey: "approach.p2.desc" },
  { icon: FileCheck, titleKey: "approach.p3.title", descKey: "approach.p3.desc" },
  { icon: Users, titleKey: "approach.p4.title", descKey: "approach.p4.desc" },
];

const PROCESS_STEPS = [
  {
    num: "01",
    titleKey: "approach.s1.title",
    descKey: "approach.s1.desc",
    detailKeys: ["approach.s1.d1", "approach.s1.d2", "approach.s1.d3", "approach.s1.d4"],
  },
  {
    num: "02",
    titleKey: "approach.s2.title",
    descKey: "approach.s2.desc",
    detailKeys: ["approach.s2.d1", "approach.s2.d2", "approach.s2.d3", "approach.s2.d4"],
  },
  {
    num: "03",
    titleKey: "approach.s3.title",
    descKey: "approach.s3.desc",
    detailKeys: ["approach.s3.d1", "approach.s3.d2", "approach.s3.d3", "approach.s3.d4"],
  },
  {
    num: "04",
    titleKey: "approach.s4.title",
    descKey: "approach.s4.desc",
    detailKeys: ["approach.s4.d1", "approach.s4.d2", "approach.s4.d3", "approach.s4.d4"],
  },
];

export function ApproachView() {
  const { t: tr } = useLang();

  return (
    <div>
      {/* Hero */}
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#E8272C] mb-2 block">
            {tr("approach.hero.tag")}
          </span>
          <h1 className="heading-serif text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 max-w-xl">
            {tr("approach.hero.title.1")}
            <br />
            {tr("approach.hero.title.2")}
          </h1>
          <p className="text-sm text-white/60 max-w-lg leading-relaxed">
            {tr("approach.hero.desc")}
          </p>
        </div>
      </div>

      {/* Principles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#E8272C] mb-2 block">
            {tr("approach.principles.tag")}
          </span>
          <h2 className="heading-serif text-2xl sm:text-3xl font-bold text-primary">
            {tr("approach.principles.heading")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PRINCIPLES.map((p) => (
            <div
              key={p.titleKey}
              className="border border-border p-6 hover:border-primary/20 transition-colors"
            >
              <div className="w-10 h-10 bg-secondary flex items-center justify-center rounded-sm mb-4">
                <p.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-base text-primary mb-2">
                {tr(p.titleKey)}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {tr(p.descKey)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#E8272C] mb-2 block">
              {tr("approach.pipeline.tag")}
            </span>
            <h2 className="heading-serif text-2xl sm:text-3xl font-bold text-primary">
              {tr("approach.pipeline.heading")}
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-0">
            {PROCESS_STEPS.map((step, idx) => (
              <div key={step.num}>
                {idx > 0 && (
                  <div className="flex justify-center py-2">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-px h-4 bg-border" />
                      <div className="w-2 h-2 bg-[#E8272C] rotate-45" />
                      <div className="w-px h-4 bg-border" />
                    </div>
                  </div>
                )}
                <div className="bg-white border border-border p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <span className="section-num flex-shrink-0 text-[11px]">
                      {step.num}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base text-primary mb-2">
                        {tr(step.titleKey)}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        {tr(step.descKey)}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {step.detailKeys.map((dk) => (
                          <div
                            key={dk}
                            className="flex items-center gap-2 text-xs text-muted-foreground"
                          >
                            <Check className="w-3.5 h-3.5 text-[#E8272C] flex-shrink-0" />
                            {tr(dk)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech note */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="heading-serif text-2xl font-bold text-primary mb-4">
            {tr("approach.tech.heading")}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            {tr("approach.tech.desc")}
          </p>
          <Button variant="outline" className="text-xs gap-1.5">
            {tr("approach.tech.cta")}{" "}
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </section>
    </div>
  );
}