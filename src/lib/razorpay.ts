import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import type { SubscriptionStatus } from "@prisma/client";

const RAZORPAY_API_URL = "https://api.razorpay.com/v1";

type RazorpaySubscription = {
  id: string;
  status: string;
  customer_id?: string | null;
  current_end?: number | null;
  notes?: Record<string, string>;
};

type RazorpayPayment = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  notes?: Record<string, string>;
};

export function getRazorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const planId = process.env.RAZORPAY_MONTHLY_PLAN_ID;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!keyId || !keySecret || !planId || !webhookSecret) {
    throw new Error("Razorpay environment variables are not configured.");
  }

  return {
    keyId,
    keySecret,
    planId,
    webhookSecret,
    totalCount: Number(process.env.RAZORPAY_SUBSCRIPTION_TOTAL_COUNT ?? 120),
  };
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

export function createRazorpaySubscription({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  const { planId, totalCount } = getRazorpayConfig();

  return razorpayRequest<RazorpaySubscription>("/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      plan_id: planId,
      total_count: totalCount,
      quantity: 1,
      customer_notify: 1,
      notes: {
        userId,
        email,
        product: "ULTRON Signals Monthly",
      },
    }),
  });
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
    case "active":
    case "authenticated":
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
      return "TRIAL";
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
