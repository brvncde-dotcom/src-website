import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const members = await prisma.member.findMany({
      where: { name: { contains: name.trim(), mode: "insensitive" } },
      select: { id: true, name: true },
      take: 5,
    });

    if (members.length === 0) {
      return NextResponse.json(
        { error: "No member found with that name. Please register first." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Access granted",
      members,
    });
  } catch (error) {
    console.error("Member access error:", error);
    return NextResponse.json({ error: "Access check failed" }, { status: 500 });
  }
}