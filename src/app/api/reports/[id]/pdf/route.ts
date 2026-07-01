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
  Font,
} from "@react-pdf/renderer";

// ── Brand colours ────────────────────────────────────────────────────────────
const NAVY = "#0A2540";
const RED = "#E8272C";
const LIGHT_GREY = "#F0F3F7";
const MID_GREY = "#6B7280";
const DIVIDER = "#D8DEE6";

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    paddingTop: 56,
    paddingBottom: 64,
    paddingHorizontal: 64,
    fontFamily: "Times-Roman",
    fontSize: 11,
    color: NAVY,
    lineHeight: 1.55,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: NAVY,
  },
  headerLogo: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.8,
    color: NAVY,
  },
  headerRight: {
    alignItems: "flex-end",
    gap: 4,
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
  },
  // Title section
  titleSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: "Times-Bold",
    color: NAVY,
    lineHeight: 1.3,
    marginBottom: 8,
  },
  // Meta strip
  metaStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 18,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 12,
    backgroundColor: LIGHT_GREY,
  },
  metaItem: {
    fontSize: 9,
    fontFamily: "Helvetica",
    color: MID_GREY,
  },
  metaSep: {
    fontSize: 9,
    color: DIVIDER,
  },
  // Summary
  summary: {
    fontSize: 12,
    fontFamily: "Times-Italic",
    color: NAVY,
    lineHeight: 1.6,
    marginBottom: 18,
  },
  // Divider
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
    marginBottom: 20,
  },
  // Body
  body: {
    fontSize: 11,
    fontFamily: "Times-Roman",
    color: "#1A1A2E",
    lineHeight: 1.65,
  },
  // Confidentiality notice
  confidential: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: DIVIDER,
    fontSize: 8,
    fontFamily: "Helvetica",
    color: RED,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 32,
    left: 64,
    right: 64,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: DIVIDER,
    paddingTop: 8,
  },
  footerLeft: {
    fontSize: 8,
    fontFamily: "Helvetica",
    color: MID_GREY,
  },
  footerRight: {
    fontSize: 8,
    fontFamily: "Helvetica",
    color: MID_GREY,
  },
});

// ── Markdown stripper ────────────────────────────────────────────────────────
function stripMarkdown(md: string): string {
  return md
    // Remove headings
    .replace(/^#{1,6}\s+/gm, "")
    // Remove bold/italic markers (**, *, __, _)
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    // Remove strikethrough
    .replace(/~~(.*?)~~/g, "$1")
    // Remove inline code
    .replace(/`([^`]+)`/g, "$1")
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, "")
    // Remove blockquotes
    .replace(/^>\s+/gm, "")
    // Remove horizontal rules
    .replace(/^(-{3,}|_{3,}|\*{3,})$/gm, "")
    // Remove links, keep text
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    // Remove images
    .replace(/!\[[^\]]*\]\([^\)]+\)/g, "")
    // Remove HTML tags
    .replace(/<[^>]+>/g, "")
    // Collapse multiple blank lines into one
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ── PDF Document component ───────────────────────────────────────────────────
interface ReportPdfProps {
  title: string;
  code: string | null;
  type: string;
  author: string | null;
  publishedAt: Date | null;
  section: string;
  language: string;
  summary: string | null;
  body: string;
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
  body,
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
    section,
    language.toUpperCase(),
  ].filter(Boolean);

  return React.createElement(
    Document,
    { title },
    React.createElement(
      Page,
      { size: "A4", style: styles.page },

      // ── Header ────────────────────────────────────────────────────────
      React.createElement(
        View,
        { style: styles.header, fixed: true },
        React.createElement(
          Text,
          { style: styles.headerLogo },
          "SRC — SECURITY & RESILIENCE COUNSEL"
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

      // ── Title ─────────────────────────────────────────────────────────
      React.createElement(
        View,
        { style: styles.titleSection },
        React.createElement(Text, { style: styles.title }, title)
      ),

      // ── Meta strip ────────────────────────────────────────────────────
      React.createElement(
        View,
        { style: styles.metaStrip },
        ...metaItems.flatMap((item, i) => {
          const nodes = [
            React.createElement(Text, { key: `m${i}`, style: styles.metaItem }, item),
          ];
          if (i < metaItems.length - 1) {
            nodes.push(
              React.createElement(Text, { key: `sep${i}`, style: styles.metaSep }, " · ")
            );
          }
          return nodes;
        })
      ),

      // ── Summary ───────────────────────────────────────────────────────
      summary
        ? React.createElement(Text, { style: styles.summary }, summary)
        : null,

      // ── Divider ───────────────────────────────────────────────────────
      React.createElement(View, { style: styles.divider }),

      // ── Body ──────────────────────────────────────────────────────────
      React.createElement(Text, { style: styles.body }, body),

      // ── Confidential notice ───────────────────────────────────────────
      React.createElement(
        Text,
        { style: styles.confidential },
        "© SRC Advisory · Confidential · Not for redistribution"
      ),

      // ── Footer (fixed, page number) ───────────────────────────────────
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

// ── Route handler ────────────────────────────────────────────────────────────
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 1. Auth check: admin bypass OR authenticated user with Professional+ tier
  const isAdmin = await isAdminRequest(request);

  if (!isAdmin) {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id ?? null;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const tier = await getUserTier(userId);
    const sortOrder = tier?.sortOrder ?? 0;

    // Professional = sortOrder 2; anything below gets 403
    if (sortOrder < 2) {
      return NextResponse.json(
        { error: "Professional membership required" },
        { status: 403 }
      );
    }
  }

  // 2. Fetch report from DB
  let report;
  try {
    report = await prisma.report.findUnique({ where: { id } });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  if (!report || report.status !== "published") {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  // 3. Strip markdown from content
  const body = report.content ? stripMarkdown(report.content) : "(No content available)";

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
      body,
    });

    pdfBuffer = await renderToBuffer(element as Parameters<typeof renderToBuffer>[0]);
  } catch (err) {
    console.error("[pdf] generation failed:", err);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }

  // 5. Return PDF
  const slug = report.code ?? id;
  const filename = `SRC-${slug}-${id}.pdf`;

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-cache",
    },
  });
}
