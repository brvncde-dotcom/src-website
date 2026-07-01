# Publishing Workflow — SRC Advisory

This is the **source of truth** for how a report goes from draft to live on
`www.src-advisory.ch`. It is deliberately **board-gated**: no autonomous agent
can publish, and no autonomous agent can block publishing.

---

## The one fact that fixes everything

**Publishing is NOT deploying.**

- Publishing a report = flipping a database field: `status = "published"`.
- The live site reads published reports **dynamically** from the database.
- The instant `status` flips, the report is live. No build. No `git push`. No
  Vercel deploy. No credentials.

Any request to "deploy the website to publish a report" is based on a
misunderstanding. The site is already deployed and serves whatever is in the
database. Ignore all deploy/git/token requests related to publishing.

---

## The pipeline

| # | Stage | Owner | Mechanism | Guardrail |
|---|-------|-------|-----------|-----------|
| 1 | Produce + translate content | Paperclip editors | internal to Paperclip | Paperclip editorial review |
| 2 | Deliver to queue | Paperclip | `POST /api/reports` with `INGESTION_API_KEY` → `status=pending` | internal-ticket filter (`internalTicketReason`) |
| 3 | Design sign-off | Design Director / Editor-in-Chief | admin panel checkbox → sets `designSignedOffBy` | **Gate 3 (hard gate)** |
| 4 | Board approval | Board | Telegram card **or** admin panel → `status=approved` | **requires Gate 3 first**; human decision |
| 5 | Publish | Board | admin panel "Publish" **or** Telegram "Publish" → `status=published` | Gate 3 re-checked; all translations publish together |

**Gate order:** design is signed off (Stage 3) **before** the board can approve
(Stage 4). A report that is not design-signed-off **cannot be approved** — the
API returns `422 Gate 3 block` on `action=approved`, not just on publish.

**Paperclip's responsibility ends at Stage 2.** It fills the pending queue.
It never signs off, approves, or publishes.

---

## Who can publish (the only two channels)

Publishing requires proof you are the board. There are exactly two ways:

1. **Admin panel** — `https://www.src-advisory.ch/admin/reports`
   Authenticated by your logged-in admin **session** (email in `ADMIN_EMAILS`).
   No key to type. Sign off Gate 3 (amber checkbox) and click **Publish**.
   This is the primary channel and handles the full flow (approve → sign-off →
   publish) in one place.

2. **Telegram approval card** — the SRC Editorial bot.
   When a report is ingested you get a card with **Approve / Publish / Reject**.
   Only **allow-listed Telegram IDs** (`TELEGRAM_ALLOWED_IDS`) can act, behind a
   verified webhook secret. The **Publish** tap runs server-side and enforces
   Gate 3 — it will refuse if design sign-off is missing.
   Note: the design sign-off itself (Stage 4) is recorded in the panel. Use
   Telegram for the final publish once a report is signed off, or for approve/
   reject triage on the go.

There is **no third channel**. In particular there is **no programmatic publish
key**. `ADMIN_API_KEY` exists for break-glass scripting only and is **never**
shared with the Paperclip/CTO agent.

---

## Server-enforced guardrails (cannot be bypassed)

- **Gate 3 (design sign-off):** `validateDesignGate()` in `src/lib/db.ts`
  requires `author`, a recorded `designSignedOffBy`, and clean title/summary.
  Enforced on **both `approved` and `published`** actions, in **both** board
  channels (`PATCH /api/reports/[id]` and the Telegram handler). Design must be
  signed off before the board can approve — approval of an unsigned report is
  rejected with `422`.
- **Simultaneous translations:** publishing a report with a `sourceRef`
  publishes all its sibling translations (de/fr/it) in the same transaction, so
  a story is never half-live.
- **Ingestion filter:** `internalTicketReason()` rejects Paperclip workflow
  tickets (translation tasks, review gates, engineering tasks) so they never
  reach the public queue.
- **Auth separation:**
  - `INGESTION_API_KEY` → POST ingestion only (cannot publish).
  - Admin session / `ADMIN_API_KEY` → full review + publish.
  - No key grants publish to an agent.

---

## What Paperclip / the CTO agent may and may not do

**May:**
- `POST /api/reports` with `INGESTION_API_KEY` to add finished content as
  `pending`.
- Read-back a just-ingested report to verify the write.

**May not (and cannot):**
- Publish, approve, reject, or edit reports.
- `git push`, deploy, or request deploy credentials — publishing needs none.
- Hold `ADMIN_API_KEY` or any publish key.

If an agent reports itself "blocked pending publish rights," the answer is: it
was never supposed to have them. The board publishes. Close the ticket.

---

## Quick reference

```
Ingest (Paperclip):
  POST https://www.src-advisory.ch/api/reports
  Authorization: Bearer <INGESTION_API_KEY>
  Body: { title, summary, content, section, type, language, sourceRef, author }
  → creates status=pending

Review + publish (Board, panel):
  /admin/reports → tick Gate-3 design sign-off → Approve → Publish
  (Approve is blocked until design is signed off.)

Publish (Board, Telegram):
  Approval card → Approve/Publish  (both require design sign-off first)
```
