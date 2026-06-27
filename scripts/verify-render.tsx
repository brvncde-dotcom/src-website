import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import Markdown from "react-markdown";
import MarkdownRenderer from "../src/components/MarkdownRenderer";

// Sample report exercising every format in the Design Director's spec:
//  - GFM pipe table (Format 1)
//  - inline SVG bar chart inside <figure class="src-chart"> (Format 2)
//  - markdown image figure (Format 3)
//  - callout / aside block (Format 4)
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

![Figure 2: AI capability curve](/reports/assets/capability-curve.svg)

<aside class="src-callout src-callout--key-finding">
  <p><strong>Key Finding:</strong> AI risk concentration is rising fastest.</p>
  <p>Two- to three-sentence elaboration goes here.</p>
</aside>
`;

type Check = { name: string; pass: boolean; detail: string };

function check(label: string, condition: boolean, detail: string): Check {
  return { name: label, pass: condition, detail };
}

function run(label: string, html: string): Check[] {
  const has = (s: string) => html.includes(s);
  return [
    check(
      `${label}: table renders as <table>`,
      has("<table") && has("<thead") && has("<tbody"),
      has("<table") ? "found <table>" : "NO <table>",
    ),
    check(
      `${label}: header cell <th> present`,
      has("<th"),
      has("<th") ? "found <th>" : "NO <th>",
    ),
    check(
      `${label}: raw pipe syntax stripped`,
      !has("|---|") && !has("| -------- |"),
      !has("|---|") ? "no raw pipes" : "raw pipes leaked",
    ),
    check(
      `${label}: inline SVG chart present`,
      has("<svg") && has('class="src-chart"'),
      has("<svg") ? "found <svg>" : "NO <svg>",
    ),
    check(
      `${label}: svg geometry preserved (rect/line/text)`,
      has("<rect") && has("<text"),
      has("<rect") ? "rect+text kept" : "svg children stripped",
    ),
    check(
      `${label}: figcaption present`,
      has("<figcaption"),
      has("<figcaption") ? "found <figcaption>" : "NO <figcaption>",
    ),
    check(
      `${label}: callout aside present`,
      has('class="src-callout src-callout--key-finding"'),
      has("src-callout") ? "found callout" : "NO callout",
    ),
    check(
      `${label}: markdown image rendered`,
      has("<img") && has("/reports/assets/capability-curve.svg"),
      has("<img") ? "found <img>" : "NO <img>",
    ),
    check(
      `${label}: no <script> leaked`,
      !has("<script"),
      !has("<script") ? "clean" : "SCRIPT LEAKED",
    ),
  ];
}

const beforeHtml = renderToStaticMarkup(
  React.createElement(Markdown, null, sample),
);

const afterHtml = renderToStaticMarkup(
  React.createElement(MarkdownRenderer, { content: sample }),
);

const beforeChecks = run("BEFORE (no plugins)", beforeHtml);
const afterChecks = run("AFTER (gfm+raw+sanitize)", afterHtml);

let failed = 0;
const print = (checks: Check[], countFailures: boolean) => {
  for (const c of checks) {
    const mark = c.pass ? "PASS" : "FAIL";
    if (!c.pass && countFailures) failed++;
    console.log(`  [${mark}] ${c.name} — ${c.detail}`);
  }
};

// BEFORE failures are expected — they demonstrate the original bug. Only
// AFTER failures count toward the exit code.
console.log("\n=== BEFORE (old renderer: bare <Markdown>) ===");
print(beforeChecks, false);
console.log("\n=== AFTER (remarkGfm + rehypeRaw + rehypeSanitize) ===");
print(afterChecks, true);

console.log("\n--- AFTER html excerpt (table + svg + callout) ---");
const excerpt = afterHtml
  .slice(afterHtml.indexOf("<table"), afterHtml.indexOf("<table") + 400)
  .replace(/\s+/g, " ");
console.log(excerpt + "...\n");

console.log(
  failed === 0
    ? "\nRESULT: ALL AFTER-CHECKS PASSED — rendering pipeline verified."
    : `\nRESULT: ${failed} CHECK(S) FAILED.`,
);
process.exit(failed === 0 ? 0 : 1);
