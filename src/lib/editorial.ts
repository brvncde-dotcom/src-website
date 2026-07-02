/**
 * "The SRC Position" editorial helpers — sub-brand catalogue and payload
 * normalization for the Semaform structure (Facts / Analysis / Room for
 * Disagreement / The Ask). Shared by the Paperclip ingestion contract, the
 * detail API, and the reading UI. No DB calls here.
 */

// The seven sub-brands from the Editorial Section Strategy §3.1. `defaultTier`
// is the tier the doc assigns; ingestion may pass an explicit minTierId that
// overrides it. Tiers map onto the four live tiers (Sovereign→Executive).
export interface SubBrandDef {
  key: string;
  label: string;
  defaultTier: "Free" | "Essential" | "Professional" | "Executive";
  blurb: string;
}

export const SUB_BRANDS: SubBrandDef[] = [
  { key: "daily-position", label: "The Daily Position", defaultTier: "Essential", blurb: "Daily vAvatar video editorial — the day's key development through the SRC lens." },
  { key: "position-paper", label: "The Position Paper", defaultTier: "Essential", blurb: "Long-form written editorial with the full Facts / Analysis / Counterpoints structure." },
  { key: "guest-position", label: "Guest Position", defaultTier: "Professional", blurb: "External expert commentary, scored by SRC-CQR and framed by our editors." },
  { key: "debate", label: "The SRC Debate", defaultTier: "Professional", blurb: "Structured argument and counter-argument on a contested position." },
  { key: "investigates", label: "SRC Investigates", defaultTier: "Executive", blurb: "Documentary-style exposé on corruption and institutional capture." },
  { key: "one-good-question", label: "One Good Question", defaultTier: "Professional", blurb: "A single sharp question put to a global figure, answered verbatim." },
  { key: "src-reads", label: "SRC Reads", defaultTier: "Essential", blurb: "Rated reviews of influential publications, contextualized for decision-makers." },
];

export const SUB_BRAND_KEYS = SUB_BRANDS.map((s) => s.key);
const SUB_BRAND_BY_KEY: Record<string, SubBrandDef> = Object.fromEntries(
  SUB_BRANDS.map((s) => [s.key, s]),
);

export function subBrandDef(key: string | null | undefined): SubBrandDef {
  return (key && SUB_BRAND_BY_KEY[key]) || SUB_BRAND_BY_KEY["position-paper"];
}

/** A single fact in the Semaform "The Facts" block. */
export interface EditorialFact {
  claim: string;
  source?: string | null;
  trust?: number | null; // 1-10 inline trust indicator
}

/** Normalized editorial payload written to EditorialMeta. */
export interface EditorialInput {
  subBrand: string;
  thesis: string | null;
  facts: EditorialFact[] | null;
  analysis: string | null;
  roomForDisagreement: string | null;
  theAsk: string | null;
  authorTitle: string | null;
  authorCreds: string | null;
  authorLinkedin: string | null;
  authorTwitter: string | null;
  methodology: string | null;
  sourcesCount: number | null;
  conflicts: string | null;
  videoUrl: string | null;
  videoDuration: number | null;
  audioUrl: string | null;
}

function str(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

function intOrNull(v: unknown): number | null {
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? Math.round(n) : null;
}

function clampTrust(v: unknown): number | null {
  const n = intOrNull(v);
  if (n === null) return null;
  return Math.min(10, Math.max(1, n));
}

function normalizeFacts(v: unknown): EditorialFact[] | null {
  if (!Array.isArray(v)) return null;
  const out: EditorialFact[] = [];
  for (const raw of v) {
    if (typeof raw === "string") {
      const claim = raw.trim();
      if (claim) out.push({ claim });
      continue;
    }
    if (raw && typeof raw === "object") {
      const r = raw as Record<string, unknown>;
      const claim = str(r.claim) ?? str(r.text) ?? str(r.fact);
      if (!claim) continue;
      out.push({ claim, source: str(r.source), trust: clampTrust(r.trust) });
    }
  }
  return out.length ? out : null;
}

/**
 * Normalize an incoming editorial block (snake_case or camelCase tolerated,
 * matching the CQR scorer's leniency). Returns null when there's no usable
 * editorial content. `subBrand` falls back to position-paper.
 */
export function normalizeEditorial(raw: unknown): EditorialInput | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  const subBrandRaw = str(r.subBrand) ?? str(r.sub_brand) ?? "position-paper";
  const subBrand = SUB_BRAND_KEYS.includes(subBrandRaw) ? subBrandRaw : "position-paper";

  const input: EditorialInput = {
    subBrand,
    thesis: str(r.thesis),
    facts: normalizeFacts(r.facts),
    analysis: str(r.analysis),
    roomForDisagreement:
      str(r.roomForDisagreement) ?? str(r.room_for_disagreement) ?? str(r.counterpoints),
    theAsk: str(r.theAsk) ?? str(r.the_ask) ?? str(r.ask),
    authorTitle: str(r.authorTitle) ?? str(r.author_title),
    authorCreds: str(r.authorCreds) ?? str(r.author_creds) ?? str(r.credentials),
    authorLinkedin: str(r.authorLinkedin) ?? str(r.author_linkedin) ?? str(r.linkedin),
    authorTwitter: str(r.authorTwitter) ?? str(r.author_twitter) ?? str(r.twitter),
    methodology: str(r.methodology),
    sourcesCount: intOrNull(r.sourcesCount ?? r.sources_count),
    conflicts: str(r.conflicts),
    videoUrl: str(r.videoUrl) ?? str(r.video_url),
    videoDuration: intOrNull(r.videoDuration ?? r.video_duration),
    audioUrl: str(r.audioUrl) ?? str(r.audio_url),
  };

  // Require at least one substantive editorial field beyond sub-brand.
  const hasContent =
    input.thesis ||
    input.facts ||
    input.analysis ||
    input.roomForDisagreement ||
    input.theAsk ||
    input.videoUrl;
  return hasContent ? input : null;
}
