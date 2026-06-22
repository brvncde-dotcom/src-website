"use client";

import Image from "next/image";
import { useState } from "react";
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
  Server,
  Zap,
  Wheat,
  Users,
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
    icon: Server,
    num: "01",
    title: "ICT & Cloud Services",
    desc: "Secure information and communication technologies, IoT, supply chain and resilient, redundant systems.",
    tag: "ict",
  },
  {
    icon: Zap,
    num: "02",
    title: "Energy Generation & Supply",
    desc: "Secure, redundant and affordable energy supply as the foundation of all critical infrastructures.",
    tag: "energy",
  },
  {
    icon: Wheat,
    num: "03",
    title: "Agriculture & Food",
    desc: "Food and water supply, logistical chains and fertiliser supply as critical lifelines.",
    tag: "agriculture",
  },
  {
    icon: Users,
    num: "04",
    title: "Migration & Demographics",
    desc: "Demographic developments, migration and social resilience as strategic cross-cutting issues.",
    tag: "migration",
  },
];

const CIRCLES = [
  {
    icon: Server,
    title: "Circle I — ICT & Cloud",
    desc: "Information and communication technology, secure cloud services, IoT supply chain.",
    focus:
      "Resilient & redundant ICT systems, supply chain security, zero-trust architectures, data centre blackout prevention.",
  },
  {
    icon: Zap,
    title: "Circle II — Energy",
    desc: "Energy generation, supply and security in the D-A-CH region.",
    focus:
      "Security of supply, storage technologies, grid expansion planning, redundancy, geopolitical independence.",
  },
  {
    icon: Wheat,
    title: "Circle III — Agriculture",
    desc: "Food and water supply, logistics chains and fertilisers.",
    focus:
      "Supply resilience, water infrastructure, regional autarky, logistics chains.",
  },
  {
    icon: Users,
    title: "Circle IV — Migration & Demographics",
    desc: "Demographic development and social resilience.",
    focus:
      "Securing skilled labour, integration strategies, social cohesion, regional development.",
  },
];

const PUBLICATIONS = [
  {
    type: "Analysis",
    date: "22 Jun 2026",
    tag: "energy",
    title: "Power Supply Redundancy in Switzerland: Critical Infrastructure for Data Centers",
    desc: "Swiss data centers require robust redundant power supply systems to ensure continuous availability of critical services and minimize failure risks.",
    author: "SRC Expert Panel",
  },
  {
    type: "Report",
    date: "10 Mar 2025",
    tag: "energy",
    title: "Energy independence of the D-A-CH region — strategic options",
    desc: "A fact-based analysis of security of supply, storage technologies and geopolitical dependencies.",
    author: "Circle II — Energy",
  },
  {
    type: "Statement",
    date: "5 Feb 2025",
    tag: null,
    title: "Science not Scientism — For an open scientific debate",
    desc: "Ideologies and the refusal to consider other opinions have repeatedly culminated in catastrophe in the past.",
    author: "SRC Board",
  },
  {
    type: "Brief",
    date: "20 Jan 2025",
    tag: "ict",
    title: "Brownout and blackout prevention in data centres",
    desc: "Even a single day of standstill of central ICT systems leads to chaos that is difficult to control.",
    author: "Circle I — ICT & Cloud",
  },
  {
    type: "Analysis",
    date: "15 Nov 2024",
    tag: "energy",
    title: "The 360° view on critical infrastructures",
    desc: "Why networked, systemic thinking has become a matter of war and peace in the current geopolitical situation.",
    author: "SRC Expert Panel",
  },
];

const EXPERTS = [
  {
    initials: "MB",
    name: "Dr. rer. nat. M. Breu",
    role: "Chairman & Co-Founder",
    desc: "Long-standing expert in ICT security and resilient critical infrastructures. Over 25 years of experience in international technology and consulting companies.",
  },
  {
    initials: "AS",
    name: "Dr. phil. A. Steiner",
    role: "Co-Founder & Strategy Advisor",
    desc: "Strategy consultant with a focus on social resilience, demographics and migration policy concepts.",
  },
  {
    initials: "TH",
    name: "Prof. Dr.-Ing. T. Hofer",
    role: "Lead Energy Circle",
    desc: "Professor of energy systems and security of supply. Research focus: resilient grids and storage technologies.",
  },
  {
    initials: "CA",
    name: "Dipl.-Inf. C. Aebi",
    role: "Lead ICT & Cloud Circle",
    desc: "Expert in cloud architectures, zero-trust and supply-chain security in large ICT infrastructures.",
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
    a: "The SRC covers four central focus areas: ICT & Cloud Services, Energy Generation & Supply, Agriculture & Food, and Migration & Demographics. Each area is supported by a dedicated Circle of Competence with specialised experts.",
  },
];

function SectionLabel({
  num,
  label,
}: {
  num: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-xs text-accent">{num}</span>
      <span className="h-px w-8 bg-accent/40" />
      <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id.toLowerCase().replace(/\s+/g, "-"));
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-40 transition-all duration-300 bg-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <button
              className="flex items-center gap-2.5 group"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <Image
                src="/logo.png"
                alt="SRC Logo"
                width={36}
                height={36}
                className="rounded-md object-contain"
              />
              <div className="text-left leading-tight">
                <div className="font-semibold tracking-tight text-sm">
                  SRC
                </div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Security &amp; Resilience
                </div>
              </div>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item}
                  className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-md transition-colors"
                  onClick={() => scrollToSection(item)}
                >
                  {item}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="hidden md:inline-flex gap-1.5"
                aria-label="Toggle language"
              >
                <Languages className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase">en</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hidden md:inline-flex gap-1.5"
              >
                <Star className="h-3.5 w-3.5" />
                <span className="text-xs">GLM Studio</span>
              </Button>
              <Button
                size="sm"
                className="hidden md:inline-flex"
                onClick={() => scrollToSection("Contact")}
              >
                Contact
              </Button>
              <button
                className="md:hidden p-2 rounded-md hover:bg-accent/10"
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
            <div className="md:hidden border-t border-border/40 py-4 space-y-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item}
                  className="block w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-md transition-colors"
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
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
          <div className="absolute inset-0 -z-10 bg-grid opacity-60" />
          <div className="absolute inset-0 -z-10 bg-radial-fade" />
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent -z-10" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/5 text-xs text-accent-foreground mb-6">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 animate-ping" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                </span>
                <span className="font-mono uppercase tracking-[0.16em] text-[10px]">
                  Security &amp; Resilience Counsel — D-A-CH
                </span>
              </div>

              <h1 className="text-balance text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
                The leading think tank for security and resilience of critical
                infrastructure
              </h1>

              <p className="mt-6 text-pretty text-lg text-muted-foreground leading-relaxed max-w-2xl">
                A non-partisan, fact-based initiative of experts from
                Switzerland, Germany and Austria. We develop well-founded
                concepts for secure, reliable and protected critical
                infrastructures.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="group"
                  onClick={() => scrollToSection("Publications")}
                >
                  View Publications
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="group"
                  onClick={() => scrollToSection("Get Involved")}
                >
                  Get Involved
                  <ArrowDown className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                </Button>
              </div>

              <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                  {
                    icon: Activity,
                    label: "Founded",
                    value: "Autumn 2022",
                  },
                  {
                    icon: Globe,
                    label: "D-A-CH Countries",
                    value: "3",
                  },
                  {
                    icon: ShieldCheck,
                    label: "Focus Sectors",
                    value: "4",
                  },
                  {
                    icon: ShieldCheck,
                    label: "Circles of Competence",
                    value: "4",
                  },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <stat.icon className="h-3.5 w-3.5" />
                      <span className="text-[10px] uppercase tracking-[0.14em]">
                        {stat.label}
                      </span>
                    </div>
                    <div className="text-2xl font-semibold tracking-tight">
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section
          id="about"
          className="py-20 sm:py-28 border-t border-border/40"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-5">
                <SectionLabel num="01" label="About the SRC" />
                <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
                  360° view and systemic thinking
                </h2>
                <div className="mt-6 inline-flex items-center gap-3 px-4 py-3 rounded-lg border border-accent/30 bg-accent/5">
                  <Network className="h-5 w-5 text-accent" />
                  <span className="text-xs uppercase tracking-[0.16em] font-mono text-accent-foreground">
                    360° · systemic · fact-based
                  </span>
                </div>
              </div>
              <div className="lg:col-span-7 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-border/60 bg-card/40 p-5 h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-7 w-7 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                        <Target className="h-4 w-4" />
                      </div>
                      <h3 className="font-semibold text-sm">Mission</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-6">
                      The SRC – Security &amp; Resilience Counsel (Switzerland –
                      Germany – Austria) was founded in autumn 2022 with the aim
                      of bringing together experts in various fields related to
                      &quot;critical infrastructures&quot;. Critical infrastructures
                      in a broader sense range from energy supply to ICT
                      (information and communication technologies) as well as
                      food and water reserves.
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-card/40 p-5 h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-7 w-7 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                        <Eye className="h-4 w-4" />
                      </div>
                      <h3 className="font-semibold text-sm">Vision</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-6">
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
                <div className="rounded-lg border border-border/60 bg-card/40 p-6">
                  <div className="text-xs uppercase tracking-[0.16em] font-mono text-muted-foreground mb-3">
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

        {/* Focus Areas Section */}
        <section
          id="focus"
          className="py-20 sm:py-28 border-t border-border/40"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <SectionLabel num="02" label="Focus Areas" />
              <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">
                Four central focus areas for the security and resilience of the
                D-A-CH region
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {FOCUS_AREAS.map((area) => (
                <article
                  key={area.num}
                  className="group relative rounded-xl border border-border/60 bg-card/30 p-6 hover:border-accent/40 hover:bg-accent/5 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center">
                      <area.icon className="h-5 w-5 text-accent" />
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {area.num}
                    </span>
                  </div>
                  <h3 className="font-semibold text-base mb-2 tracking-tight">
                    {area.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {area.desc}
                  </p>
                  <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.16em] font-mono text-muted-foreground">
                      {area.tag}
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Circles Section */}
        <section
          id="circles"
          className="py-20 sm:py-28 border-t border-border/40 relative overflow-hidden"
        >
          <div className="absolute -top-32 right-0 h-72 w-72 rounded-full bg-accent/5 blur-3xl -z-10" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12">
              <SectionLabel num="03" label="Circles of Competence" />
              <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">
                Circles of Competence
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                For each topic we create a &quot;Circle of Competence&quot; whose
                members meet regularly in person or virtually. In parallel, we
                operate a digital workspace to collect data and information and
                to develop innovative solutions.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CIRCLES.map((circle) => (
                <article
                  key={circle.title}
                  className="relative rounded-xl border border-border/60 bg-card/30 p-6 hover:border-accent/40 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                      <circle.icon className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base mb-1.5 tracking-tight">
                        {circle.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {circle.desc}
                      </p>
                      <div className="pt-3 border-t border-border/40">
                        <div className="text-[10px] uppercase tracking-[0.16em] font-mono text-muted-foreground mb-1">
                          Focus
                        </div>
                        <p className="text-xs text-muted-foreground/90 leading-relaxed">
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

        {/* Publications Section */}
        <section
          id="publications"
          className="py-20 sm:py-28 border-t border-border/40"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
              <div className="max-w-2xl">
                <SectionLabel num="04" label="Publications & Analyses" />
                <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">
                  Fact-based analyses, strategies and statements from our
                  Circles of Competence
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {PUBLICATIONS.map((pub, i) => (
                <article
                  key={i}
                  className="group rounded-xl border border-border/60 bg-card/30 p-6 hover:border-accent/40 hover:bg-accent/5 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-[10px] uppercase tracking-wider font-mono">
                      {pub.type}
                    </span>
                    <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {pub.date}
                    </span>
                    {pub.tag && (
                      <span className="text-[10px] uppercase tracking-[0.14em] font-mono text-muted-foreground ml-auto">
                        {pub.tag}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg leading-snug tracking-tight mb-2 group-hover:text-accent transition-colors">
                    {pub.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {pub.desc}
                  </p>
                  <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                      <Users className="h-3 w-3" />
                      {pub.author}
                    </span>
                    <span className="text-xs text-muted-foreground inline-flex items-center gap-1 group-hover:text-accent transition-colors">
                      Read
                      <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Expert Panel Section */}
        <section id="team" className="py-20 sm:py-28 border-t border-border/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12">
              <SectionLabel num="05" label="Expert Panel" />
              <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">
                Expert Panel
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Experienced pragmatists from science, business, ICT and energy —
                fearless and fact-based.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {EXPERTS.map((expert) => (
                <article
                  key={expert.initials}
                  className="group rounded-xl border border-border/60 bg-card/30 p-6 hover:border-accent/40 hover:bg-accent/5 transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/20 flex items-center justify-center font-mono text-sm font-semibold text-accent">
                      {expert.initials}
                    </div>
                  </div>
                  <h3 className="font-semibold text-base tracking-tight">
                    {expert.name}
                  </h3>
                  <div className="text-xs text-accent uppercase tracking-[0.12em] mt-1 mb-3">
                    {expert.role}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
                    {expert.desc}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Get Involved Section */}
        <section
          id="involve"
          className="py-20 sm:py-28 border-t border-border/40 relative overflow-hidden"
        >
          <div className="absolute inset-0 -z-10 bg-radial-fade opacity-50" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12">
              <SectionLabel num="06" label="Get Involved" />
              <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
                Want to learn more or join us?
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                The SRC addresses professionals, decision-makers and multipliers.
                We welcome direct contact.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  className="rounded-xl border border-border/60 bg-card/30 p-6 hover:border-accent/40 hover:bg-accent/5 transition-all flex flex-col"
                >
                  <div className="h-10 w-10 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-4">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-base tracking-tight mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    {item.desc}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-5 -ml-2 self-start group"
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

        {/* FAQ Section */}
        <section className="py-20 sm:py-28 border-t border-border/40">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <SectionLabel num="07" label="FAQ" />
              <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Contact Section */}
        <section
          id="contact"
          className="py-20 sm:py-28 border-t border-border/40 relative overflow-hidden"
        >
          <div className="absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-accent/5 blur-3xl -z-10" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <SectionLabel num="08" label="Contact" />
                <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">
                  Contact
                </h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Write to us — we usually respond within 48 hours.
                </p>
                <div className="mt-8 space-y-3 text-sm">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.16em] font-mono text-muted-foreground">
                      Initiative
                    </div>
                    <div className="mt-1">
                      SRC — Security &amp; Resilience Counsel
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.16em] font-mono text-muted-foreground">
                      Region
                    </div>
                    <div className="mt-1">
                      Switzerland · Germany · Austria
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.16em] font-mono text-muted-foreground">
                      Orientation
                    </div>
                    <div className="mt-1">
                      Non-partisan · Politically neutral · Fact-based
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border/60 bg-card/30 p-6">
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs">
                        Name *
                      </Label>
                      <Input id="name" required maxLength={120} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        maxLength={160}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="org" className="text-xs">
                        Organization
                      </Label>
                      <Input id="org" maxLength={200} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="role" className="text-xs">
                        Role
                      </Label>
                      <Input
                        id="role"
                        maxLength={200}
                        placeholder="e.g. Expert, Decision-maker"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="subject" className="text-xs">
                      Subject
                    </Label>
                    <Input id="subject" maxLength={200} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="message" className="text-xs">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      required
                      maxLength={5000}
                      rows={5}
                    />
                  </div>
                  <Button type="submit" className="w-full sm:w-auto">
                    <Send className="mr-2 h-4 w-4" />
                    Send message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/60 bg-background/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/logo.png"
                  alt="SRC Logo"
                  width={32}
                  height={32}
                  className="rounded-md object-contain"
                />
                <div className="leading-tight">
                  <div className="font-semibold text-sm">SRC</div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Security &amp; Resilience
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                Security and resilience for the D-A-CH region. Non-partisan,
                fact-based, neutral.
              </p>
            </div>
            <div className="text-xs">
              <div className="text-[10px] uppercase tracking-[0.18em] font-mono text-muted-foreground mb-3">
                Navigation
              </div>
              <ul className="space-y-1.5 text-muted-foreground">
                {NAV_ITEMS.map((item) => (
                  <li key={item}>
                    <button
                      className="hover:text-foreground transition-colors"
                      onClick={() => scrollToSection(item)}
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-xs">
              <div className="text-[10px] uppercase tracking-[0.18em] font-mono text-muted-foreground mb-3">
                Legal
              </div>
              <ul className="space-y-1.5 text-muted-foreground">
                <li>Imprint</li>
                <li>Privacy</li>
                <li>© 2026 SRC. All rights reserved.</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}