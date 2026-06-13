import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import type { SubscriptionStatus } from "@prisma/client";

import { PAID_TRIAL } from "@/lib/billing-plans";

const RAZORPAY_API_URL = "https://api.razorpay.com/v1";

export type RazorpaySubscription = {
  id: string;
  status: string;
  customer_id?: string | null;
  current_start?: number | null;
  current_end?: number | null;
  start_at?: number | null;
  notes?: Record<string, string>;
};

export type RazorpayPayment = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  notes?: Record<string, string>;
};

type RazorpayPlan = {
  id: string;
};

export function getRazorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!keyId || !keySecret || !webhookSecret) {
    throw new Error("Razorpay environment variables are not configured.");
  }

  return { keyId, keySecret, webhookSecret };
}

async function razorpayRequest<T>(path: string, init?: RequestInit) {
  const { keyId, keySecret } = getRazorpayConfig();
  const response = await fetch(`${RAZORPAY_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Razorpay API error (${response.status}): ${body}`);
  }

  return (await response.json()) as T;
}

export function createRazorpayPlan(plan: {
  name: string;
  description: string;
  amount: number;
  intervalMonths: number;
  code: string;
}) {
  return razorpayRequest<RazorpayPlan>("/plans", {
    method: "POST",
    body: JSON.stringify({
      period: "monthly",
      interval: plan.intervalMonths,
      item: {
        name: `${plan.name} ${plan.intervalMonths === 1 ? "Monthly" : "3-Month"}`,
        amount: plan.amount,
        currency: "INR",
        description: plan.description,
      },
      notes: { planCode: plan.code },
    }),
  });
}

export function createRazorpaySubscription({
  planId,
  planCode,
  intervalMonths,
  userId,
  email,
  startAt,
}: {
  planId: string;
  planCode: string;
  intervalMonths: number;
  userId: string;
  email: string;
  startAt: Date;
}) {
  return razorpayRequest<RazorpaySubscription>("/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      plan_id: planId,
      total_count: intervalMonths === 1 ? 120 : 40,
      quantity: 1,
      customer_notify: 1,
      start_at: Math.floor(startAt.getTime() / 1000),
      addons: [
        {
          item: {
            name: "ULTRON Signals 2-Day Paid Trial",
            amount: PAID_TRIAL.offerAmount,
            currency: "INR",
          },
        },
      ],
      notes: {
        userId,
        email,
        planCode,
        paidTrial: "2-days",
        autopayConsent: "true",
      },
    }),
  });
}

export function cancelRazorpaySubscription(
  subscriptionId: string,
  cancelAtCycleEnd = true,
) {
  return razorpayRequest<RazorpaySubscription>(
    `/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`,
    {
      method: "POST",
      body: JSON.stringify({ cancel_at_cycle_end: cancelAtCycleEnd ? 1 : 0 }),
    },
  );
}

export function fetchRazorpaySubscription(subscriptionId: string) {
  return razorpayRequest<RazorpaySubscription>(
    `/subscriptions/${encodeURIComponent(subscriptionId)}`,
  );
}

export function fetchRazorpayPayment(paymentId: string) {
  return razorpayRequest<RazorpayPayment>(
    `/payments/${encodeURIComponent(paymentId)}`,
  );
}

export function mapRazorpaySubscriptionStatus(
  status: string,
): SubscriptionStatus {
  switch (status) {
    case "created":
    case "authenticated":
      return "TRIAL";
    case "active":
      return "ACTIVE";
    case "pending":
    case "halted":
      return "PAST_DUE";
    case "cancelled":
      return "CANCELLED";
    case "completed":
    case "expired":
      return "EXPIRED";
    default:
      return "CREATED";
  }
}

export function unixTimestampToDate(timestamp?: number | null) {
  return timestamp ? new Date(timestamp * 1000) : null;
}

function signaturesMatch(expected: string, received: string) {
  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(received, "utf8");

  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export function verifyRazorpayCheckoutSignature({
  paymentId,
  subscriptionId,
  signature,
}: {
  paymentId: string;
  subscriptionId: string;
  signature: string;
}) {
  const { keySecret } = getRazorpayConfig();
  const expected = createHmac("sha256", keySecret)
    .update(`${paymentId}|${subscriptionId}`)
    .digest("hex");

  return signaturesMatch(expected, signature);
}

export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string,
) {
  const { webhookSecret } = getRazorpayConfig();
  const expected = createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  return signaturesMatch(expected, signature);
}
