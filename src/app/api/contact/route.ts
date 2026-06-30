import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

// Where contact-form inquiries are delivered. Override with CONTACT_EMAIL
// (comma-separated for multiple recipients).
const RECIPIENTS = (process.env.CONTACT_EMAIL || "andreawoe@gmail.com,brvncde@gmail.com")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// POST /api/contact — public contact form submission → email to the team.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const email = String(body.email || "").trim();
    const organisation = String(body.organisation || "").trim();
    const message = String(body.message || "").trim();
    const type = String(body.type || "General Inquiry").trim();

    // Minimal validation
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }
    if (message.length < 5) {
      return NextResponse.json({ error: "Please include a message." }, { status: 400 });
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: "Message is too long." }, { status: 400 });
    }

    const name = [firstName, lastName].filter(Boolean).join(" ") || "(no name)";
    const html = `
      <h2>New contact inquiry</h2>
      <p><strong>Type:</strong> ${esc(type)}</p>
      <p><strong>Name:</strong> ${esc(name)}</p>
      <p><strong>Email:</strong> ${esc(email)}</p>
      <p><strong>Organisation:</strong> ${esc(organisation) || "—"}</p>
      <p><strong>Message:</strong></p>
      <p style="white-space:pre-wrap">${esc(message)}</p>
    `;

    const result = await sendEmail({
      to: RECIPIENTS,
      subject: `[Contact] ${type} — ${name}`,
      html,
      replyTo: email,
    });

    if (!result.ok) {
      return NextResponse.json({ error: "Could not send your message. Please try again." }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error in /api/contact:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
