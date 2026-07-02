import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { runMonitorScanAll } from "@/lib/monitor-scan";

// POST /api/admin/run-monitor-scan — backfill: scan all published reports against all active monitors
export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await runMonitorScanAll();
  return NextResponse.json({
    ...result,
    message: `Scanned ${result.scanned} report(s), created/confirmed ${result.matched} match(es).`,
  });
}
