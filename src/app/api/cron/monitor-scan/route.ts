import { NextRequest, NextResponse } from "next/server";
import { runMonitorScanAll } from "@/lib/monitor-scan";

// GET /api/cron/monitor-scan — scheduled daily backfill (Vercel cron)
// Protected by CRON_SECRET (Vercel injects Authorization: Bearer <secret>)
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const result = await runMonitorScanAll();
  return NextResponse.json({
    ...result,
    message: `Cron: scanned ${result.scanned} report(s), ${result.matched} match(es).`,
  });
}
