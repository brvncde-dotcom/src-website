"use client";

import { Button } from "@/components/ui/button";

const EXPERTS = [
  {
    initials: "BR",
    name: "Dr. Bernd R.",
    role: "President",
    focus: "Strategic security policy and geopolitical risk assessment",
    bio: "25+ years of experience in strategic security policy, including senior advisory roles in government and international organisations. Specialises in geopolitical risk assessment, great-power competition, and D-A-CH security architecture. Former advisor to the Swiss Federal Department of Foreign Affairs.",
    areas: ["Geopolitics & Hard Security", "Economy & Competitiveness"],
    publications: 24,
  },
  {
    initials: "MK",
    name: "Prof. Dr. Maria K.",
    role: "VP Research",
    focus: "Energy systems engineering and grid resilience",
    bio: "Professor of energy systems engineering at ETH Zurich. Leading researcher in grid resilience, energy storage technologies, and nuclear/SMR deployment. Former chief engineer at a major European utility. Holds patents in grid-scale battery management systems.",
    areas: ["Energy & Resources", "Climate, Environment & Food"],
    publications: 18,
  },
  {
    initials: "TH",
    name: "Thomas H.",
    role: "VP Operations",
    focus: "Critical infrastructure protection and cyber defence",
    bio: "Former CISO at a Swiss systemically important bank with 15 years of experience in critical infrastructure protection. Expert in cyber-physical security, incident response, and national cyber defence strategy. Certified CISSP and CISM.",
    areas: ["Digital Power & AI", "Geopolitics & Hard Security"],
    publications: 15,
  },
  {
    initials: "AW",
    name: "Dr. Anna W.",
    role: "Head of Analysis",
    focus: "Migration, demographics, and social cohesion",
    bio: "Political scientist with a PhD from the University of Vienna. Specialises in migration policy, demographic trends, and social cohesion analysis. Former research fellow at the European Policy Centre (EPC) and contributor to the OECD's migration policy programme.",
    areas: ["Society, Migration & Institutions", "Economy & Competitiveness"],
    publications: 12,
  },
  {
    initials: "LM",
    name: "Dr. Lukas M.",
    role: "Senior Fellow — AI & Digital Policy",
    focus: "AI governance, digital sovereignty, and cybersecurity strategy",
    bio: "Computer scientist and policy analyst with dual expertise in AI systems and public policy. Former technology advisor to the German Federal Ministry of the Interior. Led the development of Germany's AI risk assessment framework for critical infrastructure.",
    areas: ["Digital Power & AI"],
    publications: 9,
  },
  {
    initials: "SK",
    name: "Dr. Sophie K.",
    role: "Senior Fellow — Climate & Environment",
    focus: "Climate adaptation, environmental security, and food systems",
    bio: "Environmental scientist with extensive field experience in climate adaptation across Alpine regions. Former lead author for the IPCC Working Group II and advisor to the Austrian Federal Ministry for Climate Action. Expert in climate-resilient infrastructure design.",
    areas: ["Climate, Environment & Food", "Energy & Resources"],
    publications: 14,
  },
];

const ADVISORY_BOARD = [
  { initials: "JF", name: "Amb. Johann F.", role: "Advisory Board", desc: "Former Swiss Ambassador to NATO. Distinguished career in multilateral diplomacy and security policy." },
  { initials: "HR", name: "Prof. Dr. Heidi R.", role: "Advisory Board", desc: "Professor of constitutional law, University of Bern. Expert in institutional resilience and democratic governance." },
  { initials: "KP", name: "Dr. Klaus P.", role: "Advisory Board", desc: "Former CEO of a DAX-listed industrial company. Expert in supply-chain management and economic security." },
];

export function ExpertsView() {
  return (
    <div>
      {/* Hero */}
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#E8272C] mb-2 block">
            Team
          </span>
          <h1 className="heading-serif text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 max-w-xl">
            Expert Panel
          </h1>
          <p className="text-sm text-white/60 max-w-lg leading-relaxed">
            SRC&apos;s analysis is powered by a multidisciplinary team of domain experts with deep
            operational, academic, and policy experience across all six focus areas.
          </p>
        </div>
      </div>

      {/* Core team */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <h2 className="text-xs font-bold tracking-[0.15em] uppercase text-primary mb-8">
          Core Team
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EXPERTS.map((expert) => (
            <div
              key={expert.initials}
              className="border border-border p-6 hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold tracking-wide flex-shrink-0">
                  {expert.initials}
                </div>
                <div>
                  <h3 className="font-semibold text-base text-primary">{expert.name}</h3>
                  <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#E8272C]">
                    {expert.role}
                  </p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed mb-4">{expert.bio}</p>

              <div className="mb-3">
                <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-primary block mb-1.5">
                  Focus
                </span>
                <p className="text-xs text-muted-foreground">{expert.focus}</p>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {expert.areas.map((area) => (
                  <span
                    key={area}
                    className="text-[10px] font-medium bg-secondary px-2 py-0.5 rounded-sm text-muted-foreground"
                  >
                    {area}
                  </span>
                ))}
              </div>

              <div className="text-[10px] text-muted-foreground">
                {expert.publications} publications
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Advisory Board */}
      <section className="bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <h2 className="text-xs font-bold tracking-[0.15em] uppercase text-primary mb-8">
            Advisory Board
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {ADVISORY_BOARD.map((member) => (
              <div key={member.initials} className="bg-white border border-border p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs font-bold">
                    {member.initials}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-primary">{member.name}</h3>
                    <p className="text-[10px] font-bold tracking-[0.08em] uppercase text-[#E8272C]">
                      {member.role}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 text-center">
        <h2 className="heading-serif text-xl font-bold text-primary mb-3">
          Join the Expert Panel
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-5 leading-relaxed">
          SRC is always interested in connecting with domain experts who share our commitment to
          rigorous, non-partisan analysis of critical infrastructure resilience.
        </p>
        <Button className="bg-[#E8272C] hover:bg-[#d02025] text-white text-sm">
          Get in Touch
        </Button>
      </section>
    </div>
  );
}