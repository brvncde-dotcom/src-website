# Publishing Workflow — SRC Advisory

This is the **source of truth** for how a report goes from draft to live on
`www.src-advisory.ch`.

Publishing is **tiered by content type and by an automated quality gate**:

- **News-grade content** (Daily Briefs, Analyses, Reports, Briefs, Strategy
  Papers, Statements) can **auto-publish** — either immediately (Daily Briefs)
  or after clearing the website's own **SRC-CQR quality score**.
- **Opinion and Editorial** ("The SRC Position") are **always board-gated**. No
  automated path can ever put them live. This is enforced server-side and
  cannot be overridden by any caller.

The design goal: a constant flow of scored, on-brand information, with a human
board reserved for the value-laden, reputation-critical pieces.

---

## The one fact that fixes everything

**Publishing is NOT deploying.**

- Publishing a report = a database field: `status = "published"`.
- The live site reads published reports **dynamically** from the database.
- The instant `status` flips, the report is live. No build. No `git push`. No
  Vercel deploy. No credentials.

Any request to "deploy the website to publish a report" is based on a
misunderstanding. The site is already deployed and serves whatever is in the
database. Ignore all deploy/git/token requests related to publishing.

---

## The publishing decision (server-enforced)

Every `POST /api/reports` runs through this logic in `src/app/api/reports/route.ts`.
Paperclip **requests** an outcome with the `autoPublish` flag; the **website
decides**. Paperclip cannot override any rule below.

| Content type | `autoPublish` omitted / false | `autoPublish: true` |
|---|---|---|
| **Daily Brief** | auto-publishes immediately (news-feed cadence) | same |
| **Analysis / Report / Strategy Paper / Statement / Brief** | queued `pending` (board review) | website scores the text; **publishes only if it clears the floor**, else queued |
| **Opinion** | queued `pending` (board) | **flag ignored** — always queued |
| **Editorial** (The SRC Position) | queued `pending` (board) | **flag ignored** — always queued |

**The quality gate:** for score-gated types, the website runs its **own** CQR
scorer (`src/lib/cqr-scorer.ts`) against the submitted text and recomputes the
composite server-side. It auto-publishes only when the composite reaches the
**"Publish immediately"** threshold (default `8.0`, from the active framework).
Below that, it queues for the board. **Paperclip never supplies the score** —
the website scores the words it received, so an agent cannot inflate its way
onto the live site.

**Fail-safe:** if the scorer is unavailable, returns invalid output, or the
daily auto-publish ceiling is hit, the report is **queued, never published
blind**.

**Feedback loop:** the POST response includes `cqrComposite` and a `message`
explaining the outcome (e.g. `CQR 6.8 (Publish with review) below auto-publish
floor 8.0 — queued for board review`). This is how Paperclip learns what clears
the bar.

### Tuning knobs (Vercel env, no code change)

- `CQR_AUTOPUBLISH_MIN_COMPOSITE` — lower the floor (e.g. `6.5`) to increase
  flow, raise it to be stricter. Default: the framework's `publishNow` (`8.0`).
- `CQR_AUTOPUBLISH_DAILY_CAP` — max score-gated auto-publishes per rolling 24h
  (default `25`). Excess is queued, not lost. A runaway ingestion loop cannot
  flood the site.

---

## The pipeline

| # | Stage | Owner | Mechanism | Guardrail |
|---|-------|-------|-----------|-----------|
| 1 | Produce + translate content | Paperclip editors | internal to Paperclip | Paperclip editorial review |
| 2 | Deliver to queue | Paperclip | `POST /api/reports` with `INGESTION_API_KEY` (± `autoPublish`) | internal-ticket filter + type/score gate |
| 3a | Auto-publish | Website | Daily Brief, or score ≥ floor → `status=published` | server-side CQR score, daily cap, hygiene backstop |
| 3b | Board decision | Board | Telegram card **or** admin panel | human judgement (all Opinion/Editorial + anything queued) |
| 4 | Publish (queued items) | Board | admin panel "Publish" **or** Telegram "Publish" → `status=published` | hygiene backstop; all translations publish together |

**There is no separate design sign-off step.** Board **approval is design +
editorial approval** in one act.

**The board's decision (Stage 3b) is one of three:**
- **Approve** → `status=approved`. Cleared and ready to publish.
- **Reject** → `status=rejected`, with a **mandatory comment**. Empty comment is
  refused (`400`). The desk reworks; the board re-approves (rejected → approved).
- **Delete** → removes the report entirely (`DELETE /api/reports/[id]`).

---

## Who can publish

Two human channels for anything the board must decide, plus the automated gate
for scored news content.

1. **Admin panel** — `https://www.src-advisory.ch/admin/reports`
   Authenticated by your logged-in admin **session** (email in `ADMIN_EMAILS`).
   Handles approve → publish for queued items.

2. **Telegram approval card** — the SRC Editorial bot.
   Only **allow-listed Telegram IDs** (`TELEGRAM_ALLOWED_IDS`) can act, behind a
   verified webhook secret. Auto-published items send a **notice** card (no vote
   buttons); queued items send an **Approve / Publish / Reject** card.

There is **no programmatic publish key**. `ADMIN_API_KEY` exists for break-glass
scripting only and is **never** shared with the Paperclip/CTO agent.

---

## Server-enforced guardrails (cannot be bypassed)

- **Opinion/Editorial are board-only:** `BOARD_ONLY_TYPES` in the ingestion
  route. `autoPublish` is ignored for these types; they always land `pending`.
- **The website owns the score:** Paperclip cannot submit a CQR composite that
  affects publishing. The site scores the submitted text itself.
- **Auto-publish floor + daily cap:** composite must clear the threshold; a
  rolling-24h cap bounds volume. Both configurable via env, both fail safe.
- **Publish hygiene backstop:** `validateDesignGate()` in `src/lib/db.ts`
  blocks publish if title/summary contain internal markers or the byline is
  missing. Applies to the board publish path.
- **Rejection needs a reason:** `action=rejected` with an empty comment is
  refused (`400`).
- **Simultaneous translations:** publishing a report with a `sourceRef`
  publishes all sibling translations (de/fr/it) in one transaction.
- **Ingestion filter:** `internalTicketReason()` rejects Paperclip workflow
  tickets before they reach the queue (and before any scoring cost is spent).
- **Auth separation:**
  - `INGESTION_API_KEY` → POST ingestion + request auto-publish. Cannot publish
    Opinion/Editorial, cannot set its own score, cannot approve/reject/edit.
  - Admin session / `ADMIN_API_KEY` → full review + publish + user management.
  - No key grants an agent the board's authority over Opinion/Editorial.

---

## What Paperclip / the CTO agent may and may not do

**May:**
- `POST /api/reports` with `INGESTION_API_KEY` to add finished content.
- Set `autoPublish: true` to request auto-publishing of **news-grade** content.
  The website decides via its own score. Paperclip learns from `cqrComposite`
  in the response what clears the bar.
- Read-back a just-ingested report to verify the write.

**May not (and cannot):**
- Auto-publish Opinion or Editorial — always board-gated, flag ignored.
- Supply a CQR score that influences publishing — the website scores the text.
- Approve, reject, delete, or edit reports.
- `git push`, deploy, or request deploy credentials — publishing needs none.
- Hold `ADMIN_API_KEY` or any publish key.

---

## Quick reference

```
Ingest (Paperclip):
  POST https://www.src-advisory.ch/api/reports
  Authorization: Bearer <INGESTION_API_KEY>
  Body: {
    title, summary, content, section, type, language, sourceRef, author,
    autoPublish: true          // optional; request auto-publish
  }

Outcomes (server decides):
  Daily Brief                        → published immediately
  Analysis/Report/etc + autoPublish  → scored; published if composite ≥ floor,
                                        else pending (board)
  Opinion / Editorial                → always pending (board); flag ignored
  autoPublish omitted                → pending (board), as before

Response includes:
  status         "published" | "pending"
  cqrComposite   number | null   (the website's score, for learning)
  message        human-readable outcome

Review (Board, panel): /admin/reports
  Approve → Publish (all translations together) | Reject (reason) | Delete

Board (Telegram):
  Auto-published items → notice only.
  Queued items → Approve / Publish (Reject + Delete are panel-only).
```
