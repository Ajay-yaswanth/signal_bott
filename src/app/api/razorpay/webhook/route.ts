import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  mapRazorpaySubscriptionStatus,
  unixTimestampToDate,
  verifyRazorpayWebhookSignature,
} from "@/lib/razorpay";

type WebhookSubscription = {
  id: string;
  status: string;
  customer_id?: string | null;
  current_end?: number | null;
  notes?: Record<string, string>;
};

type WebhookPayment = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  notes?: Record<string, string>;
};

type RazorpayWebhook = {
  event?: string;
  payload?: {
    subscription?: { entity?: WebhookSubscription };
    payment?: { entity?: WebhookPayment };
  };
};

function eventSubscriptionStatus(
  event: string,
  subscription?: WebhookSubscription,
) {
  if (event === "subscription.activated" || event === "subscription.charged") {
    return "ACTIVE" as const;
  }

  if (
    event === "subscription.pending" ||
    event === "subscription.halted" ||
    event === "payment.failed"
  ) {
    return "PAST_DUE" as const;
  }

  if (event === "subscription.cancelled") {
    return "CANCELLED" as const;
  }

  if (event === "subscription.completed" || event === "subscription.expired") {
    return "EXPIRED" as const;
  }

  return subscription
    ? mapRazorpaySubscriptionStatus(subscription.status)
    : undefined;
}

export async function POST(request: Request) {
  const signature = request.headers.get("x-razorpay-signature");
  const rawBody = await request.text();

  if (!signature || !verifyRazorpayWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  let webhook: RazorpayWebhook;

  try {
    webhook = JSON.parse(rawBody) as RazorpayWebhook;
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }

  const event = webhook.event ?? "unknown";
  const subscription = webhook.payload?.subscription?.entity;
  const payment = webhook.payload?.payment?.entity;
  let localSubscription = subscription
    ? await prisma.subscription.findUnique({
        where: { razorpaySubscriptionId: subscription.id },
      })
    : null;
  const notedUserId =
    subscription?.notes?.userId ?? payment?.notes?.userId ?? null;
  const userId = localSubscription?.userId ?? notedUserId;

  if (!userId) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const userExists = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!userExists) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const status = eventSubscriptionStatus(event, subscription);

  await prisma.$transaction(async (transaction) => {
    if (subscription) {
      if (localSubscription) {
        localSubscription = await transaction.subscription.update({
          where: { id: localSubscription.id },
          data: {
            status,
            razorpayCustomerId: subscription.customer_id ?? null,
            currentPeriodEnd: unixTimestampToDate(subscription.current_end),
          },
        });
      } else {
        localSubscription = await transaction.subscription.create({
          data: {
            userId,
            status: status ?? "TRIAL",
            razorpayCustomerId: subscription.customer_id ?? null,
            razorpaySubscriptionId: subscription.id,
            currentPeriodEnd: unixTimestampToDate(subscription.current_end),
          },
        });
      }
    }

    if (payment) {
      await transaction.payment.upsert({
        where: { razorpayPaymentId: payment.id },
        update: {
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
        },
        create: {
          userId,
          razorpayPaymentId: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
        },
      });
    }

    await transaction.auditLog.create({
      data: {
        userId,
        action: `RAZORPAY_${event.toUpperCase().replaceAll(".", "_")}`,
        metadata: {
          event,
          subscriptionId: subscription?.id ?? null,
          paymentId: payment?.id ?? null,
          subscriptionStatus: status ?? null,
          paymentStatus: payment?.status ?? null,
        },
      },
    });
  });

  return NextResponse.json({ received: true });
}
