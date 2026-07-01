import crypto from "crypto";

const UNSUBSCRIBE_SECRET = process.env.NEXTAUTH_SECRET ?? "fallback-dev-secret";

export function makeUnsubscribeToken(userId: string): string {
  return crypto
    .createHmac("sha256", UNSUBSCRIBE_SECRET)
    .update(`brief-unsub:${userId}`)
    .digest("hex");
}

export function verifyUnsubscribeToken(userId: string, token: string): boolean {
  const expected = makeUnsubscribeToken(userId);
  try {
    return crypto.timingSafeEqual(Buffer.from(token, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export function briefEmailHtml({
  title,
  publishedAt,
  summary,
  content,
  accessLevel,
  userId,
  lang,
  siteUrl,
}: {
  title: string;
  publishedAt: Date;
  summary: string | null;
  content: string | null;
  accessLevel: "full" | "preview";
  userId: string;
  lang: string;
  siteUrl: string;
}): string {
  const token = makeUnsubscribeToken(userId);
  const unsubUrl = `${siteUrl}/api/unsubscribe-brief?uid=${userId}&token=${token}`;
  const briefUrl = `${siteUrl}/#brief`;

  const dateStr = publishedAt.toLocaleDateString(
    lang === "de" ? "de-CH" : lang === "fr" ? "fr-CH" : lang === "it" ? "it-CH" : "en-GB",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  );

  const editionLabel =
    lang === "de" ? "Tagesbericht" : lang === "fr" ? "Bulletin quotidien" : lang === "it" ? "Briefing quotidiano" : "Daily Brief";
  const fullLabel = lang === "de" ? "Vollständige Analyse" : lang === "fr" ? "Analyse complète" : lang === "it" ? "Analisi completa" : "Full Analysis";
  const headlineLabel = lang === "de" ? "Schlagzeilen" : lang === "fr" ? "Titres" : lang === "it" ? "Titoli" : "Headlines";
  const readLabel = lang === "de" ? "Vollständigen Brief lesen" : lang === "fr" ? "Lire le bulletin complet" : lang === "it" ? "Leggi il briefing completo" : "Read Full Brief";
  const upgradeLabel = lang === "de" ? "Auf Essential upgraden" : lang === "fr" ? "Passer à Essential" : lang === "it" ? "Passa a Essential" : "Upgrade to Essential";
  const upgradeDesc = lang === "de" ? "Erhalte den vollständigen Tagesbericht mit 5–7 Geheimdienstbereichen — ab CHF 29/Monat." : lang === "fr" ? "Recevez le bulletin quotidien complet avec 5 à 7 sections de renseignement — dès CHF 29/mois." : lang === "it" ? "Ricevi il briefing quotidiano completo con 5–7 sezioni di intelligence — da CHF 29/mese." : "Get the full daily brief with 5–7 intelligence sections — from CHF 29/month.";
  const unsubLabel = lang === "de" ? "Abmelden" : lang === "fr" ? "Se désabonner" : lang === "it" ? "Annulla iscrizione" : "Unsubscribe";
  const footerText = lang === "de" ? "SRC — Security & Resilience Counsel · Zug, Schweiz" : lang === "fr" ? "SRC — Security & Resilience Counsel · Zoug, Suisse" : lang === "it" ? "SRC — Security & Resilience Counsel · Zugo, Svizzera" : "SRC — Security & Resilience Counsel · Zug, Switzerland";

  // Parse summary into bullet lines for the headlines view
  const summaryLines = (summary ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const summaryHtml = summaryLines.length
    ? summaryLines
        .map(
          (line) =>
            `<tr><td style="padding:4px 0 4px 12px;border-left:3px solid #2ECC7A;font-size:14px;color:#071F10;line-height:1.5;">${escHtml(line)}</td></tr>`
        )
        .join("")
    : `<tr><td style="padding:4px 0;font-size:14px;color:#071F10;">${escHtml(summary ?? "")}</td></tr>`;

  const contentSection =
    accessLevel === "full" && content
      ? `
      <tr><td style="padding:20px 0 8px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#0E4D30;">${fullLabel}</p>
      </td></tr>
      <tr><td style="padding:0;font-size:14px;color:#1C2B3A;line-height:1.7;white-space:pre-wrap;">${escHtml(content)}</td></tr>
      `
      : `
      <tr><td style="padding:24px 0 0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F2F7F4;border:1px solid #B8DECA;border-radius:4px;">
          <tr><td style="padding:20px 24px;">
            <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#0E4D30;">${upgradeLabel}</p>
            <p style="margin:0 0 14px;font-size:13px;color:#1A4D2E;line-height:1.5;">${upgradeDesc}</p>
            <a href="${siteUrl}/?tab=membership" style="display:inline-block;background:#0E4D30;color:#ffffff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;text-decoration:none;padding:10px 20px;border-radius:3px;">${upgradeLabel} →</a>
          </td></tr>
        </table>
      </td></tr>
      `;

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#F2F7F4;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F2F7F4;">
<tr><td align="center" style="padding:32px 16px;">

  <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

    <!-- Top stripe -->
    <tr><td height="4" style="background:#2ECC7A;font-size:0;">&nbsp;</td></tr>

    <!-- Masthead -->
    <tr><td style="background:#071F10;padding:28px 32px 24px;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#2ECC7A;font-family:monospace;">${escHtml(editionLabel)}</p>
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;font-family:Georgia,serif;">${escHtml(title)}</h1>
      <p style="margin:0;font-size:12px;color:#5A8A6A;font-family:monospace;">${escHtml(dateStr)}</p>
    </td></tr>

    <!-- Access badge -->
    <tr><td style="background:#0E4D30;padding:8px 32px;">
      <span style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${accessLevel === "full" ? "#2ECC7A" : "#7AC4A0"};">
        ${accessLevel === "full" ? fullLabel : headlineLabel}
      </span>
    </td></tr>

    <!-- Body -->
    <tr><td style="background:#ffffff;padding:28px 32px 8px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="padding:0 0 16px;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#0E4D30;">${headlineLabel}</p>
        </td></tr>
        ${summaryHtml}
        ${contentSection}
        <tr><td style="padding:24px 0 0;text-align:center;">
          <a href="${briefUrl}" style="display:inline-block;background:#0A2540;color:#ffffff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;text-decoration:none;padding:12px 28px;border-radius:3px;">${readLabel} →</a>
        </td></tr>
      </table>
    </td></tr>

    <!-- Footer -->
    <tr><td style="background:#071F10;padding:20px 32px;border-top:3px solid #0E4D30;">
      <p style="margin:0 0 6px;font-size:11px;color:#5A8A6A;font-family:monospace;">${escHtml(footerText)}</p>
      <p style="margin:0;font-size:11px;color:#3D6B4D;">
        <a href="${unsubUrl}" style="color:#5A8A6A;text-decoration:underline;">${unsubLabel}</a>
      </p>
    </td></tr>

  </table>

</td></tr>
</table>
</body>
</html>`;
}

export function briefEmailText({
  title,
  publishedAt,
  summary,
  content,
  accessLevel,
  lang,
  siteUrl,
  userId,
}: {
  title: string;
  publishedAt: Date;
  summary: string | null;
  content: string | null;
  accessLevel: "full" | "preview";
  lang: string;
  siteUrl: string;
  userId: string;
}): string {
  const token = makeUnsubscribeToken(userId);
  const unsubUrl = `${siteUrl}/api/unsubscribe-brief?uid=${userId}&token=${token}`;
  const dateStr = publishedAt.toLocaleDateString("en-GB", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const lines = [
    `SRC Daily Brief — ${dateStr}`,
    `${title}`,
    "",
    summary ?? "",
    "",
  ];
  if (accessLevel === "full" && content) {
    lines.push("--- Full Analysis ---", "", content, "");
  } else {
    lines.push("Upgrade to Essential for the full brief: " + siteUrl + "/?tab=membership", "");
  }
  lines.push(`Read online: ${siteUrl}/#brief`);
  lines.push(`Unsubscribe: ${unsubUrl}`);
  return lines.join("\n");
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
