/**
 * SRC-CQR Worldview Matrix v1.0 seed data + seed routine.
 * Source: SRC_Content_Classification_Rating_Framework.docx §2 + §5.
 * Shared by scripts/seed-cqr.ts (CLI) and POST /api/admin/framework/seed (server).
 * Idempotent: upserts domains by code, replaces each domain's entries, upserts config v1.
 */
import { PrismaClient, Prisma } from "@prisma/client";
import { DEFAULT_WEIGHTS, DEFAULT_THRESHOLDS } from "@/lib/cqr-score";

interface Entry {
  topic: string;
  position: string;
  confidence: string;
  rationale: string;
}
interface Domain {
  code: string;
  name: string;
  sortOrder: number;
  entries: Entry[];
}

export const MATRIX: Domain[] = [
  {
    code: "CEF",
    name: "Climate, Environment & Energy",
    sortOrder: 1,
    entries: [
      { topic: "CO2 as primary climate driver", position: "Skeptical", confidence: "High", rationale: "Historical climate variability, solar cycles, and oceanic oscillations are underweighted in mainstream models. Attribution studies rely heavily on model assumptions rather than observational evidence." },
      { topic: "IPCC credibility", position: "2/10", confidence: "High", rationale: "Institutional capture, political pressure, peer-review gatekeeping, and exclusion of dissenting science. Summary for Policymakers is not a scientific document." },
      { topic: "\"Renewable energy\" solving energy crisis", position: "Skeptical", confidence: "High", rationale: "Intermittency, grid instability, rare-earth dependency, lifecycle emissions, and massive infrastructure costs make \"100% renewable\" claims unrealistic." },
      { topic: "Renewable energy industry corruption", position: "8/10", confidence: "High", rationale: "Subsidy capture, crony capitalism, ESG greenwashing, forced labor in mineral supply chains, and regulatory capture by industry incumbents." },
      { topic: "Nuclear energy", position: "Supportive", confidence: "High", rationale: "Baseload reliability, energy density, low lifecycle emissions, and mature technology. Regulatory barriers are politically, not technically, motivated." },
      { topic: "Fossil fuel transition timeline", position: "Skeptical of rapid timelines", confidence: "Medium", rationale: "Energy security must precede energy transition. Forced decarbonization risks industrial collapse and societal instability." },
      { topic: "Climate modeling reliability", position: "Low trust", confidence: "High", rationale: "Models consistently overpredict warming. Ensemble averaging masks structural uncertainty. Sensitivity parameters remain disputed after decades." },
    ],
  },
  {
    code: "GEO",
    name: "Geopolitics & Hard Security",
    sortOrder: 2,
    entries: [
      { topic: "Swiss neutrality", position: "Core principle", confidence: "Absolute", rationale: "Non-alignment is Switzerland's greatest strategic asset. Neutrality is not isolationism - it is independent analysis without political or commercial interest." },
      { topic: "NATO expansion", position: "Skeptical", confidence: "Medium", rationale: "Security guarantees create moral hazard. Expansion without corresponding defense spending is performative." },
      { topic: "Multilateral institutions (UN, WHO, WEF)", position: "Low trust", confidence: "High", rationale: "Institutional capture by geopolitical blocs, lack of accountability, mission creep, and ideological capture." },
      { topic: "Great power conflict probability", position: "Rising", confidence: "High", rationale: "Structural Thucydidean tensions, resource competition, technological decoupling, and alliance polarization." },
      { topic: "EU strategic autonomy", position: "Skeptical", confidence: "Medium", rationale: "Dependence on US security umbrella, internal disunity, regulatory overreach, and demographic decline undermine claims of autonomy." },
    ],
  },
  {
    code: "DPAI",
    name: "Digital Power & AI",
    sortOrder: 3,
    entries: [
      { topic: "AI regulation", position: "Cautious of overregulation", confidence: "High", rationale: "Premature regulation favors incumbents, stifles innovation, and creates compliance moats. Risk-based, not precautionary, approach needed." },
      { topic: "EU AI Act", position: "Overreach", confidence: "High", rationale: "Extraterritorial application, vague high-risk definitions, innovation chilling effect. European AI competitiveness will suffer." },
      { topic: "Big Tech censorship", position: "Concerned", confidence: "High", rationale: "Platform deplatforming, algorithmic bias, information gatekeeping, and coordination between state and corporate actors threaten discourse." },
      { topic: "Data sovereignty", position: "Essential", confidence: "Absolute", rationale: "Swiss-hosted data is non-negotiable. CLOUD Act exposure, FISA 702, and extraterritorial data access demands sovereign infrastructure." },
      { topic: "Open-source AI", position: "Supportive", confidence: "High", rationale: "Democratizes access, enables auditability, prevents concentration of power, and supports sovereign AI deployment." },
    ],
  },
  {
    code: "ECO",
    name: "Economy & Competitiveness",
    sortOrder: 4,
    entries: [
      { topic: "Central banking (ECB, Fed)", position: "Skeptical", confidence: "High", rationale: "Monetary policy has become fiscal policy by another name. Quantitative easing is wealth transfer. Independence is largely nominal." },
      { topic: "ESG investing", position: "Corruption concerns", confidence: "High", rationale: "Greenwashing, regulatory arbitrage, subjective scoring, and political capture. ESG is often a compliance cost, not a value driver." },
      { topic: "D-A-CH industrial competitiveness", position: "Declining, recoverable", confidence: "Medium", rationale: "Energy cost penalty, regulatory burden, and skilled labor shortage are structural. Reshoring and energy cost reduction are prerequisites." },
      { topic: "CBDCs (Central Bank Digital Currencies)", position: "Skeptical", confidence: "High", rationale: "Surveillance risk, programmable money, financial exclusion, and elimination of cash privacy. Resistance warranted." },
      { topic: "Deglobalization", position: "Observed trend, not yet verdict", confidence: "Medium", rationale: "Supply chain restructuring is real but \"globalization\" is evolving, not ending. Friend-shoring and regionalization are the operative modes." },
    ],
  },
  {
    code: "SMI",
    name: "Society, Migration & Institutions",
    sortOrder: 5,
    entries: [
      { topic: "Mass migration", position: "Security risk", confidence: "High", rationale: "Uncontrolled migration strains social cohesion, welfare systems, and security apparatus. Integration failures are systematically underreported." },
      { topic: "Media independence", position: "Declining", confidence: "High", rationale: "Concentration of ownership, state funding dependency, narrative conformity, and suppression of dissenting views." },
      { topic: "Academic freedom", position: "Under threat", confidence: "High", rationale: "Ideological conformity, cancellation culture, funding pressure, and self-censorship undermine the scientific method." },
      { topic: "Swiss direct democracy", position: "Model to preserve", confidence: "High", rationale: "Federalism, referendum, and cantonal autonomy are bulwarks against centralized ideological capture." },
    ],
  },
];

export const FLAG_RULES = {
  WORLDVIEW_CLASH: { worldviewAlignment: { lte: 3 }, trustworthiness: { gte: 7 } },
  CORRUPTION_ALERT: { corruptionIndex: { gte: 7 } },
  CONTRARIAN_GOLD: { contrarianFlag: true, composite: { gte: 7.5 } },
  SOURCE_RISK: { trustworthiness: { lte: 3 }, sourceBias: { lte: 3 } },
  BREAKING: { actionability: { eq: 10 }, timeHorizon: "immediate" },
};

/** Seed/refresh the Matrix v1.0 + FrameworkConfig v1. Idempotent. */
export async function seedFramework(prisma: PrismaClient): Promise<{ domains: number; entries: number }> {
  const asJson = (v: unknown) => v as Prisma.InputJsonValue;
  let entries = 0;
  for (const d of MATRIX) {
    const domain = await prisma.worldviewDomain.upsert({
      where: { code: d.code },
      create: { code: d.code, name: d.name, sortOrder: d.sortOrder },
      update: { name: d.name, sortOrder: d.sortOrder },
    });
    await prisma.worldviewEntry.deleteMany({ where: { domainId: domain.id } });
    for (const e of d.entries) {
      await prisma.worldviewEntry.create({
        data: { domainId: domain.id, topic: e.topic, position: e.position, confidence: e.confidence, rationale: e.rationale },
      });
      entries++;
    }
  }

  await prisma.frameworkConfig.upsert({
    where: { version: 1 },
    create: {
      version: 1,
      weights: asJson(DEFAULT_WEIGHTS),
      thresholds: asJson(DEFAULT_THRESHOLDS),
      flagRules: asJson(FLAG_RULES),
      published: true,
      note: "Initial framework v1.0 seeded from SRC-CQR spec.",
    },
    update: {
      weights: asJson(DEFAULT_WEIGHTS),
      thresholds: asJson(DEFAULT_THRESHOLDS),
      flagRules: asJson(FLAG_RULES),
      published: true,
    },
  });

  return { domains: MATRIX.length, entries };
}
