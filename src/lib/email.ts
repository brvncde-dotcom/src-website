// Lightweight email sender backed by the Resend REST API.
// We call the REST endpoint directly (no SDK dependency) so this works on the
// Node runtime with zero extra packages.

const RESEND_API_KEY = process.env.RESEND_API_KEY;
// EMAIL_FROM must be a verified Resend sender. Until src-advisory.ch is verified,
// Resend's sandbox sender (onboarding@resend.dev) works for testing.
const EMAIL_FROM = process.env.EMAIL_FROM || "SRC Advisory <onboarding@resend.dev>";

export type SendResult = { ok: boolean; error?: string };

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
  if (!RESEND_API_KEY) {
    // Not configured — surface clearly in logs but never throw into a request.
    console.warn("[email] RESEND_API_KEY not set; skipping send to", opts.to);
    return { ok: false, error: "email_not_configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[email] Resend send failed:", res.status, detail);
      return { ok: false, error: `resend_${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("[email] Resend request error:", err);
    return { ok: false, error: "request_failed" };
  }
}

// ── Password reset email (localized) ──

type Lang = "en" | "de" | "fr" | "it";

const RESET_COPY: Record<Lang, { subject: string; heading: string; body: string; cta: string; ignore: string; expires: string }> = {
  en: {
    subject: "Reset your SRC Advisory password",
    heading: "Reset your password",
    body: "We received a request to reset the password for your SRC Advisory account. Click the button below to choose a new password.",
    cta: "Reset password",
    ignore: "If you didn't request this, you can safely ignore this email — your password will not change.",
    expires: "This link expires in 60 minutes.",
  },
  de: {
    subject: "Setzen Sie Ihr SRC Advisory Passwort zurück",
    heading: "Passwort zurücksetzen",
    body: "Wir haben eine Anfrage zum Zurücksetzen des Passworts für Ihr SRC Advisory Konto erhalten. Klicken Sie auf die Schaltfläche unten, um ein neues Passwort zu wählen.",
    cta: "Passwort zurücksetzen",
    ignore: "Wenn Sie dies nicht angefordert haben, können Sie diese E-Mail ignorieren — Ihr Passwort wird nicht geändert.",
    expires: "Dieser Link läuft in 60 Minuten ab.",
  },
  fr: {
    subject: "Réinitialisez votre mot de passe SRC Advisory",
    heading: "Réinitialiser votre mot de passe",
    body: "Nous avons reçu une demande de réinitialisation du mot de passe de votre compte SRC Advisory. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.",
    cta: "Réinitialiser le mot de passe",
    ignore: "Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail — votre mot de passe ne sera pas modifié.",
    expires: "Ce lien expire dans 60 minutes.",
  },
  it: {
    subject: "Reimposta la tua password SRC Advisory",
    heading: "Reimposta la password",
    body: "Abbiamo ricevuto una richiesta di reimpostazione della password per il tuo account SRC Advisory. Fai clic sul pulsante qui sotto per scegliere una nuova password.",
    cta: "Reimposta password",
    ignore: "Se non hai effettuato questa richiesta, puoi ignorare questa e-mail — la tua password non verrà modificata.",
    expires: "Questo link scade tra 60 minuti.",
  },
};

export function buildPasswordResetEmail(resetUrl: string, lang: string = "en") {
  const c = RESET_COPY[(lang as Lang) in RESET_COPY ? (lang as Lang) : "en"];
  const html = `<!doctype html>
<html>
  <body style="margin:0;background:#f4f5f7;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
          <tr><td style="background:#0A2540;padding:20px 28px;">
            <span style="color:#ffffff;font-weight:700;font-size:16px;letter-spacing:0.04em;">SRC ADVISORY</span>
          </td></tr>
          <tr><td style="padding:28px;">
            <h1 style="margin:0 0 12px;font-size:20px;color:#0A2540;">${c.heading}</h1>
            <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#374151;">${c.body}</p>
            <a href="${resetUrl}" style="display:inline-block;background:#0A2540;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:11px 22px;border-radius:6px;">${c.cta}</a>
            <p style="margin:20px 0 0;font-size:12px;color:#6b7280;">${c.expires}</p>
            <p style="margin:14px 0 0;font-size:12px;color:#6b7280;">${c.ignore}</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
  return { subject: c.subject, html };
}
