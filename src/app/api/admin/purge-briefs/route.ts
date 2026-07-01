import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin-auth";

// POST /api/admin/purge-briefs
// Deletes ALL Daily Brief rows. Admin-session-only — never exposed publicly.
// Used via the admin panel to clear bad ingestion batches before re-push.
export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const deleted = await prisma.report.deleteMany({
    where: { type: "Daily Brief" },
  });

  return NextResponse.json({
    deleted: deleted.count,
    message: `Deleted ${deleted.count} Daily Brief row(s). Re-push from Paperclip to repopulate.`,
  });
}
