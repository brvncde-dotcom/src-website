// Generate a self-contained HTML acceptance artifact for the SRC report renderer.
//
// Renders the Design Director's sample formats (1 GFM table + 1 inline SVG chart
// + 1 image figure + 1 callout) through the EXACT pipeline that
// src/components/MarkdownRenderer.tsx uses:
//   remark-gfm  +  remark-rehype(allowDangerousHtml)  +  rehype-raw
//   +  rehype-sanitize(reportSanitizeSchema)  +  rehype-stringify
// and wraps it in the ACTUAL CSS from src/app/globals.css (the :root tokens +
// all .prose-src rules), mirroring how reports/[id]/page.tsx renders
//   <article className="prose-src"><MarkdownRenderer .../></article>
//
// The output is a standalone .html file the Design Director can open in a
// browser to do visual format acceptance WITHOUT needing a live staging URL.
//
// Run:  node scripts/render-artifact.mjs [out.html]
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- reportSanitizeSchema (mirror of src/lib/report-render.ts) ---------------
const svgTags = [
  "svg", "g", "rect", "text", "tspan", "line", "path", "circle", "ellipse",
  "polyline", "polygon", "title", "desc", "defs", "use", "linearGradient",
  "radialGradient", "stop", "pattern", "clipPath",
];
const svgAttributes = [
  "id", "className", "dataChartType", "viewBox", "xmlns", "xmlnsXlink", "role",
  "ariaLabel", "ariaLabelledBy", "ariaHidden", "x", "y", "x1", "y1", "x2",
  "y2", "width", "height", "cx", "cy", "r", "rx", "ry", "fx", "fy", "d",
  "points", "transform", "fill", "fillOpacity", "fillRule", "stroke",
  "strokeWidth", "strokeLinecap", "strokeLinejoin", "strokeDasharray",
  "strokeOpacity", "opacity", "textAnchor", "fontSize", "fontWeight",
  "fontFamily", "href", "xlinkHref", "offset", "gradientTransform",
  "gradientUnits", "spreadMethod", "stopColor", "stopOpacity", "patternUnits",
  "patternTransform", "clipPathUnits",
];
const svgAttributeRecord = {};
for (const tag of svgTags) svgAttributeRecord[tag] = svgAttributes;
const reportSanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...((defaultSchema.tagNames ?? [])),
    "figure", "figcaption", "aside", ...svgTags,
  ],
  attributes: {
    ...defaultSchema.attributes,
    "*": [
      ...((defaultSchema.attributes?.["*"] ?? [])),
      "className", "dataChartType", "role", "ariaLabel", "ariaLabelledBy",
      "ariaHidden",
    ],
    img: [...((defaultSchema.attributes?.img ?? [])), "loading"],
    ...svgAttributeRecord,
  },
  strip: ["script"],
};

// --- CSS extracted verbatim from src/app/globals.css -------------------------
// :root raw variables + all .prose-src rules. Tailwind @import/@theme/@apply
// directives are intentionally omitted (they don't apply to a standalone doc).
const css = `
:root {
  --background: #FFFFFF; --foreground: #0A2540; --primary: #0A2540;
  --primary-foreground: #FFFFFF; --secondary: #F4F6F9; --muted: #F4F6F9;
  --muted-foreground: #5A6B7F; --accent: #FDF2F2; --accent-foreground: #E8272C;
  --destructive: #E8272C; --border: #D8DEE6; --input: #D8DEE6; --ring: #0A2540;
  --radius: 0.25rem;
}
body { background: var(--background); color: var(--foreground); margin: 0; }
.prose-src { color: #0A2540; line-height: 1.75; font-size: 1.05rem;
  font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
.prose-src h1 { font-family: Georgia, "Times New Roman", serif; font-size: 1.875rem;
  font-weight: 700; margin-top: 2.5rem; margin-bottom: 1rem; letter-spacing: -0.01em; line-height: 1.2; }
.prose-src h2 { font-family: Georgia, "Times New Roman", serif; font-size: 1.5rem;
  font-weight: 700; margin-top: 2rem; margin-bottom: 0.75rem; letter-spacing: -0.01em;
  line-height: 1.25; padding-bottom: 0.5rem; border-bottom: 1px solid #D8DEE6; }
.prose-src h3 { font-weight: 700; font-size: 1.2rem; margin-top: 1.75rem; margin-bottom: 0.5rem; }
.prose-src p { margin-bottom: 1.25rem; }
.prose-src ul, .prose-src ol { margin-bottom: 1.25rem; padding-left: 1.5rem; }
.prose-src ul { list-style-type: disc; } .prose-src ol { list-style-type: decimal; }
.prose-src li { margin-bottom: 0.35rem; } .prose-src strong { font-weight: 700; }
.prose-src blockquote { border-left: 3px solid #E8272C; padding-left: 1.25rem; margin: 1.5rem 0; color: #5A6B7F; font-style: italic; }
.prose-src code { background: #F4F6F9; padding: 0.15rem 0.4rem; border-radius: 0.2rem; font-size: 0.9em; }
.prose-src pre { background: #0A2540; color: #E8ECF1; padding: 1.25rem 1.5rem; border-radius: 0.25rem; overflow-x: auto; margin: 1.5rem 0; font-size: 0.875rem; line-height: 1.6; }
.prose-src pre code { background: none; padding: 0; color: inherit; }
.prose-src a { color: #E8272C; text-decoration: underline; text-underline-offset: 2px; }
.prose-src a:hover { color: #0A2540; }
.prose-src hr { border: none; border-top: 1px solid #D8DEE6; margin: 2rem 0; }
.prose-src table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.95rem; }
.prose-src th { text-align: left; padding: 0.75rem 1rem; background: #F4F6F9; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: #5A6B7F; border-bottom: 2px solid #D8DEE6; }
.prose-src td { padding: 0.65rem 1rem; border-bottom: 1px solid #D8DEE6; }
.prose-src tr:last-child td { border-bottom: none; }
.prose-src { --src-ink: #0A2540; --src-accent: #0A2540; --src-accent-mid: #2e6da4;
  --src-accent-light: #E7EEF5; --src-highlight: #e85d04; --src-positive: #2d6a4f;
  --src-warning: #b8860b; --src-neutral: #F4F6F9; --src-rule: #D8DEE6; --src-white: #FFFFFF;
  overflow-wrap: break-word; }
.prose-src thead th { background: #d0e4f7; color: var(--src-ink); font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; padding: 0.6rem 0.75rem; border-bottom: 2px solid var(--src-accent-mid); }
.prose-src tbody tr:nth-child(even) td { background: var(--src-neutral); }
.prose-src td, .prose-src th { border: 1px solid var(--src-rule); vertical-align: top; }
.prose-src table { display: block; overflow-x: auto; -webkit-overflow-scrolling: touch; }
.prose-src caption { caption-side: bottom; font-size: 0.8125rem; color: var(--muted-foreground); margin-top: 0.5rem; text-align: left; }
.prose-src .src-chart { margin: 2rem 0; overflow-x: auto; }
.prose-src .src-chart svg { max-width: 100%; height: auto; display: block; }
.prose-src .src-figure { margin: 2rem 0; }
.prose-src .src-figure img { max-width: 100%; height: auto; display: block; border-radius: 0.25rem; }
.prose-src .src-chart figcaption, .prose-src .src-figure figcaption { font-size: 0.8125rem; color: var(--muted-foreground); margin-top: 0.5rem; line-height: 1.5; }
.prose-src .src-source { display: block; font-style: italic; margin-top: 0.25rem; }
.prose-src .src-callout { border-left: 4px solid var(--src-accent-mid); background: var(--src-neutral); padding: 1rem 1.25rem; margin: 1.5rem 0; border-radius: 0 0.25rem 0.25rem 0; }
.prose-src .src-callout--key-finding { border-left-color: var(--src-highlight); }
.prose-src .src-callout--warning { border-left-color: #d4a017; background: #fffbf0; }
.prose-src .src-callout--definition { border-left-color: var(--src-accent-mid); }
.prose-src .src-callout p { margin: 0 0 0.5rem; }
.prose-src .src-callout p:last-child { margin-bottom: 0; }
/* artifact framing only — not part of the site */
.artifact-frame { max-width: 72ch; margin: 2rem auto; padding: 0 1.5rem; }
.artifact-note { font-size: 0.8rem; color: #5A6B7F; border: 1px dashed #D8DEE6; padding: 0.75rem 1rem; border-radius: 0.25rem; margin-bottom: 2rem; }
`;

// --- sample report: 1 table + 1 SVG chart + 1 image figure + 1 callout -------
const sample = `# Sample SRC Report — Renderer Acceptance

## Risk Overview

| Domain | Risk Level | Trend | Notes |
|--------|------------|-------|-------|
| Digital / AI | High | Rising | Capability diffusion outpacing governance |
| Geopolitics | Elevated | Stable | Three active flashpoints |
| Energy | Moderate | Falling | Diversification accelerating |

<figure class="src-chart" data-chart-type="bar">
  <svg viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Risk score by domain">
    <rect x="40" y="120" width="120" height="130" fill="#2e6da4" />
    <rect x="200" y="60" width="120" height="190" fill="#e85d04" />
    <rect x="360" y="160" width="120" height="90" fill="#2d6a4f" />
    <text x="100" y="270" text-anchor="middle">Digital</text>
    <text x="260" y="270" text-anchor="middle">Geopolitics</text>
    <text x="420" y="270" text-anchor="middle">Energy</text>
  </svg>
  <figcaption>
    <strong>Figure 1:</strong> Risk score by domain.
    <span class="src-source">Source: SRC original. [CLEARED — SRC-original rendering]</span>
  </figcaption>
</figure>

<figure class="src-figure">
  <img src="https://placehold.co/600x300/0A2540/FFFFFF/png?text=SRC+Figure+Placeholder" alt="Figure 2: AI capability curve" loading="lazy" />
  <figcaption><strong>Figure 2:</strong> AI capability curve. <span class="src-source">SRC-original.</span></figcaption>
</figure>

<aside class="src-callout src-callout--key-finding">
  <p><strong>Key Finding:</strong> AI risk concentration is rising fastest across all tracked domains.</p>
  <p>Two- to three-sentence elaboration goes here. The callout uses the key-finding variant (red accent border).</p>
</aside>

<aside class="src-callout src-callout--warning">
  <p><strong>Warning:</strong> Governance lags are widening the exposure window.</p>
</aside>

<aside class="src-callout src-callout--definition">
  <p><strong>Definition:</strong> "Capability diffusion" denotes the spread of dual-use AI tooling to non-state actors.</p>
</aside>
`;

const file = await unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSanitize, reportSanitizeSchema)
  .use(rehypeStringify)
  .process(sample);

const rendered = String(file);

// fidelity checks (same as verify-render.mjs)
const has = (s) => rendered.includes(s);
const checks = [
  ["GFM table -> <table>/<thead>/<tbody>", has("<table") && has("<thead") && has("<tbody>")],
  ["header cell <th>", has("<th")],
  ["raw pipes stripped", !has("|---|") && !has("| -------- |")],
  ["inline SVG <svg>", has("<svg")],
  ["src-chart class", has('class="src-chart"')],
  ["data-chart-type", has("data-chart-type")],
  ["svg geometry <rect>", has("<rect")],
  ["svg <text>", has("<text")],
  ["<figcaption>", has("<figcaption")],
  ["<img>", has("<img")],
  ["callout key-finding", has('class="src-callout src-callout--key-finding"')],
  ["callout warning", has('class="src-callout src-callout--warning"')],
  ["callout definition", has('class="src-callout src-callout--definition"')],
  ["<script> stripped", !has("<script")],
];
let failed = 0;
for (const [name, pass] of checks) { if (!pass) failed++; console.log(`  [${pass ? "PASS" : "FAIL"}] ${name}`); }

const doc = `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>SRC Report Renderer — Acceptance Artifact (SRC-264)</title>
<style>${css}</style></head>
<body>
<div class="artifact-frame">
  <div class="artifact-note">
    <strong>SRC report renderer — acceptance artifact (SRC-264).</strong><br/>
    Rendered through the production pipeline (remark-gfm + rehype-raw +
    rehype-sanitize) with the actual <code>globals.css</code> <code>.prose-src</code>
    styles. This is a faithful standalone preview of how report content renders
    on the site; it is not the live page shell. Open this file in any browser.
  </div>
  <article class="prose-src">
${rendered}
  </article>
</div>
</body></html>
`;

const outPath = process.argv[2] || join(__dirname, "..", "src-report-render-preview.html");
writeFileSync(outPath, doc, "utf8");
console.log(`\nWrote artifact: ${outPath} (${doc.length} bytes)`);
console.log(failed === 0 ? "RESULT: ALL CHECKS PASSED." : `RESULT: ${failed} CHECK(S) FAILED.`);
process.exit(failed === 0 ? 0 : 1);
