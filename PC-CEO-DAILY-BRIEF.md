# Instruction to the Paperclip CEO — Daily Brief ingestion

This is the contract for how Paperclip must post Daily Briefs to the SRC website.
Two problems on prod triggered this:

1. **Duplicate briefs pile up.** Every re-run created a new brief row instead of
   updating the existing one, because each run minted a new issue-based
   `sourceRef`. The "Previous Briefings" list filled with near-identical rows.
2. **The full analysis has no formatting.** Content arrives as flat text with an
   internal board-memo preamble and single-newline run-on paragraphs. It renders
   as one wall of text.

The website now defends against both (idempotency by section+date, preamble
stripping, paragraph normalization). But Paperclip must hold up its end so the
output is correct and clean, not merely salvaged.

---

## 1. Idempotency — do NOT create a new brief on re-runs

**Send a STABLE `sourceRef` per (editorial date, domain).** Use this exact format:

```
src-daily-brief-{YYYY-MM-DD}-{section-slug}
```

Examples:
- `src-daily-brief-2026-07-01-geopolitics-hard-security`
- `src-daily-brief-2026-07-01-digital-power-ai`

Because the site dedups on `(sourceRef, language)`, re-posting the same brief
with the same stable `sourceRef` **updates** the existing row. Never derive the
`sourceRef` from a Paperclip issue number (`SRC-560`, `SRC-561`, …) — those change
every run and defeat dedup.

**Only post a brief once per domain per day.** If the day's brief for a domain has
already been posted, do not post it again unless the content genuinely changed
(then re-post with the SAME `sourceRef` to update in place).

## 2. One brief per (domain, day)

At most one Daily Brief per `section` per calendar day. Three domains → three POSTs,
each with a distinct `section` and its own stable `sourceRef`. Do not post the same
domain twice for the same day.

## 3. `code` must be unique per brief

Stop sending the same `code` (`SRC-DB-2026-182`) for every brief. Use:

```
SRC-DB-{YYYY}-{day-of-year}-{SECTION-ABBR}
```

e.g. `SRC-DB-2026-182-GEO`, `SRC-DB-2026-182-DIG`, `SRC-DB-2026-182-SEC`.

## 4. Content formatting — send real Markdown, editorial content only

**Strip all internal workflow text before posting.** Do NOT include:
- "Dear Board Member," salutations
- "Please find below the preview of today's … briefing"
- The `https://paperclip.ing/SRC/issues/…` document link

Members never see Paperclip internals. Post the editorial body only.

**Structure each story as Markdown:**

```markdown
## Deutsche Bahn GSM-R outage exposes systemic rail fragility

On 23–24 June, a failed component replacement in Deutsche Bahn's aging GSM-R
digital radio network halted all German rail traffic for ~2 hours. ENISA's May
2026 NIS360 report independently classifies railway as a **"risk zone"** sector.

**D-A-CH relevance:** ÖBB and SBB run parallel GSM-R networks; German regulators
(BSI/EBA) now have concrete evidence to push NIS2 redundancy requirements.

Sources: [The Record](https://therecord.media/deutsche-bahn-railroad-gsmr-outage),
[ENISA NIS360](https://www.enisa.europa.eu/news/nis360). Confidence: **High**.

## Cyber Europe 2026 stress-tests continental rail & maritime response

ENISA's 8th cross-border exercise (10–11 June, 5,000+ participants) simulated …
```

Rules:
- `## Heading` per story (the site renders these as collapsible analysis blocks).
- Blank line between paragraphs (single newlines collapse in Markdown).
- `**bold**` for lead-ins and confidence levels; `[text](url)` for sources.
- No raw pasted URLs — wrap them as Markdown links.

## 5. Valid field values (POST `/api/reports`)

| Field | Value |
|-------|-------|
| `type` | `"Daily Brief"` (exact; auto-publishes, no board vote) |
| `section` | one of: `digital-power-ai`, `geopolitics-hard-security`, `energy-resources`, `climate-environment-food`, `economy-competitiveness`, `society-migration-institutions` |
| `language` | `en` \| `de` \| `fr` \| `it` |
| `title` | must include the editorial date as `— YYYY-MM-DD` (the site also dedups on this) |
| `sourceRef` | stable, per §1 |
| `code` | unique, per §3 |
| `summary` | 1–2 sentence teaser (shown to Free/Observer tier) |
| `content` | full Markdown body, per §4 (shown to Essential+ tier) |

## 6. Example request

```json
POST /api/reports
{
  "type": "Daily Brief",
  "section": "geopolitics-hard-security",
  "language": "en",
  "title": "SRC Daily Briefing — Geo-Strategy & Energy — 2026-07-01",
  "sourceRef": "src-daily-brief-2026-07-01-geopolitics-hard-security",
  "code": "SRC-DB-2026-182-GEO",
  "summary": "Rail-network fragility and the EU Cybersecurity Reserve's first activation dominate today's security picture.",
  "content": "## Deutsche Bahn GSM-R outage …\n\nOn 23–24 June …\n\n**D-A-CH relevance:** …\n\n## Cyber Europe 2026 …\n\n…"
}
```

Re-posting this exact `sourceRef` later updates the same brief in place — no
duplicate row. That is the behaviour we want.
