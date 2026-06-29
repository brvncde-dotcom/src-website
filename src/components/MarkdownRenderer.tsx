"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { visit } from "unist-util-visit";
import { reportSanitizeSchema } from "@/lib/report-render";

// Rehype plugin: wrap every <table> in <div class="src-table-wrap">
// Tall tables (>8 body rows) also get .is-tall for sticky headers.
const rehypeWrapTables = () => (tree: any) => {
  visit(tree, "element", (node, index, parent) => {
    if (node.tagName !== "table" || !parent || index == null) return;
    const rowCount = (node.children || [])
      .flatMap((c: any) => (c.tagName === "tbody" ? c.children : []))
      .filter((c: any) => c.tagName === "tr").length;
    parent.children[index] = {
      type: "element",
      tagName: "div",
      properties: {
        className:
          rowCount > 8
            ? "src-table-wrap is-tall"
            : "src-table-wrap",
      },
      children: [node],
    };
  });
};

/**
 * SRC report markdown renderer.
 *
 * Implements the Design Director format spec (SRC-264 / SRC-258 / SRC-473):
 *  - GFM pipe tables -> styled <table>/<thead>/<tbody>
 *  - Tables wrapped in .src-table-wrap for responsive scroll + min-width
 *  - HTML passthrough (rehype-raw) for inline SVG charts, <figure>, <aside> callouts
 *  - rehype-sanitize allowlist (reportSanitizeSchema) so only the approved
 *    design tags/attributes survive while <script>/on* handlers are stripped
 *
 * Content is authored internally by SRC staff, but we still sanitise to reject
 * <script>/on* handlers while preserving the chart/figure/callout vocabulary.
 */
export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      remarkRehypeOptions={{ allowDangerousHtml: true }}
      rehypePlugins={[
        rehypeRaw,
        rehypeWrapTables,
        [rehypeSanitize, reportSanitizeSchema],
      ]}
    >
      {content}
    </Markdown>
  );
}
