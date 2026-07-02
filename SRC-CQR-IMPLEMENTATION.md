# SRC-CQR Implementation Plan

**Content Classification, Qualification & Rating Framework**
Status: Planning · Owner: SRC Advisory · Framework spec: `SRC_Content_Classification_Rating_Framework.docx` (v1.0)

This document is the implementation plan for wiring the SRC-CQR framework into the
SRC website + Paperclip pipeline. It is also the foundation for the Paperclip agent
briefing (see §"Paperclip contract" and PKG 6).

---

## 1. Architecture: who owns what

The framework spec bundles three separable concerns. We split them cleanly:

| Concern | Owner | Why |
|---|---|---|
| **Worldview Matrix** + tuning config (weights, thresholds, flag rules) | **SRC website** (system of record) | Board-authored, versioned, audited, edited in admin |
| **Scoring compute** (evaluate a document on 6 dimensions) | **In-website Scorer now; Paperclip later** | LLM job. Website scorer uses the existing `ANTHROPIC_API_KEY`; Paperclip adopts the identical API contract when ready |
| **Score records + editorial review** | **SRC website** | Scores attach to reports, surface in admin, feed calibration |

**Decisions locked (2026-07-02):**
- Scorer runs **in-website now** (button in admin), Paperclip adopts the same contract later.
- Matrix stored **relational** (one row per topic), served to Paperclip as **JSON export**.
- V1 = **lean core (PKG 0–4)**; learning loop (PKG 5) deferred to a second pass.
- `recommended_tier` **maps onto the existing 4 tiers** (Sovereign → Executive). No new tier now.

---

## 2. The Paperclip contract (server-to-server)

Paperclip already holds `INGESTION_API_KEY` (scoped: ingest-only, never admin, never publish).
The CQR endpoints reuse that scope. **No new secret; Paperclip gains no new privilege.**

| Direction | Endpoint | Auth | Purpose |
|---|---|---|---|
| SRC → Paperclip | `GET /api/framework/current` | `INGESTION_API_KEY` | Pull Matrix + weights + thresholds + flag rules + version. The "briefing." Cacheable. |
| Paperclip → SRC | `POST /api/reports/:id/cqr-score` | `INGESTION_API_KEY` | Return the §7 score envelope. Server validates + **recomputes composite** + stores. |
| SRC → Paperclip | publish event (Opinion/Editorial) | — | Triggers Matrix learning loop (PKG 5, deferred). |

**Server never trusts agent arithmetic.** On score ingest, the composite is recomputed
server-side from the six raw dimension scores using the stored weights for that doc type.
The agent's `composite_score` is kept only as a cross-check (flag mismatch > 0.3).

---

## 3. Data model (PKG 0)

```prisma
model WorldviewDomain {
  id        String           @id @default(cuid())
  code      String           @unique   // CEF, GEO, DPAI, ECO, SMI
  name      String
  sortOrder Int              @default(0)
  entries   WorldviewEntry[]
}

model WorldviewEntry {
  id         String   @id @default(cuid())
  domainId   String
  topic      String                       // "CO2 as primary climate driver"
  position   String                       // "Skeptical" | "2/10" | "Supportive" ...
  confidence String   @default("Medium")  // Absolute | High | Medium | Evolving
  rationale  String
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  domain     WorldviewDomain @relation(fields: [domainId], references: [id], onDelete: Cascade)
  @@index([domainId])
}

// Versioned tuning config — weights per doc type, thresholds, flag rules.
// One row = one published version. Only the highest `version` with published=true is "current".
model FrameworkConfig {
  id        String   @id @default(cuid())
  version   Int      @unique            // 1, 2, 3 ...
  weights   Json                        // { RPT: {value:0.25, trust:0.20, ...}, STY: {...}, ... }
  thresholds Json                       // { publishNow:8.0, reviewPublish:6.5, conditional:5.0, referenceOnly:3.5 }
  flagRules Json                        // declarative flag conditions
  published Boolean  @default(false)
  note      String?
  createdAt DateTime @default(now())
}

// Six-dimension score for one report. One report may be re-scored (keep latest per framework version).
model ContentScore {
  id                 String   @id @default(cuid())
  reportId           String
  frameworkVersion   Int
  matrixVersionLabel String?              // for audit: which Matrix state was used
  scoredBy           String   @default("in-website")  // "in-website" | "paperclip" | editorial email
  value              Int
  trustworthiness    Int
  sourceBias         Int
  worldviewAlignment Int
  corruptionIndex    Int
  actionability      Int
  rationale          Json                 // { value: "...", trustworthiness: "...", ... }
  composite          Float                // recomputed server-side
  flags              String[]             // WORLDVIEW_CLASH, CORRUPTION_ALERT, CONTRARIAN_GOLD, SOURCE_RISK, BREAKING
  recommendedTier    String?              // mapped onto Free/Essential/Professional/Executive
  recommendedAction  String               // Publish immediately | ... | Reject
  contrarianFlag     Boolean  @default(false)
  editorialOverride  Json?                // final scores set by editor → calibration input
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  report             Report   @relation(fields: [reportId], references: [id], onDelete: Cascade)
  @@index([reportId])
  @@index([composite])
}
```

`Report` gains `contentScores ContentScore[]`.

Matrix change-log: a lightweight `WorldviewChangeLog` (timestamp, entryId, before/after JSON, actor)
— or reuse the existing admin activity log if one exists. Decide during PKG 0.

---

## 4. The six dimensions (reference)

Each 1–10. Weights vary by document type (`FrameworkConfig.weights`).

1. **Value** — usefulness to SRC members.
2. **Trustworthiness** — source/claim reliability. *Independent of agreement.*
3. **Source Bias** — institutional honesty (higher = more transparent, less biased).
4. **Worldview Alignment** — fit with SRC editorial stance (from the Matrix).
5. **Corruption Index** — institutional capture of the *source* (inverted in composite: `(10 − C) × w`).
6. **Actionability** — immediacy of decision relevance.

**Composite** = Σ(dimension × weight), corruption inverted, scaled 1–10.

**Decision thresholds:** 8.0–10 publish now · 6.5–7.9 publish w/ review · 5.0–6.4 conditional ·
3.5–4.9 reference only · 1.0–3.4 reject.

**Flags:** `WORLDVIEW_CLASH` (align ≤3 & trust ≥7) · `CORRUPTION_ALERT` (corruption ≥7) ·
`CONTRARIAN_GOLD` (contrarian & composite ≥7.5) · `SOURCE_RISK` (trust ≤3 & bias ≤3) ·
`BREAKING` (actionability =10 & immediate).

---

## 5. Work packages

### PKG 0 — Schema foundation
Prisma models above + migration (`migrate deploy` path, matching the monitoring precedent).
Server-side composite + flag engine in `src/lib/cqr-score.ts` (pure functions, unit-testable).

### PKG 1 — Matrix Admin UI  ← the "resides in SRC Admin" requirement
- New `/admin/framework` section (card on dashboard + nav link, next to Monitors).
- Tab A **Worldview Matrix**: per-domain tables, edit topic/position/confidence/rationale, add/retire entries.
- Tab B **Tuning**: edit dimension weights per doc type + thresholds + flag rules; "Publish version" bumps `FrameworkConfig.version`.
- Changelog view.

### PKG 2 — Framework API for Paperclip
`GET /api/framework/current` → `{ version, matrix: {domains,entries}, weights, thresholds, flagRules }`.
Auth: `INGESTION_API_KEY`. Read-only, cacheable (`Cache-Control: private, max-age=300`).

### PKG 3 — Scoring
- `src/lib/cqr-scorer.ts` — builds the system prompt from the current framework, calls Claude
  (`claude-haiku-4-5` for cost, or Sonnet for hard docs), returns the §7 envelope.
- Admin: **"Score with CQR"** button on a report → runs scorer → stores `ContentScore`.
- `POST /api/reports/:id/cqr-score` — Paperclip-facing ingest (same validation + server-side composite).

### PKG 4 — Editorial review surface
- CQR panel on the report admin: six-dim bars, composite + threshold band, flag chips, recommendation.
- Reports list: sort/filter by composite and flags.
- Editorial override → writes `editorialOverride` (calibration input for PKG 5).

### PKG 5 — Learning loop  *(deferred)*
Opinion/Editorial publish → Paperclip Updater proposes Matrix deltas → Board-approval UI →
Matrix version bump. Calibration monitor (agent vs editorial final). Built once scoring is proven.

### PKG 6 — Paperclip briefing  *(parallel)*
Agent spec (Scorer/Updater/Monitor) written against the **live API contract** in §2, not the static doc.
Handover deliverable — extends PAPERCLIP-HANDOFF.md.

---

## 6. Sequence & branch

V1 order: **PKG 0 → 2 → 3 → 1 → 4**. (Schema, then the API contract, then the scorer so there's
something to review, then the admin UI to edit the Matrix and read scores.)

Branch base: **off `main`** (has the shipped admin Monitors card that the Framework card sits beside).
Feature branch `feature/cqr-framework`, PR to `main`, deploy to prod — same flow as monitoring.

---

## 7. Spec discrepancies found (for Board ruling)

Found while implementing the scoring math. Implementation takes the safe/correct path;
both are editable in the admin tuning editor (PKG 1).

1. **EXT weight column sums to 1.40**, not 1.0 (all other doc types sum to 1.0). The docx
   worked example (§8) does not normalize → composite 6.15 ("Conditional publish"). We
   **normalize by weight-sum** → 4.39 ("Reference only"). Normalizing keeps composites
   comparable across doc types against the shared thresholds. Board to confirm intended EXT weights.
2. **WORLDVIEW_CLASH** fires in the worked example at Trustworthiness 6, but the stated rule
   (§5.4) is Trust ≥ 7. We implement the **stated rule**. Board to confirm the threshold.

## 8. Security notes (standing rules)

- Paperclip uses **`INGESTION_API_KEY` only**. Never `ADMIN_API_KEY`. No publish capability (board-gated).
- `ANTHROPIC_API_KEY` stays server-side; never in chat. Set via `vercel env add`.
- The Matrix is internal (exposes editorial worldview) — the framework API is key-gated, never public.
