import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { name, address, email, profession } = await req.json();

    if (!name?.trim() || !address?.trim() || !email?.trim() || !profession?.trim()) {
      return NextResponse.json(
        { error: "All fields are required: name, address, email, profession" },
        { status: 400 }
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }

    const existing = await prisma.member.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existing) {
      return NextResponse.json({
        message: "Welcome back",
        member: { id: existing.id, name: existing.name },
        isNew: false,
      });
    }

    const member = await prisma.member.create({
      data: {
        name: name.trim(),
        address: address.trim(),
        email: email.trim().toLowerCase(),
        profession: profession.trim(),
      },
    });

    return NextResponse.json({
      message: "Registration successful",
      member: { id: member.id, name: member.name },
      isNew: true,
    });
  } catch (error) {
    console.error("Member register error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}