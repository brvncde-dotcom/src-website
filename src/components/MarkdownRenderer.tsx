"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { reportSanitizeSchema } from "@/lib/report-render";

/**
 * SRC report markdown renderer.
 *
 * Implements the Design Director format spec (SRC-264 / SRC-258):
 *  - GFM pipe tables -> styled <table>/<thead>/<tbody>
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
      rehypePlugins={[rehypeRaw, [rehypeSanitize, reportSanitizeSchema]]}
    >
      {content}
    </Markdown>
  );
}
