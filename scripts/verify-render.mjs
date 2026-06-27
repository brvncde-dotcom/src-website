// Lean runtime verification of the SRC report rendering pipeline.
//
// This mirrors EXACTLY what src/components/MarkdownRenderer.tsx configures:
//   remark-gfm  +  remark-rehype(allowDangerousHtml)  +  rehype-raw
//   +  rehype-sanitize(reportSanitizeSchema)  +  rehype-stringify
//
// The sanitize schema is duplicated from src/lib/report-render.ts so this
// script stays self-contained (no TS / path-alias / "use client" resolution).
// If you change the schema there, mirror it here. Keeping the two in sync is
// the trade-off for a zero-build, sub-second check.
//
// Run:  node scripts/verify-render.mjs
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

// --- reportSanitizeSchema (mirror of src/lib/report-render.ts) ---------------
const svgTags = [
  "svg", "g", "rect", "text", "tspan", "line", "path", "circle", "ellipse",
  "polyline", "polygon", "title", "desc", "defs", "use", "linearGradient",
  "radialGradient", "stop", "pattern", "clipPath",
];
const svgAttributes = [
  "id", "className", "dataChartType", "viewBox", "xmlns", "xmlnsXlink", "role",
  "aria-label", "aria-labelledby", "aria-hidden", "x", "y", "x1", "y1", "x2",
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
      "className", "dataChartType", "role", "aria-label", "aria-labelledby",
      "aria-hidden",
    ],
    img: [...((defaultSchema.attributes?.img ?? [])), "loading"],
    ...svgAttributeRecord,
  },
  strip: ["script"],
};

// --- sample report exercising every format in the spec -----------------------
const sample = `# Sample SRC Report

## Risk Overview

| Domain | Risk Level | Trend |
|--------|------------|-------|
| Digital / AI | High | Rising |
| Geopolitics | Elevated | Stable |
| Energy | Moderate | Falling |

<figure class="src-chart" data-chart-type="bar">
  <svg viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Risk by domain">
    <rect x="40" y="120" width="120" height="130" fill="#2e6da4" />
    <rect x="200" y="60" width="120" height="190" fill="#E8272C" />
    <text x="100" y="270" text-anchor="middle">Digital</text>
  </svg>
  <figcaption>
    <strong>Figure 1:</strong> Risk score by domain.
    <span class="src-source">Source: SRC original. [CLEARED — SRC-original rendering]</span>
  </figcaption>
</figure>

![Figure 2: AI capability curve](/reports/assets/capability-curve.svg)

<aside class="src-callout src-callout--key-finding">
  <p><strong>Key Finding:</strong> AI risk concentration is rising fastest.</p>
  <p>Two- to three-sentence elaboration goes here.</p>
</aside>

<script>alert('xss')</script>
`;

const file = await unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSanitize, reportSanitizeSchema)
  .use(rehypeStringify)
  .process(sample);

const html = String(file);
const has = (s) => html.includes(s);

const checks = [
  ["GFM table -> <table>", has("<table")],
  ["table <thead>", has("<thead")],
  ["table <tbody>", has("<tbody")],
  ["header cell <th>", has("<th")],
  ["raw pipe syntax stripped", !has("|---|") && !has("| -------- |")],
  ["inline SVG chart <svg>", has("<svg")],
  ["src-chart class preserved", has('class="src-chart"')],
  ["data-chart-type preserved", has("data-chart-type") || has("data-chart-type")],
  ["svg geometry kept (<rect>)", has("<rect")],
  ["svg <text> kept", has("<text")],
  ["<figcaption> present", has("<figcaption")],
  ["markdown image -> <img>", has("<img") && has("/reports/assets/capability-curve.svg")],
  ["callout aside preserved", has('class="src-callout src-callout--key-finding"')],
  ["<script> stripped", !has("<script")],
];

let failed = 0;
console.log("\n=== SRC report render pipeline (remark-gfm + rehype-raw + rehype-sanitize) ===");
for (const [name, pass] of checks) {
  console.log(`  [${pass ? "PASS" : "FAIL"}] ${name}`);
  if (!pass) failed++;
}

const t = html.indexOf("<table");
console.log("\n--- table excerpt ---");
console.log(html.slice(t, t + 280).replace(/\s+/g, " ") + "...");

console.log(
  failed === 0
    ? "\nRESULT: ALL CHECKS PASSED — rendering pipeline verified."
    : `\nRESULT: ${failed} CHECK(S) FAILED.`,
);
process.exit(failed === 0 ? 0 : 1);
