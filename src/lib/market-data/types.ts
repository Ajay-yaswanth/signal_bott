import type { MarketSnapshot } from "@/lib/strategy/types";

export type MarketDataProviderName = "twelvedata" | "binance";

export interface MarketDataProvider {
  readonly name: MarketDataProviderName;
  getSnapshot(): Promise<MarketSnapshot>;
}
