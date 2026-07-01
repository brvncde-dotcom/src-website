import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyUnsubscribeToken } from "@/lib/brief-email";

export const dynamic = "force-dynamic";

// GET /api/unsubscribe-brief?uid=<userId>&token=<hmac>
// No authentication required — the HMAC token proves intent.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const uid = url.searchParams.get("uid")?.trim();
  const token = url.searchParams.get("token")?.trim();

  if (!uid || !token) {
    return new NextResponse(unsubPage("Invalid link — missing parameters.", false), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  if (!verifyUnsubscribeToken(uid, token)) {
    return new NextResponse(unsubPage("Invalid or expired unsubscribe link.", false), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  try {
    await prisma.user.update({
      where: { id: uid },
      data: { briefEmailOptOut: true },
    });
  } catch {
    return new NextResponse(unsubPage("Something went wrong. Please try again.", false), {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
  }

  return new NextResponse(unsubPage("You have been unsubscribed from the SRC Daily Brief.", true), {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}

function unsubPage(message: string, success: boolean): string {
  const color = success ? "#0E4D30" : "#E8272C";
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>SRC Daily Brief — Unsubscribe</title>
<style>body{margin:0;font-family:Georgia,serif;background:#F2F7F4;display:flex;align-items:center;justify-content:center;min-height:100vh;}
.box{max-width:440px;background:#fff;border-top:4px solid ${color};padding:40px 48px;text-align:center;}
h1{margin:0 0 16px;font-size:20px;color:#071F10;}p{margin:0 0 24px;font-size:14px;color:#555;line-height:1.6;}
a{color:#0A2540;font-size:13px;}</style></head>
<body><div class="box">
<h1>${success ? "Unsubscribed" : "Error"}</h1>
<p>${message}</p>
<a href="https://www.src-advisory.ch/">← Return to SRC Advisory</a>
</div></body></html>`;
}
