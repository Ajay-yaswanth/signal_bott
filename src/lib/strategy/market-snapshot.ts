import { z } from "zod";

import type { MarketSnapshot } from "@/lib/strategy/types";

const candleSchema = z
  .object({
    timestamp: z.coerce.date(),
    open: z.number().positive(),
    high: z.number().positive(),
    low: z.number().positive(),
    close: z.number().positive(),
    volume: z.number().nonnegative().optional(),
  })
  .strict()
  .refine((candle) => candle.high >= candle.low, {
    message: "Candle high must be greater than or equal to its low.",
  })
  .refine(
    (candle) =>
      candle.open >= candle.low &&
      candle.open <= candle.high &&
      candle.close >= candle.low &&
      candle.close <= candle.high,
    { message: "Candle open and close must be within its high-low range." },
  );

const candlesSchema = z
  .array(candleSchema)
  .min(52, "At least 52 chronological candles are required.")
  .superRefine((candles, context) => {
    for (let index = 1; index < candles.length; index += 1) {
      if (candles[index].timestamp <= candles[index - 1].timestamp) {
        context.addIssue({
          code: "custom",
          path: [index, "timestamp"],
          message: "Candles must be ordered oldest-to-newest.",
        });
        return;
      }
    }
  });

export const marketSnapshotSchema = z
  .object({
    symbol: z
      .string()
      .trim()
      .min(2)
      .max(24)
      .transform((value) => value.toUpperCase()),
    quote: z
      .object({
        bid: z.number().positive(),
        ask: z.number().positive(),
        spreadPoints: z.number().nonnegative(),
        pointSize: z.number().positive(),
      })
      .strict()
      .refine((quote) => quote.ask >= quote.bid, {
        message: "Ask must be greater than or equal to bid.",
      }),
    m1Candles: candlesSchema,
    m5Candles: candlesSchema,
    m15Candles: candlesSchema,
    newsRisk: z
      .object({
        level: z.number().min(0).max(100),
        reason: z.string().trim().min(1).max(500).optional(),
      })
      .strict()
      .optional(),
    capturedAt: z.coerce.date(),
  })
  .strict();

export function parseMarketSnapshot(value: unknown): MarketSnapshot {
  return marketSnapshotSchema.parse(value);
}
