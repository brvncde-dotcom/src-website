/**
 * Persist a CQR score. Whoever produced the raw six-dimension scores (the
 * in-website scorer or Paperclip), the composite, flags, action and tier are
 * ALWAYS derived here from the raw dims + the current framework weights.
 * Agent-supplied composites are never trusted.
 */
import { prisma } from "@/lib/db";
import {
  computeComposite,
  detectFlags,
  decideAction,
  mapRecommendedTier,
  type RawScores,
} from "@/lib/cqr-score";
import { getCurrentFramework } from "@/lib/cqr-framework";

export interface ScoreEnvelope {
  scores: RawScores;
  rationale: Partial<Record<keyof RawScores, string>>;
  docType: string; // RPT | STY | OPN | EDT | BRF | EXT | ING
  recommendedTier?: string | null;
  contrarianFlag?: boolean;
  timeHorizon?: string;
}

const DIMS: (keyof RawScores)[] = [
  "value",
  "trustworthiness",
  "sourceBias",
  "worldviewAlignment",
  "corruptionIndex",
  "actionability",
];

/** Validate a raw score envelope. Returns an error message or null. */
export function validateEnvelope(e: unknown): string | null {
  if (!e || typeof e !== "object") return "envelope must be an object";
  const env = e as ScoreEnvelope;
  if (!env.scores || typeof env.scores !== "object") return "scores missing";
  for (const d of DIMS) {
    const v = env.scores[d];
    if (typeof v !== "number" || !Number.isFinite(v) || v < 1 || v > 10) {
      return `scores.${d} must be a number 1-10`;
    }
  }
  if (!env.docType || typeof env.docType !== "string") return "docType missing";
  return null;
}

/**
 * Recompute composite/flags/action/tier from raw scores and upsert the
 * ContentScore for (reportId, current framework version).
 */
export async function persistScore(
  reportId: string,
  env: ScoreEnvelope,
  scoredBy: "in-website" | "paperclip" | "editorial",
) {
  const framework = await getCurrentFramework();

  const composite = computeComposite(env.scores, env.docType, framework.weights);
  const flags = detectFlags(env.scores, {
    contrarianFlag: env.contrarianFlag,
    timeHorizon: env.timeHorizon,
    composite,
  });
  const recommendedAction = decideAction(composite, framework.thresholds);
  const recommendedTier = mapRecommendedTier(env.recommendedTier);

  const data = {
    frameworkVersion: framework.version,
    scoredBy,
    value: env.scores.value,
    trustworthiness: env.scores.trustworthiness,
    sourceBias: env.scores.sourceBias,
    worldviewAlignment: env.scores.worldviewAlignment,
    corruptionIndex: env.scores.corruptionIndex,
    actionability: env.scores.actionability,
    rationale: env.rationale ?? {},
    composite,
    flags,
    recommendedTier,
    recommendedAction,
    contrarianFlag: env.contrarianFlag ?? false,
  };

  return prisma.contentScore.upsert({
    where: { reportId_frameworkVersion: { reportId, frameworkVersion: framework.version } },
    create: { reportId, ...data },
    update: data,
  });
}
