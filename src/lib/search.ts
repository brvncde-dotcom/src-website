// Shared, client-safe search types and highlight helpers. Imported by both the
// /api/search route (server) and the SearchCommand palette (client) so the
// highlight markers can never drift between producer and consumer.

// Sentinel tokens ts_headline wraps around matched terms. Plain text (not HTML)
// so the client HTML-escapes the whole snippet first, then swaps these for
// <mark> — no XSS even if report content contains markup.
export const HL_START = "@@HL@@";
export const HL_END = "@@EH@@";

export type SearchHit = {
  id: string;
  title: string;
  summary: string | null;
  section: string;
  type: string;
  language: string;
  sourceRef: string | null;
  publishedAt: string | null;
  snippet: string | null;
  rank: number;
  gated: boolean;
  requiredTier: string | null;
};

export type SearchResponse = {
  results: SearchHit[];
  query: string;
  count?: number;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Escape everything, THEN turn the sentinels into <mark>. Safe for
// dangerouslySetInnerHTML — the only HTML that survives is our own <mark>.
export function highlightToHtml(snippet: string | null | undefined): string {
  if (!snippet) return "";
  return escapeHtml(snippet)
    .split(HL_START)
    .join("<mark>")
    .split(HL_END)
    .join("</mark>");
}
