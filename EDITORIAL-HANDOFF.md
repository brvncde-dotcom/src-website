# The SRC Position — Editorial Handoff for Paperclip

How Paperclip's **Editor** agent submits editorials to "The SRC Position", the
SRC website's editorial section. Companion to `PUBLISHING.md` (board-gated
publish flow) and `SRC-CQR-IMPLEMENTATION.md` (scoring framework).

## Division of responsibility

| | Owner |
|---|---|
| Editorial data, Semaform structure, author card, tier gating | **SRC website** (system of record) |
| Six-dimensional CQR scorecard shown on each editorial | **SRC website** (recomputed server-side) |
| Board approval + publish gate | **SRC website / Board** |
| Writing the editorial in Semaform structure | **Paperclip — the Editor** |
| vAvatar video + audio (later phase) | Swiss rendering pipeline |

The Editor **writes and submits**; it never publishes. Submissions land as
`pending` and go through the existing Board approval flow (panel + Telegram
card). No new credentials — the Editor uses the `INGESTION_API_KEY` it already
holds.

## Submission — one call

`POST /api/reports` with `Authorization: Bearer <INGESTION_API_KEY>`.

This is the same endpoint used for reports. To submit an editorial, set
`type: "Editorial"` and add an `editorial` object carrying the Semaform
structure. Everything outside `editorial` behaves exactly as a normal report
(title, summary, section, language, sourceRef for translation grouping, etc.).

```jsonc
{
  "title": "Nuclear is D-A-CH's only credible path to energy security",
  "summary": "One-paragraph standfirst shown in listings and to non-members.",
  "content": "Optional full markdown body (fallback if Semaform blocks absent).",
  "type": "Editorial",
  "section": "energy-resources",          // one of the 6 focus areas
  "language": "en",                         // en | de | fr | it
  "sourceRef": "src-position-2026-07-02",   // stable key groups translations
  "author": "Dr. Elena Mar://",             // display byline

  "editorial": {
    "subBrand": "position-paper",           // see sub-brands below
    "thesis": "One-sentence editorial thesis shown under the title.",

    "facts": [                              // "THE FACTS" — no analysis here
      { "claim": "Grid frequency dipped below 49.8 Hz twice in Q1.",
        "source": "Swissgrid Q1 2026 report", "trust": 8 },
      { "claim": "Nuclear provided 32% of Swiss baseload in 2025.",
        "source": "BFE statistics", "trust": 9 }
    ],

    "analysis": "THE SRC ANALYSIS — markdown. The argument, grounded in the facts. Because X, therefore Y. Reference the Worldview Matrix where positions apply.",

    "roomForDisagreement": "MANDATORY — markdown. The best counterarguments, honestly stated. 'If the following evidence emerges, our position would need revision…'",

    "theAsk": "THE ASK — markdown. Concrete recommendations. 'The Swiss Federal Council should…' — specific, not vague.",

    "authorTitle": "Focus Area Lead, Energy & Resources",
    "authorCreds": "Former IAEA analyst; PhD nuclear engineering, ETH Zürich",
    "authorLinkedin": "https://linkedin.com/in/...",
    "authorTwitter": "https://x.com/...",

    "methodology": "How this editorial was researched.",
    "sourcesCount": 14,
    "conflicts": "None"                     // or a declared conflict statement
  }
}
```

### Field notes

- **`editorial` is optional.** Omit it and you get a plain report. Present it
  and an `EditorialMeta` row is attached (1:1 with the report).
- **`facts`** — array of `{ claim, source?, trust? }`. `trust` is a 1-10 inline
  reliability indicator (clamped server-side). A plain string is also accepted
  and treated as `{ claim }`.
- **Semaform blocks** (`analysis`, `roomForDisagreement`, `theAsk`) are markdown.
  `roomForDisagreement` is editorially mandatory — every SRC editorial states
  where it might be wrong.
- **snake_case tolerated.** `sub_brand`, `room_for_disagreement`, `the_ask`,
  `author_title`, `sources_count`, `video_url` all normalize (same leniency as
  the CQR scorer).
- **Re-submitting** the same `(sourceRef, language)` **updates** the editorial
  in place (upserts the meta) — safe to re-run.
- **Video/audio** (`videoUrl`, `videoDuration`, `audioUrl`) are accepted now but
  the vAvatar Daily Position player ships in a later phase. Leave null for text.

## Sub-brands (`editorial.subBrand`)

| key | brand | default tier |
|---|---|---|
| `daily-position` | The Daily Position (vAvatar video) | Essential |
| `position-paper` | The Position Paper (long-form) | Essential |
| `guest-position` | Guest Position (external expert) | Professional |
| `debate` | The SRC Debate | Professional |
| `investigates` | SRC Investigates | Executive |
| `one-good-question` | One Good Question | Professional |
| `src-reads` | SRC Reads (reviews) | Essential |

Default is `position-paper`. Tier gating is driven by the report's `minTierId`
(set by the Board/admin); the sub-brand default is guidance, not enforcement.

## CQR scorecard

After ingestion, score the editorial via the existing CQR flow
(`POST /api/reports/:id/cqr-score`, see `SRC-CQR-IMPLEMENTATION.md`). The
website recomputes the composite server-side and renders the six-dimension
scorecard in the editorial header automatically — no extra call from the Editor.

## Lifecycle

```
Editor writes editorial (Semaform)
   │  POST /api/reports  { type: "Editorial", editorial: {...} }
   ▼
pending  ──(CQR auto-score)──►  Board reviews (panel + Telegram)
   │
   ▼  Board approves → publish (existing gate, PUBLISHING.md)
published → appears in "The SRC Position" hub, full Semaform reading page
```

## Not in this release

Guest video submission portal, the structured Debate platform, and vAvatar
video generation are later phases (see the Editorial Section Strategy roadmap).
The data model already reserves the video/audio fields so those phases add UI,
not schema.
