import { describe, expect, it } from "vitest";

import { marketSnapshotSchema } from "@/lib/strategy/market-snapshot";

function candles(count = 52) {
  return Array.from({ length: count }, (_, index) => ({
    timestamp: new Date(Date.UTC(2026, 0, 1, 0, index)),
    open: 100 + index,
    high: 102 + index,
    low: 99 + index,
    close: 101 + index,
  }));
}

function snapshot() {
  return {
    symbol: "xauusd",
    quote: {
      bid: 2300,
      ask: 2300.5,
      spreadPoints: 50,
      pointSize: 0.01,
    },
    m1Candles: candles(),
    m5Candles: candles(),
    m15Candles: candles(),
    capturedAt: new Date(),
  };
}

describe("market snapshot validation", () => {
  it("normalizes symbols and accepts optional news risk", () => {
    const result = marketSnapshotSchema.parse({
      ...snapshot(),
      newsRisk: { level: 25, reason: "No high-impact event nearby." },
    });

    expect(result.symbol).toBe("XAUUSD");
    expect(result.newsRisk?.level).toBe(25);
  });

  it("rejects invalid quote and news-risk values", () => {
    expect(
      marketSnapshotSchema.safeParse({
        ...snapshot(),
        quote: { bid: 2301, ask: 2300, spreadPoints: 50, pointSize: 0.01 },
        newsRisk: { level: 101 },
      }).success,
    ).toBe(false);
  });
});
