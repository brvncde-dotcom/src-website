import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, password } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // If they exist and are a member, tell them to sign in
      if (existing.isMember) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please sign in." },
          { status: 409 }
        );
      }
      // If trial expired, tell them to contact
      if (existing.trialEnd && new Date(existing.trialEnd) < new Date()) {
        return NextResponse.json(
          { error: "Your trial has expired. Contact us for membership." },
          { status: 403 }
        );
      }
      // Otherwise, return success — they can use existing trial
      return NextResponse.json({
        message: "Welcome back",
        user: { id: existing.id, email: existing.email, name: existing.name },
      });
    }

    // Hash password if provided (for members who sign up with password)
    let passwordHash: string | undefined;
    if (password && password.length >= 6) {
      passwordHash = await bcrypt.hash(password, 12);
    }

    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 10);

    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split("@")[0],
        passwordHash,
        trialStart: new Date(),
        trialEnd,
      },
    });

    return NextResponse.json({
      message: "Trial activated",
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}