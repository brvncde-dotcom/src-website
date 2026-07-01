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

## 3. Rescope Paperclip to ingestion only

Paperclip's editorial agents are responsible for producing finished content and
delivering it to the review queue. That is the end of their authority.

**The only website call Paperclip makes:**

```
POST https://www.src-advisory.ch/api/reports
Authorization: Bearer <INGESTION_API_KEY>
Content-Type: application/json

{
  "title":    "...",
  "summary":  "...",
  "content":  "...(markdown)...",
  "section":  "energy-resources",          // one of the 6 focus areas
  "type":     "Analysis",
  "language": "en",                          // en | de | fr | it
  "sourceRef":"SRC-XXX",                     // shared across translations
  "author":   "SRC ... Desk"
}
→ 201 Created, status = "pending"
```

Translations share the same `sourceRef` so they publish together later.

Paperclip does **not** approve, sign off, or publish. Those are board actions on
the website (admin panel or Telegram). After a successful `POST`, Paperclip's
job for that report is **done** — it waits for the board, it does not chase.

---

## 4. Close the stuck tickets

- Close / mark won't-do every publish-pipeline and deploy ticket (SRC-557,
  SRC-571, SRC-572, SRC-573, SRC-575 publish steps, and any similar).
- Resolution note for each:
  > Publishing is board-gated and performed on the website (admin panel /
  > Telegram). Agents have no publish role. Publishing requires no deploy.
  > Closing per the new PUBLISHING.md workflow.

---

## 5. Workflow change — design sign-off is now a PRE-approval gate

**Effective now:** design sign-off (Gate 3) must be recorded **before** the
board approves a report — not just before publish. The website enforces this:
`action=approved` on a report with no `designSignedOffBy` is rejected with
`422 Gate 3 block`.

New order: **Ingest (pending) → Design sign-off → Board approval → Publish.**

What Paperclip agents must do:
- Ensure every report delivered to the queue is **design/editorially complete**
  and ready for sign-off. Do not deliver drafts that still need design work.
- Do NOT attempt to approve — approval (and the sign-off that precedes it) are
  board actions on the website. Paperclip still stops at ingestion.
- If a report is bounced back, it will sit at `pending` until design is signed
  off and the board approves. That is expected, not a failure state.

## 6. What "done" looks like

- Content ingested → sits at `pending` → board publishes when ready.
- No agent ever waits on a key, a token, or a deploy.
- No publish ticket can ever be "blocked," because no agent owns publishing.
