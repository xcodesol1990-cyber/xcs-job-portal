import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { env } from "@/server/lib/env";
import { prisma } from "@/server/db/prisma";
import { Prisma } from "@prisma/client";
import { PaymentService } from "@/server/services/payment.service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const webhookSecret = env().STRIPE_WEBHOOK_SECRET;

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;

  if (webhookSecret && signature) {
    try {
      const stripe = new Stripe(env().STRIPE_SECRET_KEY || "sk_test_mock", {
        apiVersion: "2026-03-31.acacia" as unknown as Stripe.LatestApiVersion,
      });
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Webhook signature verification failed";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  } else {
    // If testing without live webhook secret, parse body safely
    try {
      event = JSON.parse(body) as Stripe.Event;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
  }

  // Record webhook in DB to ensure idempotency and replay safety
  const existingEvent = await prisma.webhookEvent.findUnique({
    where: {
      provider_eventId: {
        provider: "stripe",
        eventId: event.id,
      },
    },
  });

  if (existingEvent) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  await prisma.webhookEvent.create({
    data: {
      provider: "stripe",
      eventId: event.id,
      type: event.type,
      payload: event as unknown as Prisma.InputJsonValue,
    },
  });

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await PaymentService.handlePaymentSucceeded(paymentIntent.id);
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await PaymentService.handlePaymentFailed(paymentIntent.id);
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        if (charge.payment_intent && typeof charge.payment_intent === "string") {
          await PaymentService.handleChargeRefunded(charge.payment_intent);
        }
        break;
      }
      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        await PaymentService.handleAccountUpdated(account.id, !!account.payouts_enabled);
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error("Stripe webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing failure" }, { status: 500 });
  }
}

