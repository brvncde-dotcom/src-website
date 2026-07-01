// Telegram Bot integration (Phase 1: approvals, info, notifications).
//
// SRC runs its OWN dedicated bot (separate from Paperclip's Telegram plugin):
// one bot token = one update consumer, and approval actions are prod-admin,
// which stays on src-website (Paperclip is content-only). All actions are
// gated by a numeric user-ID allowlist + a webhook secret token.
//
// Safe no-op until configured: if TELEGRAM_BOT_TOKEN is unset, sends are
// skipped and the webhook accepts-and-ignores, so this can ship before the
// bot exists.

import { prisma, validateDesignGate, logAdminAction, VALID_SECTIONS } from "@/lib/db";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

export const ALLOWED_IDS: string[] = (process.env.TELEGRAM_ALLOWED_IDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export function telegramEnabled(): boolean {
  return !!TOKEN;
}

export function isAllowed(userId: number | string | undefined | null): boolean {
  return userId != null && ALLOWED_IDS.includes(String(userId));
}

// Telegram delivers the configured secret in this header on every webhook call.
export function verifyWebhookSecret(req: Request): boolean {
  if (!WEBHOOK_SECRET) return false; // fail closed: require the secret in all envs
  return req.headers.get("x-telegram-bot-api-secret-token") === WEBHOOK_SECRET;
}

async function tg(method: string, params: Record<string, unknown>): Promise<{ ok: boolean; result?: unknown; description?: string }> {
  if (!TOKEN) return { ok: false, description: "telegram_not_configured" };
  try {
    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    return (await res.json()) as { ok: boolean };
  } catch (e) {
    console.error("[telegram] request failed:", method, e);
    return { ok: false, description: "request_failed" };
  }
}

type InlineKeyboard = { inline_keyboard: Array<Array<Record<string, string>>> };

export async function tgSend(chatId: string | number, text: string, replyMarkup?: InlineKeyboard) {
  return tg("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
  });
}

export async function tgEdit(chatId: string | number, messageId: number, text: string) {
  return tg("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });
}

export async function tgAnswerCallback(callbackQueryId: string, text?: string) {
  return tg("answerCallbackQuery", { callback_query_id: callbackQueryId, ...(text ? { text } : {}) });
}

// Broadcast a message to every allow-listed chat (the Board head + admins).
export async function tgBroadcast(text: string, replyMarkup?: InlineKeyboard) {
  if (!telegramEnabled() || ALLOWED_IDS.length === 0) return;
  await Promise.all(ALLOWED_IDS.map((id) => tgSend(id, text, replyMarkup)));
}

const esc = (s: string) =>
  String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const SITE = process.env.NEXTAUTH_URL || "https://www.src-advisory.ch";

export type ReportCardData = {
  id: string;
  title: string;
  summary?: string | null;
  section?: string | null;
  type?: string | null;
  language?: string | null;
  sourceRef?: string | null;
};

// An inline approval card for a pending report.
export function reportCard(r: ReportCardData): { text: string; reply_markup: InlineKeyboard } {
  const text =
    `<b>📥 Pending report</b>\n` +
    `<b>${esc(r.title)}</b>\n` +
    `${esc(r.section || "")} · ${esc(r.type || "")} · ${esc((r.language || "").toUpperCase())}` +
    (r.sourceRef ? ` · ${esc(r.sourceRef)}` : "") +
    (r.summary ? `\n\n${esc(r.summary).slice(0, 500)}` : "");
  // Approve = design + editorial approval. Publish sends it live.
  // Reject/Delete need a written reason or are destructive → admin panel only.
  const reply_markup: InlineKeyboard = {
    inline_keyboard: [
      [
        { text: "✅ Approve", callback_data: `rv:approved:${r.id}` },
        { text: "📤 Publish", callback_data: `rv:published:${r.id}` },
      ],
      [{ text: "🗂 Reject / manage in panel", url: `${SITE}/admin/reports` }],
    ],
  };
  return { text, reply_markup };
}

// Perform a review action in-process (no HTTP self-call). Mirrors the PATCH
// endpoint's logic: publishing enforces the Gate-3 design check and publishes
// sibling translations together; approve/reject is a simple status flip.
export async function performReportAction(
  id: string,
  action: "approved" | "published" | "rejected"
): Promise<{ ok: boolean; message: string }> {
  try {
    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) return { ok: false, message: "Report not found." };

    const now = new Date();

    // Rejections need a written reason (re-approval loop). Telegram can't
    // collect one inline, so reject from the admin panel instead.
    if (action === "rejected") {
      return { ok: false, message: "Reject with a reason from the admin panel." };
    }

    if (action === "published") {
      const gate = validateDesignGate(report);
      if (!gate.valid) return { ok: false, message: `Cannot publish: ${gate.reason}` };

      await prisma.report.update({
        where: { id },
        data: { status: "published", publishedAt: now, reviewedBy: "telegram", reviewedAt: now },
      });
      let siblings = 0;
      if (report.sourceRef) {
        const r = await prisma.report.updateMany({
          where: { sourceRef: report.sourceRef, id: { not: id } },
          data: { status: "published", publishedAt: now, reviewedBy: "telegram", reviewedAt: now },
        });
        siblings = r.count;
      }
      await logAdminAction({ actor: "telegram", action: "report_published", targetType: "report", targetId: id, detail: `via Telegram (${siblings} siblings)` });
      return { ok: true, message: siblings ? `Published (+${siblings} translations).` : "Published." };
    }

    await prisma.report.update({
      where: { id },
      data: { status: action, reviewedBy: "telegram", reviewedAt: now },
    });
    await logAdminAction({ actor: "telegram", action: `report_${action}`, targetType: "report", targetId: id });
    return { ok: true, message: action === "approved" ? "Approved." : "Rejected." };
  } catch (e) {
    console.error("[telegram] performReportAction failed:", e);
    return { ok: false, message: "Action failed." };
  }
}

// ── Phase 2: forward-to-ingest ──

// Short button labels for the 6 focus areas (full names are too long for buttons).
const SECTION_SHORT: Record<string, string> = {
  "digital-power-ai": "Digital/AI",
  "geopolitics-hard-security": "Geopolitics",
  "energy-resources": "Energy",
  "climate-environment-food": "Climate/Food",
  "economy-competitiveness": "Economy",
  "society-migration-institutions": "Society",
};

function sectionPicker(id: string): InlineKeyboard {
  const secs = [...VALID_SECTIONS];
  const rows: Array<Array<Record<string, string>>> = [];
  for (let i = 0; i < secs.length; i += 2) {
    rows.push(
      secs.slice(i, i + 2).map((s) => ({ text: SECTION_SHORT[s] || s, callback_data: `isec:${s}:${id}` }))
    );
  }
  rows.push([{ text: "🗑 Discard", callback_data: `idel:${id}` }]);
  return { inline_keyboard: rows };
}

// Create a pending "intake" report from forwarded/link content. Returns a
// confirmation message + a section-picker keyboard.
export async function createIntake(input: {
  text: string;
  url?: string | null;
  source?: string | null;
  messageId: number;
}): Promise<{ text: string; reply_markup: InlineKeyboard }> {
  const firstLine = (input.text.split("\n").find((l) => l.trim()) || "").trim();
  const titleBase = (firstLine || input.url || "Telegram intake").slice(0, 90);
  const title = `Intake: ${titleBase}`;
  const content =
    (input.text || "") +
    (input.url ? `\n\nSource: ${input.url}` : "") +
    (input.source ? `\nForwarded from: ${input.source}` : "");

  const report = await prisma.report.create({
    data: {
      title,
      summary: (input.text || input.url || "").slice(0, 240) || null,
      content: content.trim() || null,
      type: "Brief",
      section: "geopolitics-hard-security", // default; recategorize via buttons
      status: "pending",
      sourceRef: `TG-INTAKE-${input.messageId}`,
      language: "en",
      author: "SRC Intake (Telegram)",
    },
    select: { id: true },
  });
  await logAdminAction({ actor: "telegram", action: "intake_created", targetType: "report", targetId: report.id });

  return {
    text:
      `📥 <b>Added to the intake queue</b>\n${esc(title)}\n\n` +
      `It's in the review queue as a draft. Pick a focus area (or discard):`,
    reply_markup: sectionPicker(report.id),
  };
}

export async function setIntakeSection(id: string, section: string): Promise<boolean> {
  if (!VALID_SECTIONS.includes(section as (typeof VALID_SECTIONS)[number])) return false;
  try {
    await prisma.report.update({ where: { id }, data: { section } });
    return true;
  } catch {
    return false;
  }
}

export async function discardIntake(id: string): Promise<boolean> {
  try {
    await prisma.report.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
