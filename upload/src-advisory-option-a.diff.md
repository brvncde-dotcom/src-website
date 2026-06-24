# SRC — Option A Repositioning · Change Set
> "Global Security Intelligence. Swiss Independence."
> Apply these exact string replacements across your Next.js project.

---

## 1. `app/layout.tsx` — Metadata

### title

```diff
- SRC — Security & Resilience Counsel | D-A-CH Think Tank
+ SRC — Security & Resilience Counsel | Global Think Tank
```

### meta description

```diff
- The leading non-partisan, fact-based think tank for the security and resilience
- of critical infrastructures in the D-A-CH region (Switzerland, Germany, Austria).
+ The leading non-partisan, fact-based think tank for global security and resilience —
+ independent analysis grounded in Swiss neutrality.
```

### og:description

```diff
- The leading non-partisan think tank for critical infrastructure security
- and resilience in the D-A-CH region.
+ Independent, global analysis on security, resilience, and geopolitics —
+ grounded in Swiss neutrality.
```

### og:title  *(no change needed)*

### twitter:description

```diff
- The leading non-partisan think tank for critical infrastructure security
- and resilience in the D-A-CH region.
+ Independent, global analysis on security, resilience, and geopolitics —
+ grounded in Swiss neutrality.
```

### meta keywords

```diff
- SRC,Security & Resilience Counsel,think tank,critical infrastructure,ICT security,
- energy security,D-A-CH,resilience,security
+ SRC,Security & Resilience Counsel,think tank,global security,geopolitics,
+ energy security,AI governance,resilience,Swiss think tank,independent analysis
```

---

## 2. Hero Component — Eyebrow Label

Likely in `components/Hero.tsx` or inline in `app/page.tsx`.

```diff
- D-A-CH Think Tank
+ Independent Think Tank · Based in Switzerland
```

---

## 3. Hero Component — Headline

```diff
- Security & Resilience
- for Critical Infrastructure
+ Global Security Intelligence.
+ Swiss Independence.
```

> Note: "Swiss Independence." should carry the red accent colour (currently applied
> to "for Critical Infrastructure"). No style change needed — just swap the text.

---

## 4. Hero Component — Subtitle

```diff
- Independent, fact-based analysis on the most pressing security
- and resilience challenges facing the D-A-CH region.
+ From energy transitions and AI governance to geopolitical risk and societal
+ resilience — SRC delivers non-partisan, expert-validated analysis trusted
+ by decision-makers worldwide.
```

---

## 5. Nav — CTA Button

Likely in `components/Header.tsx` or `components/Nav.tsx`.

```diff
- Member Access →
+ Member Portal →
```

---

## 6. Footer — Tagline / Description

```diff
- A non-partisan, fact-based think tank for the security and resilience
- of critical infrastructures in the D-A-CH region.
+ Independent, global analysis on security and resilience —
+ grounded in Swiss neutrality.
```

---

## 7. Footer — Location Line  *(keep, small tweak)*

```diff
- Based in Zug, Switzerland
+ Based in Zug, Switzerland · Global Scope
```

---

## Summary Checklist

| # | File | Change | Status |
|---|------|--------|--------|
| 1a | `app/layout.tsx` | `<title>` tag | ☐ |
| 1b | `app/layout.tsx` | `meta description` | ☐ |
| 1c | `app/layout.tsx` | `og:description` | ☐ |
| 1d | `app/layout.tsx` | `twitter:description` | ☐ |
| 1e | `app/layout.tsx` | `meta keywords` | ☐ |
| 2  | Hero component | Eyebrow label | ☐ |
| 3  | Hero component | Headline (2 lines) | ☐ |
| 4  | Hero component | Subtitle paragraph | ☐ |
| 5  | Nav/Header component | CTA button label | ☐ |
| 6  | Footer component | Tagline | ☐ |
| 7  | Footer component | Location line | ☐ |

**Total: 11 string replacements across ~3–4 files. No structural or style changes required.**
