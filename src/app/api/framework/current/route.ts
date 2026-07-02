import { NextResponse } from "next/server";
import { validateIngestionKey } from "@/lib/db";
import { getCurrentFramework } from "@/lib/cqr-framework";

// GET /api/framework/current
// The SRC-CQR briefing endpoint for Paperclip. Returns the current Worldview
// Matrix + tuning config + version. Auth: INGESTION_API_KEY (the scoped key
// Paperclip already holds — read-only, no admin/publish rights). The Matrix is
// internal, so this endpoint is never public.
export async function GET(request: Request) {
  if (!validateIngestionKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const framework = await getCurrentFramework();

  return NextResponse.json(framework, {
    status: 200,
    headers: { "Cache-Control": "private, max-age=300" },
  });
}
