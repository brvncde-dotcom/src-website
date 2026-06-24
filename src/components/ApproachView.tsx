"use client";

import {
  BrainCircuit, ShieldCheck, FileCheck, Users, ArrowRight, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const PRINCIPLES = [
  {
    icon: BrainCircuit,
    title: "AI as Research Accelerator",
    desc: "We deploy a powerful AI engine to rapidly synthesise information from thousands of open-source documents, academic publications, government reports, and news sources. This enables our experts to begin analysis from a foundation of comprehensive, structured research rather than starting from scratch. The AI identifies patterns, connections, and anomalies across datasets that would take human researchers weeks to compile manually.",
  },
  {
    icon: ShieldCheck,
    title: "Expert Validation at Every Stage",
    desc: "Every AI-produced draft undergoes rigorous review by domain specialists with deep knowledge of the specific subject area. Experts challenge assumptions, verify claims against primary sources, add contextual understanding that AI cannot replicate, and identify gaps or biases in the analysis. No publication leaves SRC without at least two independent expert reviews.",
  },
  {
    icon: FileCheck,
    title: "Non-Partisan Editorial Standards",
    desc: "Our editorial process ensures that every publication meets SRC\u2019s standards for factual accuracy, analytical rigour, and political neutrality. Editors review language for implicit bias, verify that conclusions are supported by evidence, and ensure that policy recommendations are balanced and actionable. We never publish analyses that serve any political party, commercial interest, or ideological agenda.",
  },
  {
    icon: Users,
    title: "Human-AI Collaboration, Not Replacement",
    desc: "We view AI as a powerful tool that amplifies human expertise, not a replacement for it. Our methodology is designed to leverage the complementary strengths of both: AI provides speed, breadth, and pattern recognition; humans provide judgment, contextual understanding, ethical reasoning, and accountability. This partnership model allows SRC to produce analyses that are both timely and deeply informed.",
  },
];

const PROCESS_STEPS = [
  {
    num: "01",
    title: "Source Collection",
    desc: "Our AI research engine ingests and structures data from 500+ curated sources across six domains, including government databases, academic repositories, industry reports, and multilingual news sources.",
    details: [
      "500+ curated sources",
      "Real-time monitoring",
      "6 domain-specific collections",
      "Multilingual coverage (DE/FR/EN)",
    ],
  },
  {
    num: "02",
    title: "AI Analysis Draft",
    desc: "The AI engine synthesises collected data into structured analysis drafts, identifying key findings, trend patterns, risk indicators, and cross-domain connections.",
    details: [
      "Structured analysis framework",
      "Cross-domain pattern matching",
      "Risk indicator identification",
      "Trend analysis and forecasting",
    ],
  },
  {
    num: "03",
    title: "Expert Review",
    desc: "Domain specialists review, challenge, and enrich the AI draft. They verify factual claims, add contextual expertise, identify blind spots, and assess analytical soundness.",
    details: [
      "Minimum 2 independent reviewers",
      "Fact-checking against primary sources",
      "Contextual expertise injection",
      "Methodology critique",
    ],
  },
  {
    num: "04",
    title: "Editorial Finalisation",
    desc: "Senior editors review for clarity, accuracy, consistency, and adherence to SRC\u2019s non-partisan standards before publication.",
    details: [
      "Language and bias review",
      "Evidence-chain verification",
      "Policy recommendation review",
      "Final quality assurance",
    ],
  },
];

export function ApproachView() {
  return (
    <div>
      {/* Hero */}
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#E8272C] mb-2 block">
            Methodology
          </span>
          <h1 className="heading-serif text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 max-w-xl">
            AI-Augmented Analysis,
            <br />
            Human-Validated Insight
          </h1>
          <p className="text-sm text-white/60 max-w-lg leading-relaxed">
            SRC pioneered a research methodology that combines the speed of
            artificial intelligence with the judgment of domain experts. The
            result: timely, rigorous, and actionable analysis that no purely
            human or purely automated approach can achieve alone.
          </p>
        </div>
      </div>

      {/* Principles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#E8272C] mb-2 block">
            Core Principles
          </span>
          <h2 className="heading-serif text-2xl sm:text-3xl font-bold text-primary">
            How We Work
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PRINCIPLES.map((p) => (
            <div
              key={p.title}
              className="border border-border p-6 hover:border-primary/20 transition-colors"
            >
              <div className="w-10 h-10 bg-secondary flex items-center justify-center rounded-sm mb-4">
                <p.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-base text-primary mb-2">
                {p.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {p.desc}
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
              From Source to Publication
            </span>
            <h2 className="heading-serif text-2xl sm:text-3xl font-bold text-primary">
              The Production Pipeline
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
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        {step.desc}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {step.details.map((d) => (
                          <div
                            key={d}
                            className="flex items-center gap-2 text-xs text-muted-foreground"
                          >
                            <Check className="w-3.5 h-3.5 text-[#E8272C] flex-shrink-0" />
                            {d}
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

      {/* Tech note — generic, no brand name */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="heading-serif text-2xl font-bold text-primary mb-4">
            Powered by Advanced AI
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            SRC uses a state-of-the-art large language model as its primary AI
            research engine. The system was selected for its strong multilingual
            capabilities — critical for D-A-CH analysis — its ability to process
            and synthesise long-form documents, and its capacity for structured
            analytical output that integrates seamlessly into human expert
            workflows. Our AI engine enables SRC to monitor and analyse
            developments across all six focus areas in near real-time, producing
            draft analyses that serve as the starting point — not the end
            product — of our research process.
          </p>
          <Button variant="outline" className="text-xs gap-1.5">
            Learn more about our technology{" "}
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </section>
    </div>
  );
}