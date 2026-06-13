import "server-only";

import { BinanceProvider } from "@/lib/market-data/binance";
import { MarketDataProviderError, requiredEnv } from "@/lib/market-data/shared";
import { TwelveDataProvider } from "@/lib/market-data/twelve-data";
import type {
  MarketDataProvider,
  MarketDataProviderName,
} from "@/lib/market-data/types";

export function getConfiguredMarketDataProvider(): MarketDataProvider {
  const name = requiredEnv("MARKET_DATA_PROVIDER").toLowerCase();

  if (name === "twelvedata") return new TwelveDataProvider();
  if (name === "binance") return new BinanceProvider();

  throw new MarketDataProviderError(`Unsupported MARKET_DATA_PROVIDER: ${name}`);
}

export type { MarketDataProvider, MarketDataProviderName };
