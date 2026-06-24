"use client";

import {
  BrainCircuit, Swords, Zap, Leaf, TrendingUp, Scale,
  Shield, ArrowRight, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const FOCUS_AREAS = [
  {
    icon: BrainCircuit,
    num: "01",
    title: "Digital Power & AI",
    slug: "digital-power-ai",
    desc: "The digital domain has become the central arena for geopolitical competition, economic security, and societal resilience. SRC examines how artificial intelligence, digital infrastructure, and cyber capabilities reshape power dynamics in the D-A-CH region and beyond.",
    topics: [
      "AI governance and regulation across D-A-CH",
      "Digital sovereignty and data localisation",
      "Cybersecurity of critical infrastructure",
      "Zero-trust architecture adoption",
      "Quantum computing implications for encryption",
      "Digital identity and e-government systems",
    ],
    reports: 12,
    color: "#0A2540",
  },
  {
    icon: Swords,
    num: "02",
    title: "Geopolitics & Hard Security",
    slug: "geopolitics-hard-security",
    desc: "Great-power competition, shifting alliances, and hybrid warfare create a complex security environment for the D-A-CH region. SRC analyses the strategic implications of geopolitical developments for Central European security architecture.",
    topics: [
      "NATO/EU defence posture and D-A-CH alignment",
      "Military readiness and capability gaps",
      "Hybrid and coercive threat analysis",
      "Arms control and disarmament dynamics",
      "D-A-CH foreign policy coordination",
      "Space and domain-specific security challenges",
    ],
    reports: 9,
    color: "#1A3A5C",
  },
  {
    icon: Zap,
    num: "03",
    title: "Energy & Resources",
    slug: "energy-resources",
    desc: "Energy security underpins every aspect of critical infrastructure resilience. SRC examines the transition from fossil fuels to renewable and nuclear sources, the geopolitics of energy supply, and the resource requirements of a decarbonised economy.",
    topics: [
      "SMR deployment and nuclear renaissance",
      "LNG and gas diversification strategies",
      "Grid stability and storage solutions",
      "Critical minerals supply chains",
      "Geopolitical independence through energy policy",
      "Hydrogen economy readiness assessment",
    ],
    reports: 7,
    color: "#E8272C",
  },
  {
    icon: Leaf,
    num: "04",
    title: "Climate, Environment & Food",
    slug: "climate-environment-food",
    desc: "Climate change acts as a threat multiplier that compounds existing vulnerabilities in critical infrastructure. SRC analyses the intersection of environmental policy, climate adaptation, and food system resilience in the D-A-CH context.",
    topics: [
      "Decarbonisation pathways and policy frameworks",
      "Environmental security and ecological resilience",
      "Agriculture and food systems under climate stress",
      "Water infrastructure and scarcity preparedness",
      "Climate adaptation for critical infrastructure",
      "Biodiversity and ecosystem services valuation",
    ],
    reports: 5,
    color: "#2D6A4F",
  },
  {
    icon: TrendingUp,
    num: "05",
    title: "Economy & Competitiveness",
    slug: "economy-competitiveness",
    desc: "Economic security is inseparable from national security. SRC examines the forces reshaping the D-A-CH economic landscape — from deindustrialisation pressures and supply-chain vulnerabilities to economic coercion and technological competition.",
    topics: [
      "Deindustrialisation risks and industrial policy",
      "Economic coercion and sanctions resilience",
      "Supply-chain resilience and diversification",
      "D-A-CH competitiveness in global markets",
      "Semiconductor and tech sector dependencies",
      "Financial system stability and sanctions",
    ],
    reports: 8,
    color: "#7C3AED",
  },
  {
    icon: Scale,
    num: "06",
    title: "Society, Migration & Institutions",
    slug: "society-migration-institutions",
    desc: "Social cohesion, institutional trust, and effective governance form the foundation of societal resilience. SRC analyses demographic trends, migration dynamics, and information warfare targeting democratic institutions.",
    topics: [
      "Migration policy and border infrastructure",
      "Demographic trends and labour market impacts",
      "Social cohesion and polarisation dynamics",
      "Institutional resilience and democratic safeguards",
      "Information warfare and counter-disinformation",
      "Civil defence and societal preparedness",
    ],
    reports: 6,
    color: "#B45309",
  },
];

export function FocusAreasView() {
  return (
    <div>
      {/* Hero */}
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#E8272C] mb-2 block">
            Research Domains
          </span>
          <h1 className="heading-serif text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 max-w-xl">
            Six Domains of Critical Infrastructure Resilience
          </h1>
          <p className="text-sm text-white/60 max-w-lg leading-relaxed">
            SRC&apos;s research is organised around six interconnected focus areas that collectively
            cover the full spectrum of security and resilience challenges facing the D-A-CH region.
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
                    {area.title}
                  </h2>
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {area.reports} published reports
                    </span>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    View Reports
                  </Button>
                </div>

                {/* Right: Content */}
                <div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    {area.desc}
                  </p>
                  <h4 className="text-xs font-bold tracking-[0.1em] uppercase text-primary mb-3">
                    Key Topics
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    {area.topics.map((topic) => (
                      <div key={topic} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="w-1 h-1 rounded-full bg-[#E8272C] mt-2 flex-shrink-0" />
                        {topic}
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
            Many of the most pressing challenges span multiple focus areas. SRC&apos;s cross-domain
            analysis methodology ensures that interdependencies and compound risks are identified
            and addressed holistically.
          </p>
          <Button variant="outline" size="sm" className="mt-4 text-xs gap-1.5">
            Learn about our approach <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}