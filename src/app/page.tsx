"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Shield,
  Zap,
  ArrowRight,
  ArrowUpRight,
  ArrowDown,
  Calendar,
  Send,
  Menu,
  X,
  Languages,
  Star,
  Activity,
  Globe,
  ShieldCheck,
  Target,
  Eye,
  Network,
  Briefcase,
  Megaphone,
  BrainCircuit,
  Swords,
  Users,
  Leaf,
  TrendingUp,
  Scale,
} from "lucide-react";

const NAV_ITEMS = [
  "About",
  "Focus Areas",
  "Competence Circles",
  "Publications",
  "Expert Panel",
  "Contact",
];

const FOCUS_AREAS = [
  {
    icon: BrainCircuit,
    num: "01",
    title: "Digital Power & AI",
    desc: "AI strategy, digital infrastructure, digital sovereignty, cybersecurity and critical digital infrastructure.",
    tag: "digital-power-ai",
  },
  {
    icon: Swords,
    num: "02",
    title: "Geopolitics & Hard Security",
    desc: "Great-power competition, D-A-CH foreign policy, NATO/EU defence posture, military readiness and hybrid threats.",
    tag: "geopolitics-hard-security",
  },
  {
    icon: Zap,
    num: "03",
    title: "Energy & Resources",
    desc: "Energy security, nuclear/SMR, LNG diversification, grid stability and critical minerals supply.",
    tag: "energy-resources",
  },
  {
    icon: Leaf,
    num: "04",
    title: "Climate, Environment & Food",
    desc: "Climate policy, decarbonisation, environmental security, agriculture and food systems resilience.",
    tag: "climate-environment-food",
  },
  {
    icon: TrendingUp,
    num: "05",
    title: "Economy & Competitiveness",
    desc: "Deindustrialisation, industrial relocation, economic security and supply-chain resilience.",
    tag: "economy-competitiveness",
  },
  {
    icon: Scale,
    num: "06",
    title: "Society, Migration & Institutions",
    desc: "Migration, demographics, social cohesion, institutional resilience and information warfare.",
    tag: "society-migration-institutions",
  },
];

const CIRCLES = [
  {
    icon: BrainCircuit,
    title: "Circle I — Digital Power & AI",
    desc: "AI strategy, digital infrastructure, digital sovereignty and cybersecurity.",
    focus:
      "AI governance, zero-trust architectures, critical digital infrastructure resilience, digital sovereignty, cyber defence.",
  },
  {
    icon: Swords,
    title: "Circle II — Geopolitics & Hard Security",
    desc: "Great-power competition, defence posture and hybrid threats.",
    focus:
      "NATO/EU defence posture, military readiness, D-A-CH foreign policy alignment, hybrid and coercive threat analysis.",
  },
  {
    icon: Zap,
    title: "Circle III — Energy & Resources",
    desc: "Energy security, critical minerals and supply-chain resilience.",
    focus:
      "Nuclear/SMR deployment, LNG diversification, grid stability, critical minerals supply, geopolitical independence.",
  },
  {
    icon: Leaf,
    title: "Circle IV — Climate, Environment & Food",
    desc: "Climate policy, environmental security and food systems.",
    focus:
      "Decarbonisation pathways, environmental security, agriculture resilience, food systems, water infrastructure.",
  },
  {
    icon: TrendingUp,
    title: "Circle V — Economy & Competitiveness",
    desc: "Economic security, industrial policy and supply-chain resilience.",
    focus:
      "Deindustrialisation risks, industrial relocation, economic coercion, supply-chain resilience, D-A-CH competitiveness.",
  },
  {
    icon: Scale,
    title: "Circle VI — Society, Migration & Institutions",
    desc: "Social cohesion, migration, demographics and institutional resilience.",
    focus:
      "Migration policy, demographic trends, social cohesion, institutional capture, information warfare, democratic resilience.",
  },
];

const SECTION_LABELS: Record<string, string> = {
  "digital-power-ai": "Digital Power & AI",
  "geopolitics-hard-security": "Geopolitics & Hard Security",
  "energy-resources": "Energy & Resources",
  "climate-environment-food": "Climate, Environment & Food",
  "economy-competitiveness": "Economy & Competitiveness",
  "society-migration-institutions": "Society, Migration & Institutions",
};

interface DbReport {
  id: string;
  title: string;
  summary: string | null;
  type: string;
  section: string;
  status: string;
  author: string | null;
  publishedAt: string | null;
  createdAt: string;
}

const EXPERTS = [
  {
    initials: "BR",
    name: "Dr. Bernd R.",
    role: "President",
    desc: "Expert in strategic security policy and geopolitical risk assessment with 25+ years of experience.",
  },
  {
    initials: "MK",
    name: "Prof. Dr. Maria K.",
    role: "VP Research",
    desc: "Professor of energy systems engineering, focusing on grid resilience and storage technologies.",
  },
  {
    initials: "TH",
    name: "Thomas H.",
    role: "VP Operations",
    desc: "Former CISO with deep expertise in critical infrastructure protection and cyber defence.",
  },
  {
    initials: "AW",
    name: "Dr. Anna W.",
    role: "Head of Analysis",
    desc: "Political scientist specialising in migration, demographics and social cohesion in Europe.",
  },
];

const FAQ_ITEMS = [
  {
    q: "What is the SRC?",
    a: "The SRC — Security & Resilience Counsel (Switzerland – Germany – Austria) is a non-partisan, fact-based think tank founded in autumn 2022. We bring together experts from various fields related to critical infrastructures to develop well-founded concepts for secure, reliable and protected systems.",
  },
  {
    q: "Is the SRC politically neutral?",
    a: "Yes. The SRC is strictly non-partisan and politically neutral. Our analyses and recommendations are based exclusively on facts, scientific evidence and expert assessments — never on ideological positions or political preferences.",
  },
  {
    q: "How can I get involved?",
    a: "We welcome contact from professionals, decision-makers and multipliers. Whether you are an expert in one of our focus areas, a decision-maker from politics or business, or a media representative — we look forward to hearing from you through our contact form.",
  },
  {
    q: "Which topics does the SRC cover?",
    a: "The SRC covers six central focus areas: Digital Power & AI, Geopolitics & Hard Security, Energy & Resources, Climate, Environment & Food, Economy & Competitiveness, and Society, Migration & Institutions. Each area is supported by a dedicated Circle of Competence with specialised experts.",
  },
];

/* ── Section header with red number badge ── */
function SectionLabel({ num, label }: { num: string; label: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="section-num">{num}</span>
      <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground font-semibold">
        {label}
      </span>
    </div>
  );
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [publications, setPublications] = useState<DbReport[]>([]);

  useEffect(() => {
    fetch("/api/reports?limit=10")
      .then((res) => res.json())
      .then((data) => setPublications(data.reports || []))
      .catch(() => {});
  }, []);

  const displayPubs =
    publications.length > 0
      ? publications
      : [
          // Fallback placeholder when no DB reports are published yet
          {
            id: "placeholder-1",
            type: "Analysis",
            section: "energy",
            title: "Power Supply Redundancy in Switzerland: Critical Infrastructure for Data Centers",
            summary: "An analysis of Switzerland's power supply architecture and its vulnerabilities in the context of growing data centre demand.",
            author: "SRC Expert Panel",
            publishedAt: "2026-06-22T10:00:00.000Z",
            createdAt: "2026-06-22T10:00:00.000Z",
            status: "published",
          },
          {
            id: "placeholder-2",
            type: "Strategy Paper",
            section: "ai-digital-infrastructure",
            title: "Zero-Trust Architecture for D-A-CH Government Networks",
            summary: "A strategic framework for implementing zero-trust security models across government ICT infrastructure in the D-A-CH region.",
            author: "SRC Board",
            publishedAt: "2026-06-15T10:00:00.000Z",
            createdAt: "2026-06-15T10:00:00.000Z",
            status: "published",
          },
          {
            id: "placeholder-3",
            type: "Statement",
            section: "agriculture",
            title: "Food Supply Chain Resilience: Lessons from Recent Disruptions",
            summary: "An examination of vulnerabilities in the D-A-CH food supply chain and policy recommendations for increasing resilience.",
            author: "SRC Expert Panel",
            publishedAt: "2026-06-08T10:00:00.000Z",
            createdAt: "2026-06-08T10:00:00.000Z",
            status: "published",
          },
        ];

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id.toLowerCase().replace(/\s+/g, "-"));
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Swiss Red Stripe — top of page */}
      <div className="swiss-stripe" />

      {/* ──────────────── HEADER ──────────────── */}
      <header className="fixed top-[3px] inset-x-0 z-40 bg-white/95 backdrop-blur-sm border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex h-[72px] items-center justify-between">
            {/* Logo */}
            <button
              className="flex items-center gap-3 group"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <Image
                src="/logo.png"
                alt="SRC Logo"
                width={38}
                height={38}
                className="object-contain"
              />
              <div className="text-left leading-tight">
                <div className="font-bold tracking-tight text-[15px] text-foreground">
                  SRC
                </div>
                <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
                  Security &amp; Resilience Counsel
                </div>
              </div>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item}
                  className="px-4 py-2 text-[13px] text-muted-foreground hover:text-primary font-medium transition-colors"
                  onClick={() => scrollToSection(item)}
                >
                  {item}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="hidden lg:inline-flex gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary"
                aria-label="Toggle language"
              >
                <Languages className="h-3.5 w-3.5" />
                <span className="uppercase">en</span>
              </Button>
              <Button
                size="sm"
                className="hidden lg:inline-flex bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs uppercase tracking-wider"
                onClick={() => scrollToSection("Contact")}
              >
                Contact
              </Button>
              <button
                className="lg:hidden p-2 hover:text-primary transition-colors"
                aria-label="Menu"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-border py-4 space-y-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item}
                  className="block w-full text-left px-4 py-3 text-sm text-muted-foreground hover:text-primary hover:bg-accent transition-colors font-medium"
                  onClick={() => scrollToSection(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* ===================== HERO ===================== */}
        <section className="pt-32 pb-20 sm:pt-40 sm:pb-28">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="max-w-3xl">
              {/* Eyebrow */}
              <div className="flex items-center gap-3 mb-8">
                <div className="h-8 w-[3px] bg-[#E8272C]" />
                <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground font-semibold">
                  Security &amp; Resilience Counsel — D-A-CH
                </span>
              </div>

              {/* Headline — serif for institutional authority */}
              <h1 className="heading-serif text-balance text-[2.5rem] sm:text-5xl lg:text-[3.75rem] font-bold tracking-tight leading-[1.1] text-foreground">
                The leading think tank for security and resilience of critical
                infrastructure
              </h1>

              {/* Subhead */}
              <p className="mt-8 text-pretty text-lg text-muted-foreground leading-relaxed max-w-2xl">
                A non-partisan, fact-based initiative of experts from
                Switzerland, Germany and Austria. We develop well-founded
                concepts for secure, reliable and protected critical
                infrastructures.
              </p>

              {/* CTAs */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/reports"
                  className="inline-flex items-center bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm uppercase tracking-wider px-8 h-12 rounded-[var(--radius)] transition-colors"
                >
                  View Publications
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-border text-foreground hover:border-primary hover:text-primary font-semibold text-sm uppercase tracking-wider px-8 h-12"
                  onClick={() => scrollToSection("involve")}
                >
                  Get Involved
                  <ArrowDown className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Stats — clean institutional style */}
            <div className="mt-20 pt-12 border-t border-border">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12">
                {[
                  { icon: Activity, label: "Founded", value: "Autumn 2022" },
                  { icon: Globe, label: "D-A-CH Countries", value: "3" },
                  { icon: ShieldCheck, label: "Focus Sectors", value: "6" },
                  { icon: ShieldCheck, label: "Circles of Competence", value: "6" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <stat.icon className="h-4 w-4" />
                      <span className="text-[10px] uppercase tracking-[0.18em] font-semibold">
                        {stat.label}
                      </span>
                    </div>
                    <div className="heading-serif text-3xl sm:text-4xl font-bold tracking-tight text-primary">
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===================== ABOUT ===================== */}
        <section id="about" className="section-divider">
          <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 sm:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              <div className="lg:col-span-5">
                <SectionLabel num="01" label="About the SRC" />
                <h2 className="heading-serif mt-6 text-3xl sm:text-4xl font-bold tracking-tight text-balance leading-tight">
                  360° view and systemic thinking
                </h2>
                <div className="mt-8 inline-flex items-center gap-3 px-5 py-3.5 border border-border rounded-sm bg-secondary">
                  <Network className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-xs uppercase tracking-[0.18em] font-semibold text-foreground">
                    360° · systemic · fact-based
                  </span>
                </div>
              </div>
              <div className="lg:col-span-7 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="card-institutional p-6 h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-9 w-9 bg-primary rounded-sm flex items-center justify-center text-white">
                        <Target className="h-4 w-4" />
                      </div>
                      <h3 className="font-bold text-sm uppercase tracking-wider">
                        Mission
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      The SRC – Security &amp; Resilience Counsel (Switzerland –
                      Germany – Austria) was founded in autumn 2022 with the aim
                      of bringing together experts in various fields related to
                      &quot;critical infrastructures&quot;. Critical infrastructures
                      in a broader sense range from energy supply to ICT
                      (information and communication technologies) as well as
                      food and water reserves.
                    </p>
                  </div>
                  <div className="card-institutional p-6 h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-9 w-9 bg-primary rounded-sm flex items-center justify-center text-white">
                        <Eye className="h-4 w-4" />
                      </div>
                      <h3 className="font-bold text-sm uppercase tracking-wider">
                        Vision
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      We are driven by the strong will to preserve our democracy,
                      our constitution and the society that our ancestors created
                      and in many cases fought for. In order to preserve and
                      further improve our democratic structures, it is essential
                      to speak truthfully about facts. We believe in genuine,
                      unadulterated science (&quot;science not scientism&quot;) and
                      facts.
                    </p>
                  </div>
                </div>
                <div className="card-institutional p-8">
                  <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground font-semibold mb-4">
                    Our Approach
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We live in an extremely interconnected world and must
                    therefore think and act in a networked, systemic and holistic
                    way. Interference with energy supply has massive effects on
                    other areas such as agriculture. Careful and forward-looking
                    planning has become a matter of war and peace in the current
                    geopolitical situation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== FOCUS AREAS ===================== */}
        <section id="focus" className="bg-secondary">
          <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 sm:py-32">
            <div className="max-w-2xl mb-14">
              <SectionLabel num="02" label="Focus Areas" />
              <h2 className="heading-serif mt-6 text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                Six central focus areas for the security and resilience of the
                D-A-CH region
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FOCUS_AREAS.map((area) => (
                <article
                  key={area.num}
                  className="card-institutional group p-7 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="h-12 w-12 bg-primary rounded-sm flex items-center justify-center text-white">
                      <area.icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs text-muted-foreground font-semibold tracking-wider">
                      {area.num}
                    </span>
                  </div>
                  <h3 className="font-bold text-base mb-3 tracking-tight">
                    {area.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {area.desc}
                  </p>
                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-muted-foreground">
                      {SECTION_LABELS[area.tag] || area.tag}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-[#E8272C] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== CIRCLES ===================== */}
        <section id="circles" className="section-divider">
          <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 sm:py-32">
            <div className="max-w-3xl mb-14">
              <SectionLabel num="03" label="Circles of Competence" />
              <h2 className="heading-serif mt-6 text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                Circles of Competence
              </h2>
              <p className="mt-5 text-muted-foreground leading-relaxed">
                For each topic we create a &quot;Circle of Competence&quot; whose
                members meet regularly in person or virtually. In parallel, we
                operate a digital workspace to collect data and information and
                to develop innovative solutions.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CIRCLES.map((circle) => (
                <article
                  key={circle.title}
                  className="card-institutional group p-8"
                >
                  <div className="flex items-start gap-5">
                    <div className="h-11 w-11 bg-primary rounded-sm flex items-center justify-center text-white shrink-0">
                      <circle.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base mb-2 tracking-tight">
                        {circle.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        {circle.desc}
                      </p>
                      <div className="pt-4 border-t border-border">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-2">
                          Focus
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {circle.focus}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== PUBLICATIONS ===================== */}
        <section id="publications" className="bg-secondary">
          <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 sm:py-32">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14">
              <div className="max-w-2xl">
                <SectionLabel num="04" label="Publications & Analyses" />
                <h2 className="heading-serif mt-6 text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                  Fact-based analyses, strategies and statements
                </h2>
              </div>
            </div>
            <div className="space-y-4">
              {displayPubs.map((pub) => (
                <Link
                  key={pub.id}
                  href={pub.id.startsWith("placeholder") ? "#" : `/reports/${pub.id}`}
                  className="block"
                >
                <article
                  className="card-institutional group p-6 cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                    <span className="inline-flex items-center justify-center bg-primary text-white px-3 py-1 text-[10px] uppercase tracking-wider font-bold w-fit rounded-sm">
                      {pub.type}
                    </span>
                    <span className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      {pub.publishedAt
                        ? new Date(pub.publishedAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : new Date(pub.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:ml-auto font-semibold">
                      {SECTION_LABELS[pub.section] || pub.section}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg leading-snug tracking-tight mb-2 group-hover:text-primary transition-colors">
                    {pub.title}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">
                      {pub.summary || pub.title}
                    </p>
                    <span className="text-xs text-muted-foreground inline-flex items-center gap-1 group-hover:text-[#E8272C] transition-colors shrink-0 font-semibold">
                      Read
                      <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </span>
                  </div>
                </article>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center sm:text-right">
              <Link
                href="/reports"
                className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-[#0A2540] transition-colors"
              >
                View all reports
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ===================== EXPERT PANEL ===================== */}
        <section id="team" className="section-divider">
          <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 sm:py-32">
            <div className="max-w-3xl mb-14">
              <SectionLabel num="05" label="Expert Panel" />
              <h2 className="heading-serif mt-6 text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                Expert Panel
              </h2>
              <p className="mt-5 text-muted-foreground leading-relaxed">
                Experienced pragmatists from science, business, ICT and energy —
                fearless and fact-based.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {EXPERTS.map((expert) => (
                <article
                  key={expert.initials}
                  className="card-institutional group p-8"
                >
                  <div className="h-14 w-14 bg-primary rounded-sm flex items-center justify-center text-sm font-bold text-white mb-5 tracking-wide">
                    {expert.initials}
                  </div>
                  <h3 className="font-bold text-base tracking-tight">
                    {expert.name}
                  </h3>
                  <div className="text-xs text-[#E8272C] uppercase tracking-[0.14em] mt-1.5 mb-4 font-semibold">
                    {expert.role}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {expert.desc}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== GET INVOLVED ===================== */}
        <section id="involve" className="bg-secondary">
          <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 sm:py-32">
            <div className="max-w-3xl mb-14">
              <SectionLabel num="06" label="Get Involved" />
              <h2 className="heading-serif mt-6 text-3xl sm:text-4xl font-bold tracking-tight text-balance leading-tight">
                Want to learn more or join us?
              </h2>
              <p className="mt-5 text-muted-foreground leading-relaxed">
                The SRC addresses professionals, decision-makers and multipliers.
                We welcome direct contact.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Users,
                  title: "Professionals",
                  desc: "We actively approach experts and pragmatists in the respective subject areas and welcome direct contact from interested professionals.",
                },
                {
                  icon: Briefcase,
                  title: "Decision-makers",
                  desc: "Decision-makers from politics, business and society are very welcome. We look forward to a lively exchange of views on our analyses, facts and strategies.",
                },
                {
                  icon: Megaphone,
                  title: "Multipliers",
                  desc: "We welcome the dissemination of our analyses and strategies by multipliers from science, professional circles and the media. We expect a fair examination of our proposals.",
                },
              ].map((item) => (
                <article
                  key={item.title}
                  className="card-institutional group p-8 flex flex-col"
                >
                  <div className="h-11 w-11 bg-primary rounded-sm flex items-center justify-center text-white mb-5">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-base tracking-tight mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    {item.desc}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-6 -ml-2 self-start group hover:text-primary font-medium"
                    onClick={() => scrollToSection("Contact")}
                  >
                    Get in touch
                    <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== FAQ ===================== */}
        <section className="section-divider">
          <div className="mx-auto max-w-3xl px-6 lg:px-10 py-24 sm:py-32">
            <div className="mb-12">
              <SectionLabel num="07" label="FAQ" />
              <h2 className="heading-serif mt-6 text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="divide-y divide-border border border-border rounded-sm">
              {FAQ_ITEMS.map((item, i) => (
                <div key={i} className="px-6">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem key={i} value={`item-${i}`} className="border-b-0">
                      <AccordionTrigger className="text-left text-base font-semibold hover:no-underline py-5 hover:text-primary transition-colors">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== CONTACT ===================== */}
        <section id="contact" className="bg-secondary">
          <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 sm:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div>
                <SectionLabel num="08" label="Contact" />
                <h2 className="heading-serif mt-6 text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                  Contact
                </h2>
                <p className="mt-5 text-muted-foreground leading-relaxed">
                  Write to us — we usually respond within 48 hours.
                </p>
                <div className="mt-10 space-y-6 text-sm">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-semibold mb-1">
                      Initiative
                    </div>
                    <div className="font-medium">
                      SRC — Security &amp; Resilience Counsel
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-semibold mb-1">
                      Region
                    </div>
                    <div className="font-medium">
                      Switzerland · Germany · Austria
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-semibold mb-1">
                      Orientation
                    </div>
                    <div className="font-medium">
                      Non-partisan · Politically neutral · Fact-based
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-institutional bg-white p-8">
                <form
                  className="space-y-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider">
                        Name *
                      </Label>
                      <Input id="name" required maxLength={120} className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        maxLength={160}
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="org" className="text-xs font-semibold uppercase tracking-wider">
                        Organization
                      </Label>
                      <Input id="org" maxLength={200} className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-xs font-semibold uppercase tracking-wider">
                        Role
                      </Label>
                      <Input
                        id="role"
                        maxLength={200}
                        placeholder="e.g. Expert, Decision-maker"
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-xs font-semibold uppercase tracking-wider">
                      Subject
                    </Label>
                    <Input id="subject" maxLength={200} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-xs font-semibold uppercase tracking-wider">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      required
                      maxLength={5000}
                      rows={5}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm uppercase tracking-wider px-8 h-11"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ===================== FOOTER ===================== */}
      <footer className="bg-[#0A2540] text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Image
                  src="/logo.png"
                  alt="SRC Logo"
                  width={32}
                  height={32}
                  className="object-contain brightness-0 invert"
                />
                <div className="leading-tight">
                  <div className="font-bold text-sm text-white">SRC</div>
                  <div className="text-[9px] uppercase tracking-[0.2em] text-white/50 font-medium">
                    Security &amp; Resilience
                  </div>
                </div>
              </div>
              <p className="text-xs text-white/50 leading-relaxed max-w-sm">
                Security and resilience for the D-A-CH region. Non-partisan,
                fact-based, neutral.
              </p>
            </div>
            <div className="text-xs">
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/40 mb-4 font-semibold">
                Navigation
              </div>
              <ul className="space-y-2">
                {NAV_ITEMS.map((item) => (
                  <li key={item}>
                    <button
                      className="text-white/60 hover:text-white transition-colors"
                      onClick={() => scrollToSection(item)}
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-xs">
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/40 mb-4 font-semibold">
                Legal
              </div>
              <ul className="space-y-2 text-white/60">
                <li className="hover:text-white transition-colors cursor-pointer">Imprint</li>
                <li className="hover:text-white transition-colors cursor-pointer">Privacy</li>
                <li className="mt-4 text-white/40">© 2026 SRC. All rights reserved.</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}