# Paperclip Configuration Reset — Publishing Workflow

Paste this into Paperclip to end the CTO publishing loop for good. It corrects
the root-cause misconception and rescopes the agents.

---

## 1. The correction (read first)

**Publishing a report is NOT deploying the website.**

The SRC website is already deployed. It serves reports **dynamically from a
database**. Publishing a report is a single API call that flips its status to
`published` — the site reflects it instantly. There is **no build, no
`git push`, no Vercel deploy, no deploy token** involved in publishing.

Every "deploy pending / need git push / need deploy credentials" message about
publishing has been chasing a problem that does not exist. Stop.

---

## 2. Delete the CTO's publish/deploy role

In the CTO agent's `AGENTS.md` / role config:

- **Remove** any responsibility framed as "deploy the website", "publish
  reports", "push to production", or "manage deploy credentials".
- **Remove** the requirement to update `AGENTS.md` hard boundaries to permit
  website API calls for publishing — it is moot, because the CTO does not
  publish at all.
- **Do not** inject `PAPERCLIP_PUBLISH_KEY`, `ADMIN_API_KEY`, GitHub tokens, or
  Vercel tokens into any agent. They are not needed and must not be held by
  agents. (The publish key has been removed from the website entirely.)

The CTO's correct scope going forward: engineering/ops advisory only. It has
**no role in the editorial publishing pipeline.**

---

## 3. Rescope Paperclip to ingestion (with a request-to-publish flag)

Paperclip's editorial agents produce finished content and deliver it to the
website. For **news-grade** content they may **request** auto-publishing; the
website decides via its own quality score. That is the extent of their
authority — they never flip the switch themselves and never touch the score.

**The only website call Paperclip makes:**

```
POST https://www.src-advisory.ch/api/reports
Authorization: Bearer <INGESTION_API_KEY>
Content-Type: application/json

{
  "title":       "...",
  "summary":     "...",
  "content":     "...(markdown)...",
  "section":     "energy-resources",       // one of the 6 focus areas
  "type":        "Analysis",
  "language":    "en",                       // en | de | fr | it
  "sourceRef":   "SRC-XXX",                  // shared across translations
  "author":      "SRC ... Desk",
  "autoPublish": true                        // optional — request auto-publish
}
```

**What `autoPublish: true` does (the website enforces all of this):**

| type | result |
|---|---|
| Daily Brief | published immediately |
| Analysis / Report / Strategy Paper / Statement / Brief | website scores the text; **published if the CQR composite clears the floor** (default 8.0), otherwise `pending` for the board |
| Opinion / Editorial | flag **ignored** — always `pending` for the board |

Omit `autoPublish` (or send `false`) and everything sits at `pending` as before.

**Paperclip does NOT supply a CQR score.** The website scores the words you
sent, server-side, so there is nothing to game. The `201` response tells you
what happened so you can learn:

```
{ "status": "published" | "pending",
  "cqrComposite": 8.3,                         // the website's score (or null)
  "message": "auto-published — CQR 8.3 (Publish immediately)" }
```

If a piece is queued because it scored below the floor, the `message` says so
(e.g. `CQR 6.9 (Publish with review) below auto-publish floor 8.0 — queued`).
Raise the quality — sharper sourcing, clearer analysis — and re-ingest.

Translations share the same `sourceRef` so they publish together.

Paperclip does **not** approve, sign off, publish Opinion/Editorial, or edit.
Those are board actions on the website (admin panel or Telegram). After a
successful `POST`, Paperclip's job for that report is **done** — it does not
chase.

---

## 4. Close the stuck tickets

- Close / mark won't-do every publish-pipeline and deploy ticket (SRC-557,
  SRC-571, SRC-572, SRC-573, SRC-575 publish steps, and any similar).
- Resolution note for each:
  > Publishing is board-gated and performed on the website (admin panel /
  > Telegram). Agents have no publish role. Publishing requires no deploy.
  > Closing per the new PUBLISHING.md workflow.

---

## 5. Two flows: auto-publish and board review

**Auto-publish (news-grade content).** Ingest with `autoPublish: true`. The
website publishes Daily Briefs immediately and scores everything else; if it
clears the floor it goes live with no human step. This is the constant-flow
path — use it for your Analyses, Reports, and Briefs.

**Board review (Opinion/Editorial, and anything that scored below the floor).**
There is **no design sign-off step**. Board **approval = design + editorial
approval** in one act. The board's decision is one of three:

- **Approve** → ready to publish.
- **Reject** → mandatory comment (what must change) → `status=rejected`. The
  desk reworks; the board re-approves. This is the re-approval loop.
- **Delete** → the report is removed entirely.

What Paperclip agents must do:
- Deliver **finished, publication-ready** content (correct byline, clean
  title/summary — no internal markers). The hygiene check and internal-ticket
  filter are backstops, not your QA.
- Use `autoPublish: true` for news-grade content you believe is ready. Read
  `cqrComposite` in the response; if it was queued for scoring below the floor,
  improve and re-ingest.
- Never set `autoPublish` on Opinion/Editorial expecting it to work — it is
  ignored by design. Those always go to the board.
- On **rejection**, read the board's comment and rework, then re-ingest the
  updated version (same `sourceRef` + `language` updates the existing row). Do
  not open tickets or argue — act on the comment.
- Do NOT approve, reject, delete, publish Opinion/Editorial, or edit. Those are
  board actions on the website.

## 6. What "done" looks like

- News-grade content ingested with `autoPublish` → scored → live if it clears
  the bar, else queued for the board. Constant flow, no human bottleneck.
- Opinion/Editorial ingested → sits at `pending` → board publishes when ready.
- No agent ever waits on a key, a token, or a deploy.
- No publish ticket can ever be "blocked" — the agent never owns the switch.
