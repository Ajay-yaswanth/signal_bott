/**
 * Strategy functions expect candles ordered oldest-to-newest.
 * Indicator snapshots treat the final candle as the still-forming candle.
 */
export type Candle = {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

export type Quote = {
  bid: number;
  ask: number;
  spreadPoints: number;
  pointSize: number;
};

export type DirectionFlags = {
  bullish: boolean;
  bearish: boolean;
};

export type DirectionalIndex = {
  adx: number;
  plusDi: number;
  minusDi: number;
};

export type StrategyConfig = {
  emaFastPeriod: number;
  emaSlowPeriod: number;
  emaTrendPeriod: number;
  rsiPeriod: number;
  atrPeriod: number;
  adxPeriod: number;
  adxMinimum: number;
  rsiBuyMinimum: number;
  rsiBuyMaximum: number;
  rsiSellMinimum: number;
  rsiSellMaximum: number;
  fvgLookback: number;
  liquidityLookback: number;
  liquiditySweepPips: number;
  orderBlockLookback: number;
  orderBlockMovePips: number;
  maxSpreadPoints: number;
  minSpreadPoints: number;
  trade24Five: boolean;
  londonStartUtc: number;
  londonEndUtc: number;
  newYorkStartUtc: number;
  newYorkEndUtc: number;
};

export type IndicatorSnapshot = {
  emaFast: number;
  emaSlow: number;
  emaTrend: number;
  previousEmaFast: number;
  previousEmaSlow: number;
  rsi: number;
  atr: number;
  directionalIndex: DirectionalIndex;
};

export type StrategyConditions = {
  indicators: {
    m1: IndicatorSnapshot;
    m5: IndicatorSnapshot;
  };
  smc: {
    fairValueGap: DirectionFlags;
    liquiditySweep: DirectionFlags;
    orderBlock: DirectionFlags;
  };
  filters: {
    sessionActive: boolean;
    spreadAllowed: boolean;
  };
  confirmations: {
    bullishTrend: boolean;
    bearishTrend: boolean;
    bullishSmc: boolean;
    bearishSmc: boolean;
  };
};

export type MarketSnapshot = {
  symbol: string;
  quote: Quote;
  m1Candles: Candle[];
  m5Candles: Candle[];
  m15Candles: Candle[];
  newsRisk?: {
    level: number;
    reason?: string;
  };
  capturedAt: Date;
};

export const defaultStrategyConfig: StrategyConfig = {
  emaFastPeriod: 8,
  emaSlowPeriod: 21,
  emaTrendPeriod: 50,
  rsiPeriod: 7,
  atrPeriod: 14,
  adxPeriod: 14,
  adxMinimum: 20,
  rsiBuyMinimum: 35,
  rsiBuyMaximum: 72,
  rsiSellMinimum: 28,
  rsiSellMaximum: 65,
  fvgLookback: 10,
  liquidityLookback: 20,
  liquiditySweepPips: 2,
  orderBlockLookback: 30,
  orderBlockMovePips: 4,
  maxSpreadPoints: 55,
  minSpreadPoints: 0,
  trade24Five: true,
  londonStartUtc: 7,
  londonEndUtc: 16,
  newYorkStartUtc: 12,
  newYorkEndUtc: 21,
};
