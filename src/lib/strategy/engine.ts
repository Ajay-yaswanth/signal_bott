import { isSessionActive, isSpreadAllowed } from "@/lib/strategy/filters";
import { calculateIndicatorSnapshot } from "@/lib/strategy/indicators";
import {
  detectFairValueGap,
  detectLiquiditySweep,
  detectOrderBlock,
} from "@/lib/strategy/smc";
import {
  defaultStrategyConfig,
  type Candle,
  type Quote,
  type StrategyConditions,
  type StrategyConfig,
} from "@/lib/strategy/types";

export function evaluateStrategyConditions({
  m1Candles,
  m5Candles,
  m15Candles,
  quote,
  evaluatedAt = new Date(),
  config: configOverrides = {},
}: {
  m1Candles: Candle[];
  m5Candles: Candle[];
  m15Candles: Candle[];
  quote: Quote;
  evaluatedAt?: Date;
  config?: Partial<StrategyConfig>;
}): StrategyConditions {
  const config = { ...defaultStrategyConfig, ...configOverrides };
  const m1 = calculateIndicatorSnapshot(m1Candles, config);
  const m5 = calculateIndicatorSnapshot(m5Candles, config);
  const pipSize = quote.pointSize * 10;
  const fairValueGap = detectFairValueGap(
    m1Candles,
    quote,
    config.fvgLookback,
  );
  const liquiditySweep = detectLiquiditySweep(m5Candles, {
    lookback: config.liquidityLookback,
    sweepPips: config.liquiditySweepPips,
    pipSize,
  });
  const orderBlock = detectOrderBlock(m15Candles, quote, {
    lookback: config.orderBlockLookback,
    movePips: config.orderBlockMovePips,
    pipSize,
  });

  const bullishTrend =
    m5.emaFast > m5.emaSlow &&
    m5.emaSlow > m5.emaTrend &&
    m1.emaFast > m1.emaSlow &&
    m1.previousEmaFast <= m1.previousEmaSlow &&
    m1.rsi >= config.rsiBuyMinimum &&
    m1.rsi <= config.rsiBuyMaximum &&
    m5.directionalIndex.adx >= config.adxMinimum &&
    m5.directionalIndex.plusDi > m5.directionalIndex.minusDi;
  const bearishTrend =
    m5.emaFast < m5.emaSlow &&
    m5.emaSlow < m5.emaTrend &&
    m1.emaFast < m1.emaSlow &&
    m1.previousEmaFast >= m1.previousEmaSlow &&
    m1.rsi >= config.rsiSellMinimum &&
    m1.rsi <= config.rsiSellMaximum &&
    m5.directionalIndex.adx >= config.adxMinimum &&
    m5.directionalIndex.minusDi > m5.directionalIndex.plusDi;

  return {
    indicators: { m1, m5 },
    smc: {
      fairValueGap,
      liquiditySweep,
      orderBlock,
    },
    filters: {
      sessionActive: isSessionActive({
        at: evaluatedAt,
        trade24Five: config.trade24Five,
        londonStartUtc: config.londonStartUtc,
        londonEndUtc: config.londonEndUtc,
        newYorkStartUtc: config.newYorkStartUtc,
        newYorkEndUtc: config.newYorkEndUtc,
      }),
      spreadAllowed: isSpreadAllowed({
        spreadPoints: quote.spreadPoints,
        minimum: config.minSpreadPoints,
        maximum: config.maxSpreadPoints,
      }),
    },
    confirmations: {
      bullishTrend,
      bearishTrend,
      bullishSmc:
        fairValueGap.bullish ||
        (liquiditySweep.bullish && orderBlock.bullish),
      bearishSmc:
        fairValueGap.bearish ||
        (liquiditySweep.bearish && orderBlock.bearish),
    },
  };
}
