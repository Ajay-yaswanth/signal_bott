import "server-only";

import { z } from "zod";

import {
  chronological,
  fetchJson,
  numeric,
  positiveEnvNumber,
  requiredEnv,
} from "@/lib/market-data/shared";
import type { MarketDataProvider } from "@/lib/market-data/types";
import type { Candle, MarketSnapshot } from "@/lib/strategy/types";

const klineSchema = z.array(z.array(z.union([z.string(), z.number()])));
const bookTickerSchema = z.object({
  bidPrice: z.string(),
  askPrice: z.string(),
});

function endpoint(path: string, params: Record<string, string>) {
  const url = new URL(path, requiredEnv("BINANCE_BASE_URL"));

  for (const [name, value] of Object.entries(params)) {
    url.searchParams.set(name, value);
  }

  return url;
}

async function candles(symbol: string, interval: string): Promise<Candle[]> {
  const body = await fetchJson(
    endpoint("/api/v3/klines", { symbol, interval, limit: "100" }),
  );
  const parsed = klineSchema.parse(body);

  return chronological(
    parsed.map((value) => ({
      timestamp: new Date(numeric(value[0], "open time")),
      open: numeric(value[1], "open"),
      high: numeric(value[2], "high"),
      low: numeric(value[3], "low"),
      close: numeric(value[4], "close"),
      volume: numeric(value[5], "volume"),
    })),
  );
}

export class BinanceProvider implements MarketDataProvider {
  readonly name = "binance" as const;

  async getSnapshot(): Promise<MarketSnapshot> {
    const symbol = requiredEnv("BINANCE_SYMBOL").toUpperCase();
    const pointSize = positiveEnvNumber("BINANCE_POINT_SIZE");
    const [m1Candles, m5Candles, m15Candles, tickerBody] = await Promise.all([
      candles(symbol, "1m"),
      candles(symbol, "5m"),
      candles(symbol, "15m"),
      fetchJson(endpoint("/api/v3/ticker/bookTicker", { symbol })),
    ]);
    const ticker = bookTickerSchema.parse(tickerBody);
    const bid = numeric(ticker.bidPrice, "bid price");
    const ask = numeric(ticker.askPrice, "ask price");

    return {
      symbol,
      quote: {
        bid,
        ask,
        spreadPoints: (ask - bid) / pointSize,
        pointSize,
      },
      m1Candles,
      m5Candles,
      m15Candles,
      capturedAt: new Date(),
    };
  }
}
