import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

export const runtime = "nodejs";

interface StripeSubscriptionData {
  id: string;
  status: string;
  current_period_start?: number;
  current_period_end?: number;
  cancel_at_period_end?: boolean;
  start_date?: number;
  billing_schedules?: Array<{ start_date: number; end_date: number }>;
}

interface StripeInvoiceData {
  id: string;
  subscription?: string | StripeSubscriptionData;
}

interface StripeSessionData {
  id: string;
  metadata?: Record<string, string>;
  subscription?: string | StripeSubscriptionData;
}

function getPeriodStart(sub: StripeSubscriptionData): Date {
  if (sub.current_period_start) {
    return new Date(sub.current_period_start * 1000);
  }
  if (sub.start_date) {
    return new Date(sub.start_date * 1000);
  }
  if (sub.billing_schedules && sub.billing_schedules.length > 0) {
    return new Date(sub.billing_schedules[0].start_date * 1000);
  }
  return new Date();
}

function getPeriodEnd(sub: StripeSubscriptionData): Date {
  if (sub.current_period_end) {
    return new Date(sub.current_period_end * 1000);
  }
  const start = getPeriodStart(sub);
  return new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
}

function extractSubscriptionId(
  data: string | StripeSubscriptionData | undefined | null
): string | null {
  if (!data) return null;
  if (typeof data === "string") return data;
  return data.id;
}

async function handleCheckoutCompleted(session: StripeSessionData) {
  const userId = session.metadata?.userId;
  const tierId = session.metadata?.tierId;
  const interval = session.metadata?.interval || "month";
  const stripeSubscriptionId = extractSubscriptionId(session.subscription);

  if (!userId || !tierId || !stripeSubscriptionId) {
    console.error("Missing metadata in checkout.session.completed");
    return;
  }

  const now = new Date();
  const periodMs =
    interval === "year"
      ? 366 * 24 * 60 * 60 * 1000
      : 31 * 24 * 60 * 60 * 1000;
  const periodEnd = new Date(now.getTime() + periodMs);

  await prisma.subscription.upsert({
    where: { stripeSubscriptionId },
    update: {
      status: "active",
      stripeStatus: "active",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      billingInterval: interval,
    },
    create: {
      userId,
      tierId,
      stripeSubscriptionId,
      stripeStatus: "active",
      billingInterval: interval,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      status: "active",
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { currentTierId: tierId },
  });
}

async function handleSubscriptionUpdated(subscription: StripeSubscriptionData) {
  const stripeSubscriptionId = subscription.id;

  const existing = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId },
  });
  if (!existing) {
    console.error(`Subscription ${stripeSubscriptionId} not found in DB`);
    return;
  }

  const status =
    subscription.status === "active" || subscription.status === "trialing"
      ? "active"
      : subscription.status;

  await prisma.subscription.update({
    where: { stripeSubscriptionId },
    data: {
      status,
      stripeStatus: subscription.status,
      currentPeriodStart: getPeriodStart(subscription),
      currentPeriodEnd: getPeriodEnd(subscription),
      cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
    },
  });
}

async function handleSubscriptionDeleted(subscription: StripeSubscriptionData) {
  const stripeSubscriptionId = subscription.id;

  const existing = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId },
  });
  if (!existing) return;

  await prisma.subscription.update({
    where: { stripeSubscriptionId },
    data: { status: "canceled", stripeStatus: subscription.status },
  });

  const activeSubs = await prisma.subscription.count({
    where: {
      userId: existing.userId,
      status: "active",
      id: { not: existing.id },
      currentPeriodEnd: { gte: new Date() },
    },
  });

  if (activeSubs === 0) {
    const observerTier = await prisma.tier.findUnique({
      where: { slug: "observer" },
      select: { id: true },
    });
    if (observerTier) {
      await prisma.user.update({
        where: { id: existing.userId },
        data: { currentTierId: observerTier.id },
      });
    }
  }
}

async function handleInvoicePaymentFailed(invoice: StripeInvoiceData) {
  const stripeSubscriptionId = extractSubscriptionId(invoice.subscription);
  if (!stripeSubscriptionId) return;

  const existing = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId },
  });
  if (!existing) return;

  await prisma.subscription.update({
    where: { stripeSubscriptionId },
    data: { status: "past_due" },
  });
}

// POST /api/subscriptions/webhook — Stripe webhook handler
export async function POST(request: NextRequest) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeKey || !webhookSecret) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeKey);
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (constructError) {
      console.error("Stripe webhook signature verification failed:", constructError);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    const obj = event.data.object as unknown as Record<string, unknown>;

    if (event.type === "checkout.session.completed") {
      await handleCheckoutCompleted(obj as unknown as StripeSessionData);
    } else if (event.type === "customer.subscription.updated") {
      await handleSubscriptionUpdated(obj as unknown as StripeSubscriptionData);
    } else if (event.type === "customer.subscription.deleted") {
      await handleSubscriptionDeleted(obj as unknown as StripeSubscriptionData);
    } else if (event.type === "invoice.payment_failed") {
      await handleInvoicePaymentFailed(obj as unknown as StripeInvoiceData);
    } else {
      console.log("Unhandled Stripe event:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing Stripe webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
