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

const timeSeriesSchema = z.object({
  values: z.array(
    z.object({
      datetime: z.string(),
      open: z.string(),
      high: z.string(),
      low: z.string(),
      close: z.string(),
      volume: z.string().optional(),
    }),
  ),
});

const priceSchema = z.object({
  price: z.string(),
});

function endpoint(path: string, params: Record<string, string>) {
  const url = new URL(path, requiredEnv("TWELVE_DATA_BASE_URL"));
  const apiKey = requiredEnv("TWELVE_DATA_API_KEY");

  for (const [name, value] of Object.entries({ ...params, apikey: apiKey })) {
    url.searchParams.set(name, value);
  }

  return url;
}

async function candles(symbol: string, interval: string): Promise<Candle[]> {
  const body = await fetchJson(
    endpoint("/time_series", {
      symbol,
      interval,
      outputsize: "100",
      timezone: "UTC",
      format: "JSON",
    }),
  );
  const parsed = timeSeriesSchema.parse(body);

  return chronological(
    parsed.values.map((value) => ({
      timestamp: new Date(`${value.datetime.replace(" ", "T")}Z`),
      open: numeric(value.open, "open"),
      high: numeric(value.high, "high"),
      low: numeric(value.low, "low"),
      close: numeric(value.close, "close"),
      volume: value.volume ? numeric(value.volume, "volume") : undefined,
    })),
  );
}

export class TwelveDataProvider implements MarketDataProvider {
  readonly name = "twelvedata" as const;

  async getSnapshot(): Promise<MarketSnapshot> {
    const symbol = requiredEnv("TWELVE_DATA_SYMBOL").toUpperCase();
    const pointSize = positiveEnvNumber("TWELVE_DATA_POINT_SIZE");
    const spreadPoints = positiveEnvNumber("TWELVE_DATA_SPREAD_POINTS");
    const [m1Candles, m5Candles, m15Candles, priceBody] = await Promise.all([
      candles(symbol, "1min"),
      candles(symbol, "5min"),
      candles(symbol, "15min"),
      fetchJson(endpoint("/price", { symbol })),
    ]);
    const midpoint = numeric(priceSchema.parse(priceBody).price, "price");
    const halfSpread = (spreadPoints * pointSize) / 2;

    return {
      symbol: symbol.replace("/", ""),
      quote: {
        bid: midpoint - halfSpread,
        ask: midpoint + halfSpread,
        spreadPoints,
        pointSize,
      },
      m1Candles,
      m5Candles,
      m15Candles,
      capturedAt: new Date(),
    };
  }
}
