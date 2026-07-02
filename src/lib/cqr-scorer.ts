/**
 * In-website CQR scorer. Builds a system prompt from the current framework
 * (Matrix + dimension definitions), calls Claude, and parses the raw six-
 * dimension scores. Composite/flags/action are computed server-side in
 * cqr-persist.ts, not here. Paperclip later produces the same envelope shape.
 */
import Anthropic from "@anthropic-ai/sdk";
import type { FrameworkBundle } from "@/lib/cqr-framework";
import type { ScoreEnvelope } from "@/lib/cqr-persist";
import type { RawScores } from "@/lib/cqr-score";

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export function isScorerAvailable(): boolean {
  return anthropic !== null;
}

/** Map a Report.type to a CQR document-type code (drives weight selection). */
export function mapReportTypeToCqr(type: string): string {
  const t = (type || "").toLowerCase();
  if (t.includes("study")) return "STY";
  if (t.includes("opinion")) return "OPN";
  if (t.includes("editorial")) return "EDT";
  if (t.includes("brief")) return "BRF";
  if (t.includes("external") || t.includes("third")) return "EXT";
  return "RPT"; // Analysis / Report / default
}

interface ReportForScoring {
  title: string;
  summary: string | null;
  content: string | null;
  type: string;
  section: string;
  author: string | null;
}

function buildSystemPrompt(fw: FrameworkBundle): string {
  const matrix = fw.matrix
    .map((d) => {
      const rows = d.entries
        .map((e) => `  - ${e.topic}: ${e.position} (confidence: ${e.confidence}). ${e.rationale}`)
        .join("\n");
      return `### ${d.name} (${d.code})\n${rows}`;
    })
    .join("\n\n");

  return `You are the SRC-CQR Scoring Agent. You evaluate documents entering the SRC intelligence pipeline through the lens of SRC's editorial worldview: Swiss neutrality, institutional skepticism, evidence-based independence, and intellectual honesty over narrative conformity.

You do NOT enforce consensus. You reward well-evidenced contrarian perspectives. You flag institutional capture, corruption, and ideological bias wherever detected.

## SRC Editorial Worldview Matrix (v${fw.version}) — the authoritative reference
${matrix}

## Score each of six dimensions 1-10 (integers)
1. value — usefulness to SRC members (novelty, relevance, depth, timeliness).
2. trustworthiness — source/claim reliability (transparency, methodology, reproducibility). Independent of agreement.
3. sourceBias — institutional honesty: HIGHER = more transparent/less biased; LOWER = hidden agenda/undisclosed funding.
4. worldviewAlignment — fit with the SRC Matrix above (1 = directly contradicts SRC, 10 = fully aligned).
5. corruptionIndex — institutional capture of the SOURCE (1 = clean, 10 = systematic fraud/capture).
6. actionability — immediacy of decision relevance (1 = pure commentary, 10 = immediately critical).

## Critical rules
- Score each dimension INDEPENDENTLY. A corrupt source (high corruptionIndex) can still carry high value.
- trustworthiness is NOT agreement. A rigorous IPCC report can score high trustworthiness AND low worldviewAlignment.
- Do not penalize contrarian content on value/trustworthiness for being contrarian. Judge evidence, not popularity.
- If you lack expertise for a dimension, set confidence "Low" and give your best estimate. Never fake confidence.

## Output — RETURN ONLY THIS JSON, no prose, no markdown fences:
{
  "scores": { "value": 0, "trustworthiness": 0, "sourceBias": 0, "worldviewAlignment": 0, "corruptionIndex": 0, "actionability": 0 },
  "rationale": { "value": "...", "trustworthiness": "...", "sourceBias": "...", "worldviewAlignment": "...", "corruptionIndex": "...", "actionability": "..." },
  "recommendedTier": "Free|Essential|Professional|Executive",
  "contrarianFlag": true,
  "timeHorizon": "Immediate|Tactical|Strategic|Long-term|Structural"
}`;
}

function extractJson(text: string): unknown {
  // Tolerate accidental prose or code fences around the JSON object.
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("no JSON object in model response");
  return JSON.parse(candidate.slice(start, end + 1));
}

/**
 * Score a report with Claude. Returns the raw envelope (scores + rationale +
 * classification). Throws if the scorer is not configured or the model output
 * cannot be parsed. Composite/flags are computed downstream in persistScore.
 */
export async function scoreReport(
  report: ReportForScoring,
  framework: FrameworkBundle,
): Promise<ScoreEnvelope> {
  if (!anthropic) throw new Error("ANTHROPIC_API_KEY not configured");

  const docType = mapReportTypeToCqr(report.type);
  const body = [
    `TITLE: ${report.title}`,
    `TYPE: ${report.type} (CQR code: ${docType})`,
    `SECTION: ${report.section}`,
    report.author ? `AUTHOR: ${report.author}` : null,
    `SUMMARY: ${report.summary ?? "(none)"}`,
    "",
    "FULL TEXT:",
    (report.content ?? "").slice(0, 40_000), // cap to keep within context/cost
  ]
    .filter(Boolean)
    .join("\n");

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1500,
    system: buildSystemPrompt(framework),
    messages: [{ role: "user", content: `Score this document:\n\n${body}` }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const parsed = extractJson(text) as Record<string, unknown>;

  const rawScores = (parsed.scores ?? {}) as Record<string, unknown>;
  const rawRationale = (parsed.rationale ?? {}) as Record<string, unknown>;

  return {
    scores: normalizeScores(rawScores),
    rationale: normalizeRationale(rawRationale),
    docType,
    recommendedTier: (parsed.recommendedTier ?? parsed.recommended_tier ?? null) as string | null,
    contrarianFlag: Boolean(parsed.contrarianFlag ?? parsed.contrarian_flag ?? false),
    timeHorizon: (parsed.timeHorizon ?? parsed.time_horizon) as string | undefined,
  };
}

// Dimension key aliases: models sometimes emit snake_case (matching the spec's
// JSON examples) instead of the camelCase we ask for. Accept both, coerce
// numeric strings/floats to a clamped integer 1-10.
const DIM_ALIASES: Record<keyof RawScores, string[]> = {
  value: ["value"],
  trustworthiness: ["trustworthiness", "trust"],
  sourceBias: ["sourceBias", "source_bias"],
  worldviewAlignment: ["worldviewAlignment", "worldview_alignment"],
  corruptionIndex: ["corruptionIndex", "corruption_index", "corruption"],
  actionability: ["actionability"],
};

function coerceScore(raw: Record<string, unknown>, aliases: string[]): number {
  for (const key of aliases) {
    const v = raw[key];
    if (v === undefined || v === null) continue;
    // A dimension may arrive as { score: 8, ... } or a bare number/string.
    const candidate = typeof v === "object" ? (v as Record<string, unknown>).score : v;
    const n = typeof candidate === "number" ? candidate : parseFloat(String(candidate));
    if (Number.isFinite(n)) return Math.min(10, Math.max(1, Math.round(n)));
  }
  throw new Error(`missing/invalid score for ${aliases[0]}`);
}

function normalizeScores(raw: Record<string, unknown>): RawScores {
  return {
    value: coerceScore(raw, DIM_ALIASES.value),
    trustworthiness: coerceScore(raw, DIM_ALIASES.trustworthiness),
    sourceBias: coerceScore(raw, DIM_ALIASES.sourceBias),
    worldviewAlignment: coerceScore(raw, DIM_ALIASES.worldviewAlignment),
    corruptionIndex: coerceScore(raw, DIM_ALIASES.corruptionIndex),
    actionability: coerceScore(raw, DIM_ALIASES.actionability),
  };
}

function normalizeRationale(raw: Record<string, unknown>): ScoreEnvelope["rationale"] {
  const out: ScoreEnvelope["rationale"] = {};
  for (const [dim, aliases] of Object.entries(DIM_ALIASES) as [keyof RawScores, string[]][]) {
    for (const key of aliases) {
      const v = raw[key];
      if (typeof v === "string") { out[dim] = v; break; }
      if (v && typeof v === "object" && typeof (v as Record<string, unknown>).rationale === "string") {
        out[dim] = (v as Record<string, unknown>).rationale as string;
        break;
      }
    }
  }
  return out;
}
