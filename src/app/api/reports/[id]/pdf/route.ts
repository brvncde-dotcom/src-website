import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, getUserTier } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin-auth";
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

// ── Brand colours ────────────────────────────────────────────────────────────
const NAVY = "#0A2540";
const RED = "#E8272C";
const LIGHT_GREY = "#F0F3F7";
const MID_GREY = "#6B7280";
const DIVIDER = "#D8DEE6";
const ACCENT_GREY = "#8B9BB0";

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    paddingTop: 56,
    paddingBottom: 72,
    paddingHorizontal: 60,
    fontFamily: "Times-Roman",
    fontSize: 11,
    color: NAVY,
    lineHeight: 1.55,
  },
  // ── Header (repeats on every page) ───────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: NAVY,
  },
  headerLeft: {
    flexDirection: "column",
  },
  headerLogo: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.2,
    color: NAVY,
  },
  headerTagline: {
    fontSize: 7,
    fontFamily: "Helvetica",
    color: ACCENT_GREY,
    letterSpacing: 0.4,
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
    flexDirection: "column",
  },
  codeBadge: {
    fontSize: 8,
    fontFamily: "Courier",
    color: MID_GREY,
    letterSpacing: 0.5,
  },
  typeBadge: {
    backgroundColor: NAVY,
    color: "#FFFFFF",
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 3,
  },
  // ── Title block ───────────────────────────────────────────────────────────
  titleBlock: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: "Times-Bold",
    color: NAVY,
    lineHeight: 1.25,
    marginBottom: 6,
  },
  // ── Meta strip ────────────────────────────────────────────────────────────
  metaStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 10,
    backgroundColor: LIGHT_GREY,
    borderLeftWidth: 3,
    borderLeftColor: NAVY,
  },
  metaItem: {
    fontSize: 8.5,
    fontFamily: "Helvetica",
    color: MID_GREY,
    marginRight: 12,
  },
  // ── Summary ───────────────────────────────────────────────────────────────
  summary: {
    fontSize: 12,
    fontFamily: "Times-Italic",
    color: NAVY,
    lineHeight: 1.6,
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },
  // ── Content blocks ────────────────────────────────────────────────────────
  sectionHeading: {
    marginTop: 16,
    marginBottom: 6,
    paddingLeft: 8,
    paddingTop: 4,
    paddingBottom: 4,
    backgroundColor: LIGHT_GREY,
    borderLeftWidth: 3,
    borderLeftColor: RED,
  },
  sectionHeadingText: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    lineHeight: 1.25,
  },
  subHeading: {
    marginTop: 10,
    marginBottom: 4,
  },
  subHeadingText: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    lineHeight: 1.3,
  },
  body: {
    fontSize: 10.5,
    fontFamily: "Times-Roman",
    color: "#1A1A2E",
    lineHeight: 1.65,
    marginBottom: 6,
  },
  dividerRule: {
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
    marginTop: 10,
    marginBottom: 10,
  },
  // ── Confidentiality bar ───────────────────────────────────────────────────
  confidential: {
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: DIVIDER,
    fontSize: 7.5,
    fontFamily: "Helvetica",
    color: RED,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  // ── Footer (repeats on every page) ───────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 28,
    left: 60,
    right: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: DIVIDER,
    paddingTop: 6,
  },
  footerLeft: {
    fontSize: 7.5,
    fontFamily: "Helvetica",
    color: MID_GREY,
  },
  footerRight: {
    fontSize: 7.5,
    fontFamily: "Helvetica",
    color: MID_GREY,
  },
});

// ── Markdown → PDF block parser ──────────────────────────────────────────────
// Preserves headings and paragraphs so content is readable in the PDF.
type Block =
  | { kind: "h1"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "para"; text: string }
  | { kind: "hr" };

function stripInline(s: string): string {
  return s
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/!\[[^\]]*\]\([^\)]+\)/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseMarkdown(md: string): Block[] {
  const blocks: Block[] = [];
  const lines = md.trim().split("\n");
  let paraLines: string[] = [];

  const flushPara = () => {
    const text = paraLines.join(" ").replace(/\s+/g, " ").trim();
    if (text) blocks.push({ kind: "para", text: stripInline(text) });
    paraLines = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const hMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (hMatch) {
      flushPara();
      const level = hMatch[1].length;
      const text = stripInline(hMatch[2]);
      if (level <= 2) blocks.push({ kind: "h1", text });
      else if (level === 3) blocks.push({ kind: "h2", text });
      else blocks.push({ kind: "h3", text });
    } else if (/^(-{3,}|_{3,}|\*{3,})$/.test(line.trim())) {
      flushPara();
      blocks.push({ kind: "hr" });
    } else if (line.trim() === "") {
      flushPara();
    } else {
      paraLines.push(line.trim());
    }
  }
  flushPara();
  return blocks;
}

// ── PDF document component ────────────────────────────────────────────────────
interface ReportPdfProps {
  title: string;
  code: string | null;
  type: string;
  author: string | null;
  publishedAt: Date | null;
  section: string;
  language: string;
  summary: string | null;
  blocks: Block[];
}

function ReportPdf({
  title,
  code,
  type,
  author,
  publishedAt,
  section,
  language,
  summary,
  blocks,
}: ReportPdfProps) {
  const dateStr = publishedAt
    ? new Date(publishedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const metaItems: string[] = [
    author ? `Author: ${author}` : "",
    dateStr,
    section.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    language.toUpperCase(),
  ].filter(Boolean);

  const contentNodes = blocks.map((block, i) => {
    if (block.kind === "h1") {
      return React.createElement(
        View,
        { key: i, style: styles.sectionHeading },
        React.createElement(Text, { style: styles.sectionHeadingText }, block.text)
      );
    }
    if (block.kind === "h2") {
      return React.createElement(
        View,
        { key: i, style: styles.subHeading },
        React.createElement(Text, { style: styles.subHeadingText }, block.text)
      );
    }
    if (block.kind === "h3") {
      return React.createElement(
        View,
        { key: i, style: styles.subHeading },
        React.createElement(
          Text,
          { style: { ...styles.subHeadingText, fontSize: 9.5, color: MID_GREY } },
          block.text
        )
      );
    }
    if (block.kind === "hr") {
      return React.createElement(View, { key: i, style: styles.dividerRule });
    }
    // paragraph
    return React.createElement(Text, { key: i, style: styles.body }, block.text);
  });

  return React.createElement(
    Document,
    { title },
    React.createElement(
      Page,
      { size: "A4", style: styles.page },

      // Header (fixed on every page)
      React.createElement(
        View,
        { style: styles.header, fixed: true },
        React.createElement(
          View,
          { style: styles.headerLeft },
          React.createElement(
            Text,
            { style: styles.headerLogo },
            "SRC — SECURITY & RESILIENCE COUNSEL"
          ),
          React.createElement(
            Text,
            { style: styles.headerTagline },
            "src.guide · Global Security & Resilience Analysis"
          )
        ),
        React.createElement(
          View,
          { style: styles.headerRight },
          code
            ? React.createElement(Text, { style: styles.codeBadge }, code)
            : null,
          React.createElement(Text, { style: styles.typeBadge }, type.toUpperCase())
        )
      ),

      // Title
      React.createElement(
        View,
        { style: styles.titleBlock },
        React.createElement(Text, { style: styles.title }, title)
      ),

      // Meta strip
      React.createElement(
        View,
        { style: styles.metaStrip },
        ...metaItems.map((item, i) =>
          React.createElement(Text, { key: i, style: styles.metaItem }, item)
        )
      ),

      // Summary
      summary
        ? React.createElement(Text, { style: styles.summary }, summary)
        : null,

      // Content blocks
      ...contentNodes,

      // Confidential notice
      React.createElement(
        Text,
        { style: styles.confidential },
        "© SRC Advisory · Confidential · Not for redistribution · src.guide"
      ),

      // Footer (fixed on every page)
      React.createElement(
        View,
        { style: styles.footer, fixed: true },
        React.createElement(
          Text,
          { style: styles.footerLeft },
          "SRC Advisory · src.guide"
        ),
        React.createElement(
          Text,
          {
            style: styles.footerRight,
            render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
              `Page ${pageNumber} of ${totalPages}`,
          },
          ""
        )
      )
    )
  );
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 1. Auth: admin bypass OR Professional+ member
  const isAdmin = await isAdminRequest(request);

  if (!isAdmin) {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id ?? null;

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const tier = await getUserTier(userId);
    if ((tier?.sortOrder ?? 0) < 2) {
      return NextResponse.json({ error: "Professional membership required" }, { status: 403 });
    }
  }

  // 2. Fetch report
  let report;
  try {
    report = await prisma.report.findUnique({ where: { id } });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  if (!report || report.status !== "published") {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  // 3. Parse content into structured blocks (preserves headings)
  const blocks = report.content ? parseMarkdown(report.content) : [];

  // 4. Generate PDF
  let pdfBuffer: Buffer;
  try {
    const element = React.createElement(ReportPdf, {
      title: report.title,
      code: report.code,
      type: report.type,
      author: report.author,
      publishedAt: report.publishedAt,
      section: report.section,
      language: report.language,
      summary: report.summary,
      blocks,
    });

    pdfBuffer = await renderToBuffer(element as Parameters<typeof renderToBuffer>[0]);
  } catch (err) {
    console.error("[pdf] generation failed:", err);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }

  // 5. Return PDF
  const slug = report.code ?? id;
  const filename = `SRC-${slug}.pdf`;

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-cache",
    },
  });
}
