"use client";

import { useState } from "react";
import {
  BrainCircuit, Swords, Zap, Leaf, TrendingUp, Scale,
  ArrowRight, ArrowLeft, Lock, Search, Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const FOCUS_AREAS = [
  { icon: BrainCircuit, label: "Digital Power & AI", slug: "digital-power-ai" },
  { icon: Swords, label: "Geopolitics & Hard Security", slug: "geopolitics-hard-security" },
  { icon: Zap, label: "Energy & Resources", slug: "energy-resources" },
  { icon: Leaf, label: "Climate, Environment & Food", slug: "climate-environment-food" },
  { icon: TrendingUp, label: "Economy & Competitiveness", slug: "economy-competitiveness" },
  { icon: Scale, label: "Society, Migration & Institutions", slug: "society-migration-institutions" },
];

const MOCK_REPORTS = [
  { id: "1", title: "AI Governance Frameworks for Critical Infrastructure: A D-A-CH Comparative Analysis", section: "Digital Power & AI", date: "2026-06-18", type: "Analysis" },
  { id: "2", title: "SMR Deployment Roadmap: Central Europe's Nuclear Renaissance", section: "Energy & Resources", date: "2026-06-12", type: "Report" },
  { id: "3", title: "Hybrid Threat Landscape Q2 2026: D-A-CH Threat Assessment", section: "Geopolitics & Hard Security", date: "2026-06-05", type: "Intelligence Brief" },
  { id: "4", title: "Cyber-Physical Attack Vectors on Swiss Power Grids", section: "Digital Power & AI", date: "2026-05-28", type: "Technical Report" },
  { id: "5", title: "LNG Terminal Security: Baltic Sea Supply Chain Risk Assessment", section: "Energy & Resources", date: "2026-05-20", type: "Analysis" },
  { id: "6", title: "Migration Pressure Points: Eastern Border Infrastructure Stress Test", section: "Society, Migration & Institutions", date: "2026-05-15", type: "Report" },
  { id: "7", title: "EU Defence Industrial Strategy: Implications for Austrian Procurement", section: "Geopolitics & Hard Security", date: "2026-05-10", type: "Policy Brief" },
  { id: "8", title: "Food Supply Chain Resilience Under Climate Stress Scenarios", section: "Climate, Environment & Food", date: "2026-05-05", type: "Analysis" },
  { id: "9", title: "Economic Coercion Playbook: How Authoritarian States Target D-A-CH Economies", section: "Economy & Competitiveness", date: "2026-04-28", type: "Report" },
];

export function ReportsView() {
  const [showLogin, setShowLogin] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  if (showLogin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          {/* Login card */}
          <div className="border border-border p-8 sm:p-10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7" />
              </div>
              <h1 className="heading-serif text-2xl font-bold text-primary mb-2">Member Access</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                SRC reports are available to members and trial users. New visitors receive
                <span className="font-semibold text-primary"> 10 days of free access</span> to all published reports.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  className="h-10 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Password</label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  className="h-10 text-sm"
                />
              </div>
            </div>

            <Button className="w-full h-10 bg-primary hover:bg-primary/90 text-sm font-medium mb-3">
              Sign In
            </Button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-3 text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-10 text-sm font-medium border-[#E8272C] text-[#E8272C] hover:bg-[#E8272C] hover:text-white"
              onClick={() => setShowLogin(false)}
            >
              Start 10-Day Free Trial
            </Button>

            <p className="text-[10px] text-center text-muted-foreground mt-5 leading-relaxed">
              By signing in or starting a trial, you agree to SRC&apos;s terms of use and privacy policy.
              Trial access is limited to 10 days and includes all published reports.
            </p>
          </div>

          {/* Benefits */}
          <div className="mt-6 border border-border p-5">
            <h3 className="text-xs font-bold tracking-[0.1em] uppercase text-primary mb-3">
              What you get
            </h3>
            <ul className="space-y-2">
              {[
                "Full access to all published reports and analyses",
                "Early access to new publications",
                "PDF downloads and printable formats",
                "Weekly intelligence briefings",
                "Expert Q&A sessions (members)",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E8272C] mt-1 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Report listing (after "login")
  const filtered = activeFilter
    ? MOCK_REPORTS.filter((r) =>
        FOCUS_AREAS.find((fa) => fa.slug === activeFilter)?.label === r.section
      )
    : MOCK_REPORTS;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ArrowLeft className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-primary" />
            <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#E8272C]">
              Reports
            </span>
          </div>
          <h1 className="heading-serif text-2xl sm:text-3xl font-bold text-primary">
            Published Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} publications available
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              className="pl-9 h-9 w-48 sm:w-64 text-sm"
            />
          </div>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5" />
            Filters
          </Button>
        </div>
      </div>

      {/* Section filter pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveFilter(null)}
          className={`px-3 py-1.5 text-[11px] font-medium rounded-sm border transition-colors ${
            !activeFilter
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
          }`}
        >
          All Sections
        </button>
        {FOCUS_AREAS.map((area) => (
          <button
            key={area.slug}
            onClick={() => setActiveFilter(activeFilter === area.slug ? null : area.slug)}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-sm border transition-colors flex items-center gap-1.5 ${
              activeFilter === area.slug
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
            }`}
          >
            <area.icon className="w-3 h-3" />
            {area.label}
          </button>
        ))}
      </div>

      {/* Report list */}
      <div className="space-y-3">
        {filtered.map((report) => (
          <article
            key={report.id}
            className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 p-4 border border-border hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold tracking-[0.08em] uppercase bg-secondary px-2 py-0.5 rounded-sm text-muted-foreground flex-shrink-0">
                  {report.type}
                </span>
                <span className="text-[10px] text-muted-foreground flex-shrink-0">{report.date}</span>
              </div>
              <h3 className="font-semibold text-sm text-primary group-hover:text-[#E8272C] transition-colors leading-snug">
                {report.title}
              </h3>
              <span className="text-[10px] text-muted-foreground mt-1 block">{report.section}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 sm:ml-auto">
              <span className="text-xs text-muted-foreground hidden sm:block">Read</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-[#E8272C] transition-colors" />
            </div>
          </article>
        ))}
      </div>

      {/* Trial banner */}
      <div className="mt-10 bg-secondary/50 border border-border p-6 text-center">
        <p className="text-sm text-muted-foreground mb-3">
          You are currently on a <span className="font-semibold text-primary">10-day free trial</span>.
          <span className="mx-1.5">&middot;</span>
          8 days remaining
        </p>
        <Button className="bg-[#E8272C] hover:bg-[#d02025] text-white text-sm">
          Contact Us for Full Membership
        </Button>
      </div>
    </div>
  );
}