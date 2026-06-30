import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  telegramEnabled,
  verifyWebhookSecret,
  isAllowed,
  tgSend,
  tgEdit,
  tgAnswerCallback,
  reportCard,
  performReportAction,
  createIntake,
  setIntakeSection,
  discardIntake,
} from "@/lib/telegram";
import { SECTION_LABELS } from "@/lib/db";

export const dynamic = "force-dynamic";

// Telegram always expects a 200 quickly, even when we ignore an update —
// otherwise it retries. We only ACT on allow-listed users.
const OK = NextResponse.json({ ok: true });

export async function POST(request: NextRequest) {
  // No bot configured yet → accept and ignore.
  if (!telegramEnabled()) return OK;

  // Reject forged calls: Telegram echoes our secret token in this header.
  if (!verifyWebhookSecret(request)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return OK;
  }

  try {
    if (update.callback_query) {
      await handleCallback(update.callback_query);
    } else if (update.message) {
      await handleMessage(update.message);
    }
  } catch (e) {
    console.error("[telegram] handler error:", e);
  }
  return OK;
}

async function handleCallback(cq: NonNullable<TelegramUpdate["callback_query"]>) {
  const fromId = cq.from?.id;
  if (!isAllowed(fromId)) {
    await tgAnswerCallback(cq.id, "Not authorized.");
    return;
  }

  const parts = (cq.data || "").split(":");
  const kind = parts[0];
  const chatId = cq.message?.chat?.id;
  const messageId = cq.message?.message_id;

  // Phase 2: categorize an intake into a focus area.
  if (kind === "isec" && parts.length >= 3) {
    const section = parts[1];
    const id = parts.slice(2).join(":");
    const ok = await setIntakeSection(id, section);
    await tgAnswerCallback(cq.id, ok ? "Filed." : "Failed.");
    if (ok && chatId && messageId) {
      await tgEdit(chatId, messageId, `📥 <b>Intake filed</b> — ${SECTION_LABELS[section] || section}\nIt's in the review queue for development.`);
    }
    return;
  }

  // Phase 2: discard an intake.
  if (kind === "idel" && parts.length >= 2) {
    const id = parts.slice(1).join(":");
    const ok = await discardIntake(id);
    await tgAnswerCallback(cq.id, ok ? "Discarded." : "Failed.");
    if (ok && chatId && messageId) await tgEdit(chatId, messageId, "🗑 Intake discarded.");
    return;
  }

  if (kind !== "rv" || parts.length < 3) {
    await tgAnswerCallback(cq.id);
    return;
  }
  const action = parts[1] as "approved" | "published" | "rejected";
  const id = parts.slice(2).join(":");

  const report = await prisma.report.findUnique({ where: { id }, select: { title: true } });
  const result = await performReportAction(id, action);
  await tgAnswerCallback(cq.id, result.message.slice(0, 200));

  if (result.ok && chatId && messageId) {
    const verb = action === "approved" ? "✅ Approved" : action === "published" ? "📤 Published" : "❌ Rejected";
    const who = [cq.from?.first_name, cq.from?.last_name].filter(Boolean).join(" ") || "you";
    const time = new Date().toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" });
    await tgEdit(
      chatId,
      messageId,
      `${verb}\n<b>${(report?.title || id).replace(/[<>&]/g, "")}</b>\n— ${who} · ${time}`
    );
  }
}

async function handleMessage(msg: NonNullable<TelegramUpdate["message"]>) {
  const chatId = msg.chat?.id;
  const fromId = msg.from?.id;
  if (chatId == null) return;

  if (!isAllowed(fromId)) {
    // Help an admin add them: surface their numeric id.
    await tgSend(chatId, `Not authorized. Your Telegram ID is <code>${fromId}</code> — ask an SRC admin to add it to the allowlist.`);
    return;
  }

  const text = (msg.text || msg.caption || "").trim();

  // Non-command message → a forward or a link becomes an intake draft.
  if (!text.startsWith("/")) {
    const isForward = !!(msg.forward_origin || msg.forward_from || msg.forward_from_chat || msg.forward_date);
    const url = (text.match(/https?:\/\/\S+/) || [])[0] || null;
    if (isForward || url) {
      const card = await createIntake({ text, url, source: forwardSource(msg), messageId: msg.message_id });
      await tgSend(chatId, card.text, card.reply_markup);
    } else {
      await tgSend(chatId, "Forward a post or paste a link to add it to the intake queue. Commands: /pending, /stats.");
    }
    return;
  }

  const cmd = text.split(/\s+/)[0].replace(/@.*$/, "").toLowerCase();

  if (cmd === "/start" || cmd === "/help") {
    await tgSend(
      chatId,
      "<b>SRC Editorial</b> — you're authorized.\n\n" +
        "/pending — reports awaiting review\n" +
        "/stats — site overview\n\n" +
        "Forward a post or paste a link and I'll add it to the intake queue.\n" +
        "You'll also get a card here whenever a new report is ingested, with Approve / Publish / Reject buttons."
    );
    return;
  }

  if (cmd === "/pending") {
    const reports = await prisma.report.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, title: true, summary: true, section: true, type: true, language: true, sourceRef: true },
    });
    if (reports.length === 0) {
      await tgSend(chatId, "✅ No reports pending review.");
      return;
    }
    await tgSend(chatId, `<b>${reports.length} report(s) pending review:</b>`);
    for (const r of reports) {
      const card = reportCard(r);
      await tgSend(chatId, card.text, card.reply_markup);
    }
    return;
  }

  if (cmd === "/stats") {
    const [published, pending, members, activeSubs] = await Promise.all([
      prisma.report.count({ where: { status: "published" } }),
      prisma.report.count({ where: { status: "pending" } }),
      prisma.user.count(),
      prisma.subscription.count({ where: { status: "active" } }),
    ]);
    await tgSend(
      chatId,
      `<b>SRC overview</b>\n` +
        `📄 Published: <b>${published}</b>\n` +
        `🕒 Pending: <b>${pending}</b>\n` +
        `👤 Members: <b>${members}</b>\n` +
        `💳 Active subscriptions: <b>${activeSubs}</b>`
    );
    return;
  }

  await tgSend(chatId, "Unknown command. Try /pending or /stats — or forward a post / paste a link to add it to the intake queue.");
}

// Best-effort human-readable source of a forwarded message.
function forwardSource(msg: NonNullable<TelegramUpdate["message"]>): string | null {
  const o = msg.forward_origin;
  if (o) {
    if (o.chat) return o.chat.title || o.chat.username || "channel";
    if (o.sender_user_name) return o.sender_user_name;
    if (o.sender_user) return [o.sender_user.first_name, o.sender_user.last_name].filter(Boolean).join(" ") || null;
  }
  if (msg.forward_from) return [msg.forward_from.first_name, msg.forward_from.last_name].filter(Boolean).join(" ") || null;
  if (msg.forward_from_chat) return msg.forward_from_chat.title || null;
  return null;
}

// ── Minimal Telegram update typings (only what we use) ──
type TelegramUser = { id: number; first_name?: string; last_name?: string };
type TelegramChat = { id: number };
interface TelegramUpdate {
  message?: {
    message_id: number;
    chat?: TelegramChat;
    from?: TelegramUser;
    text?: string;
    caption?: string;
    forward_date?: number;
    forward_origin?: {
      type?: string;
      chat?: { title?: string; username?: string };
      sender_user?: TelegramUser;
      sender_user_name?: string;
    };
    forward_from?: TelegramUser;
    forward_from_chat?: { title?: string };
  };
  callback_query?: {
    id: string;
    from?: TelegramUser;
    data?: string;
    message?: { message_id: number; chat?: TelegramChat };
  };
}
