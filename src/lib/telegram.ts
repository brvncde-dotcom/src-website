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
  const reply_markup: InlineKeyboard = {
    inline_keyboard: [
      [
        { text: "✅ Approve", callback_data: `rv:approved:${r.id}` },
        { text: "📤 Publish", callback_data: `rv:published:${r.id}` },
      ],
      [
        { text: "❌ Reject", callback_data: `rv:rejected:${r.id}` },
        { text: "👁 Review queue", url: `${SITE}/admin/reports` },
      ],
    ],
  };
  return { text, reply_markup };
}

// Perform a review action by reusing the existing PATCH endpoint server-side
// (keeps the publish gate, sibling-publishing, and audit log in one place).
export async function performReportAction(
  id: string,
  action: "approved" | "published" | "rejected"
): Promise<{ ok: boolean; message: string }> {
  const key = process.env.ADMIN_API_KEY || "";
  try {
    const res = await fetch(`${SITE}/api/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ action }),
    });
    const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
    return { ok: res.ok, message: data.message || data.error || (res.ok ? "Done." : `HTTP ${res.status}`) };
  } catch {
    return { ok: false, message: "Request failed." };
  }
}
