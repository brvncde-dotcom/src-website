import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, getTierBySlug } from "@/lib/db";
import Stripe from "stripe";

async function getAuthUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  return user;
}

// POST /api/subscriptions/create — Create a Stripe checkout session
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tierSlug, interval } = body;

    if (!tierSlug || typeof tierSlug !== "string") {
      return NextResponse.json(
        { error: "tierSlug is required" },
        { status: 400 }
      );
    }

    if (interval !== "month" && interval !== "year") {
      return NextResponse.json(
        { error: "interval must be 'month' or 'year'" },
        { status: 400 }
      );
    }

    const tier = await getTierBySlug(tierSlug);
    if (!tier) {
      return NextResponse.json({ error: "Tier not found" }, { status: 404 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeKey);

    // Determine amount from tier
    const amount =
      interval === "month"
        ? Number(tier.priceMonthlyChf) * 100
        : Number(tier.priceAnnualChf) * 100;

    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create a checkout session
    // In production, prices would be pre-created in Stripe Dashboard
    // Here we create a one-off session with line items
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "chf",
            unit_amount: amount,
            recurring: {
              interval: interval === "year" ? "year" : "month",
            },
            product_data: {
              name: `SRC Advisory — ${tier.name} (${interval === "year" ? "Annual" : "Monthly"})`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        tierId: tier.id,
        tierSlug: tier.slug,
        interval,
      },
      success_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/?subscription=success`,
      cancel_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/?subscription=cancelled`,
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}