import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Temporary admin endpoint to purge internal records (SRC-516)
// DELETE after use
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const expectedKey = process.env.ADMIN_API_KEY;
  if (!expectedKey) {
    return NextResponse.json({ error: "Admin key not configured" }, { status: 500 });
  }
  const token = authHeader.replace("Bearer ", "");
  if (token !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // List all reports (published and non-published) with minimal fields
    const reports = await prisma.$queryRawUnsafe<
      { id: string; title: string; status: string; sourceRef: string | null; author: string | null }[]
    >(`SELECT id, title, status, "sourceRef", author FROM "Report" ORDER BY title`);

    // Identify internal-marker titles
    const internalPatterns = [
      /SRC-505/i,
      /SRC-239/i,
      /SRC-235/i,
      /SRC-238/i,
      /SRC-221/i,
      /SRC-201/i,
      /SRC-157/i,
      /SRC-240/i,
      /SRC-5\b/i,
      /SRC-3\b/i,
      /SRC-4\b/i,
      /SRC-184/i,
      /SRC-183/i,
    ];

    const toReview = reports.filter((r) =>
      internalPatterns.some((p) => p.test(r.title))
    );

    return NextResponse.json({
      total: reports.length,
      internalCandidates: toReview.map((r) => ({
        id: r.id,
        title: r.title,
        status: r.status,
        sourceRef: r.sourceRef,
        author: r.author,
      })),
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const expectedKey = process.env.ADMIN_API_KEY;
  if (!expectedKey) {
    return NextResponse.json({ error: "Admin key not configured" }, { status: 500 });
  }
  const token = authHeader.replace("Bearer ", "");
  if (token !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ids array required" }, { status: 400 });
    }

    const deleted: string[] = [];
    const failed: { id: string; reason: string }[] = [];

    for (const id of ids) {
      try {
        await prisma.$queryRawUnsafe(`DELETE FROM "Report" WHERE id = $1`, id);
        deleted.push(id);
      } catch (err: unknown) {
        failed.push({
          id,
          reason: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return NextResponse.json({ deleted, failed, count: deleted.length });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
