import { NextRequest, NextResponse } from "next/server";
import { prisma, validateAdminKey } from "@/lib/db";
import { createHash } from "crypto";

export async function GET(request: NextRequest) {
  if (!validateAdminKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUrl = process.env.DATABASE_URL || "";
  const dbUrlHash = dbUrl ? createHash("sha256").update(dbUrl).digest("hex").slice(0, 16) : "not-set";

  // Query the database to get the actual connection info
  const dbInfo = await prisma.$queryRaw`
    SELECT current_database() as db_name, version() as db_version
  `;

  const reportCount = await prisma.report.count();

  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV,
    databaseUrlHash: dbUrlHash,
    databaseUrlPrefix: dbUrl.split("?")[0].slice(0, 30),
    dbInfo: (dbInfo as any[])[0],
    reportCount,
    prismaClientVersion: (prisma as any)._clientVersion,
  });
}
