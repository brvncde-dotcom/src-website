/**
 * SRC-CQR scoring math — pure, server-side, testable.
 *
 * The website is the system of record for scores. Whoever produces the raw
 * six-dimension scores (the in-website scorer OR Paperclip), the COMPOSITE and
 * FLAGS are always computed here from the raw dims + the stored framework
 * weights. Agent-supplied composites are never trusted.
 *
 * Framework spec: SRC_Content_Classification_Rating_Framework.docx §5.
 */

export type DimensionKey =
  | "value"
  | "trustworthiness"
  | "sourceBias"
  | "worldviewAlignment"
  | "corruptionIndex"
  | "actionability";

export interface RawScores {
  value: number;
  trustworthiness: number;
  sourceBias: number;
  worldviewAlignment: number;
  corruptionIndex: number;
  actionability: number;
}

/** Weights for one document type. Must sum to 1.0. */
export type DimensionWeights = Record<DimensionKey, number>;

/** weights keyed by document type code (RPT, STY, OPN, EDT, BRF, EXT, ING). */
export type WeightTable = Record<string, DimensionWeights>;

export interface Thresholds {
  publishNow: number; // >= → "Publish immediately"
  reviewPublish: number; // >= → "Publish with review"
  conditional: number; // >= → "Conditional publish"
  referenceOnly: number; // >= → "Reference only"; below → "Reject"
}

export type CqrFlag =
  | "WORLDVIEW_CLASH"
  | "CORRUPTION_ALERT"
  | "CONTRARIAN_GOLD"
  | "SOURCE_RISK"
  | "BREAKING";

export type RecommendedAction =
  | "Publish immediately"
  | "Publish with review"
  | "Conditional publish"
  | "Reference only"
  | "Reject";

// ── Framework v1.0 defaults (seed values; live values come from FrameworkConfig) ──

export const DEFAULT_WEIGHTS: WeightTable = {
  //          value trust  bias  align corrupt action
  RPT: { value: 0.25, trustworthiness: 0.2, sourceBias: 0.1, worldviewAlignment: 0.2, corruptionIndex: 0.15, actionability: 0.1 },
  STY: { value: 0.25, trustworthiness: 0.25, sourceBias: 0.1, worldviewAlignment: 0.15, corruptionIndex: 0.15, actionability: 0.1 },
  OPN: { value: 0.25, trustworthiness: 0.2, sourceBias: 0.15, worldviewAlignment: 0.25, corruptionIndex: 0.1, actionability: 0.05 },
  EDT: { value: 0.2, trustworthiness: 0.2, sourceBias: 0.1, worldviewAlignment: 0.3, corruptionIndex: 0.1, actionability: 0.1 },
  BRF: { value: 0.25, trustworthiness: 0.2, sourceBias: 0.1, worldviewAlignment: 0.15, corruptionIndex: 0.15, actionability: 0.15 },
  EXT: { value: 0.25, trustworthiness: 0.3, sourceBias: 0.2, worldviewAlignment: 0.25, corruptionIndex: 0.25, actionability: 0.15 },
};

export const DEFAULT_THRESHOLDS: Thresholds = {
  publishNow: 8.0,
  reviewPublish: 6.5,
  conditional: 5.0,
  referenceOnly: 3.5,
};

/**
 * Compute the weighted composite (1–10).
 *
 * Corruption is inverted: a high corruption score REDUCES the composite, so its
 * contribution is (10 − corruptionIndex) × weight. All other dims contribute
 * (score × weight) directly.
 *
 * The website stores weights that already sum to 1.0, but we normalise
 * defensively so a mis-entered weight table can't silently inflate scores.
 */
export function computeComposite(
  scores: RawScores,
  docType: string,
  weightTable: WeightTable = DEFAULT_WEIGHTS,
): number {
  const w = weightTable[docType] ?? weightTable.EXT ?? DEFAULT_WEIGHTS.EXT;
  const weightSum =
    w.value + w.trustworthiness + w.sourceBias + w.worldviewAlignment + w.corruptionIndex + w.actionability;
  const norm = weightSum > 0 ? weightSum : 1;

  const raw =
    scores.value * w.value +
    scores.trustworthiness * w.trustworthiness +
    scores.sourceBias * w.sourceBias +
    scores.worldviewAlignment * w.worldviewAlignment +
    (10 - scores.corruptionIndex) * w.corruptionIndex + // inverted
    scores.actionability * w.actionability;

  const composite = raw / norm;
  return Math.round(clamp(composite, 1, 10) * 100) / 100;
}

/**
 * Detect the special flags from §5.4. `contrarianFlag` and `timeHorizon` are
 * classification attributes supplied alongside the raw scores.
 */
export function detectFlags(
  scores: RawScores,
  opts: { contrarianFlag?: boolean; timeHorizon?: string; composite: number },
): CqrFlag[] {
  const flags: CqrFlag[] = [];

  if (scores.worldviewAlignment <= 3 && scores.trustworthiness >= 7) flags.push("WORLDVIEW_CLASH");
  if (scores.corruptionIndex >= 7) flags.push("CORRUPTION_ALERT");
  if (opts.contrarianFlag && opts.composite >= 7.5) flags.push("CONTRARIAN_GOLD");
  if (scores.trustworthiness <= 3 && scores.sourceBias <= 3) flags.push("SOURCE_RISK");
  if (scores.actionability === 10 && (opts.timeHorizon ?? "").toLowerCase() === "immediate") flags.push("BREAKING");

  return flags;
}

/** Map a composite score to the §5.3 decision action. */
export function decideAction(composite: number, t: Thresholds = DEFAULT_THRESHOLDS): RecommendedAction {
  if (composite >= t.publishNow) return "Publish immediately";
  if (composite >= t.reviewPublish) return "Publish with review";
  if (composite >= t.conditional) return "Conditional publish";
  if (composite >= t.referenceOnly) return "Reference only";
  return "Reject";
}

/**
 * Map the framework's 5-tier `recommended_tier` onto SRC's live 4 tiers.
 * Sovereign folds into Executive until a real Sovereign tier ships.
 */
export function mapRecommendedTier(tier: string | null | undefined): string | null {
  if (!tier) return null;
  const t = tier.trim().toLowerCase();
  if (t === "sovereign") return "Executive";
  if (["free", "essential", "professional", "executive"].includes(t)) {
    return t.charAt(0).toUpperCase() + t.slice(1);
  }
  return null;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}
