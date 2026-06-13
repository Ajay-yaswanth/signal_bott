import "server-only";

import { timingSafeEqual } from "node:crypto";
import { z } from "zod";

import { marketSnapshotSchema } from "@/lib/strategy/market-snapshot";

const tradingViewWebhookSchema = z
  .object({
    secret: z.string().min(1),
    snapshot: marketSnapshotSchema,
  })
  .strict();

export class TradingViewWebhookAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TradingViewWebhookAuthError";
  }
}

function safeEqual(expected: string, received: string) {
  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(received, "utf8");

  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export function parseTradingViewWebhook(value: unknown) {
  const parsed = tradingViewWebhookSchema.parse(value);
  const expectedSecret = process.env.TRADINGVIEW_WEBHOOK_SECRET;

  if (!expectedSecret || !safeEqual(expectedSecret, parsed.secret)) {
    throw new TradingViewWebhookAuthError("Invalid TradingView webhook secret.");
  }

  return parsed.snapshot;
}
