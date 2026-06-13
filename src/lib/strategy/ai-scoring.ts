import type {
  MarketSnapshot,
  StrategyConditions,
} from "@/lib/strategy/types";

export type StrategyDirection = "BUY" | "SELL";
export type AiSignalDecision = "NORMAL" | "SNIPER" | "REJECT";

export const NORMAL_CONFIDENCE_MINIMUM = 75;
export const SNIPER_CONFIDENCE_MINIMUM = 90;
export const HIGH_NEWS_RISK_LEVEL = 75;

export type AiFactorScores = {
  trendStrength: number;
  liquiditySweep: number;
  fvgQuality: number;
  orderBlockQuality: number;
  rsiCondition: number;
  adxStrength: number;
  atrVolatility: number;
  sessionQuality: number;
  newsRisk: number;
};

export type AiStrategyScore = {
  direction: StrategyDirection;
  confidence: number;
  decision: AiSignalDecision;
  factors: AiFactorScores;
  reasons: string[];
};

const FACTOR_WEIGHTS: Record<keyof AiFactorScores, number> = {
  trendStrength: 18,
  liquiditySweep: 12,
  fvgQuality: 12,
  orderBlockQuality: 12,
  rsiCondition: 10,
  adxStrength: 12,
  atrVolatility: 10,
  sessionQuality: 8,
  newsRisk: 6,
};

function clamp(value: number, minimum = 0, maximum = 100) {
  return Math.min(maximum, Math.max(minimum, value));
}

function directionalMatches(
  conditions: StrategyConditions,
  direction: StrategyDirection,
) {
  const bullish = direction === "BUY";

  return {
    trend: bullish
      ? conditions.confirmations.bullishTrend
      : conditions.confirmations.bearishTrend,
    fvg: bullish
      ? conditions.smc.fairValueGap.bullish
      : conditions.smc.fairValueGap.bearish,
    liquiditySweep: bullish
      ? conditions.smc.liquiditySweep.bullish
      : conditions.smc.liquiditySweep.bearish,
    orderBlock: bullish
      ? conditions.smc.orderBlock.bullish
      : conditions.smc.orderBlock.bearish,
  };
}

function trendStrength(
  conditions: StrategyConditions,
  direction: StrategyDirection,
) {
  const { m1, m5 } = conditions.indicators;
  const bullish = direction === "BUY";
  const m5Aligned = bullish
    ? m5.emaFast > m5.emaSlow && m5.emaSlow > m5.emaTrend
    : m5.emaFast < m5.emaSlow && m5.emaSlow < m5.emaTrend;
  const m1Aligned = bullish ? m1.emaFast > m1.emaSlow : m1.emaFast < m1.emaSlow;
  const crossover = bullish
    ? m1.previousEmaFast <= m1.previousEmaSlow
    : m1.previousEmaFast >= m1.previousEmaSlow;
  const directionalIndexAligned = bullish
    ? m5.directionalIndex.plusDi > m5.directionalIndex.minusDi
    : m5.directionalIndex.minusDi > m5.directionalIndex.plusDi;

  return (
    (m5Aligned ? 50 : 0) +
    (m1Aligned ? 20 : 0) +
    (crossover ? 15 : 0) +
    (directionalIndexAligned ? 15 : 0)
  );
}

function smcQuality(
  detected: boolean,
  otherConfirmations: number,
  trendScore: number,
) {
  if (!detected) return 0;
  return clamp(70 + otherConfirmations * 10 + (trendScore >= 70 ? 10 : 0));
}

function rsiCondition(rsi: number, direction: StrategyDirection) {
  const idealMinimum = direction === "BUY" ? 50 : 35;
  const idealMaximum = direction === "BUY" ? 65 : 50;
  const invalidEdge = direction === "BUY" ? 80 : 20;

  if (rsi >= idealMinimum && rsi <= idealMaximum) return 100;

  if (direction === "BUY") {
    if (rsi < idealMinimum) return clamp(100 - (idealMinimum - rsi) * 5);
    return clamp(100 - ((rsi - idealMaximum) * 100) / (invalidEdge - idealMaximum));
  }

  if (rsi > idealMaximum) return clamp(100 - (rsi - idealMaximum) * 5);
  return clamp(100 - ((idealMinimum - rsi) * 100) / (idealMinimum - invalidEdge));
}

function adxStrength(
  conditions: StrategyConditions,
  direction: StrategyDirection,
) {
  const { adx, plusDi, minusDi } = conditions.indicators.m5.directionalIndex;
  const directionAligned =
    direction === "BUY" ? plusDi > minusDi : minusDi > plusDi;

  if (!directionAligned) return 0;
  return clamp(((adx - 15) / 25) * 100);
}

function atrVolatility(snapshot: MarketSnapshot, conditions: StrategyConditions) {
  const lastClose = snapshot.m5Candles.at(-2)?.close;
  if (!lastClose) return 0;

  const atrPercent = (conditions.indicators.m5.atr / lastClose) * 100;
  if (atrPercent < 0.01) return clamp((atrPercent / 0.01) * 40);
  if (atrPercent < 0.03) return 40 + ((atrPercent - 0.01) / 0.02) * 60;
  if (atrPercent <= 2) return 100;
  return clamp(100 - (atrPercent - 2) * 20);
}

function sessionQuality(at: Date, active: boolean) {
  if (!active) return 0;

  const hour = at.getUTCHours();
  if (hour >= 12 && hour < 16) return 100;
  if ((hour >= 7 && hour < 12) || (hour >= 16 && hour < 17)) return 90;
  if (hour >= 0 && hour < 7) return 70;
  return 50;
}

function weightedConfidence(factors: AiFactorScores) {
  return Math.round(
    Object.entries(FACTOR_WEIGHTS).reduce(
      (total, [factor, weight]) =>
        total + factors[factor as keyof AiFactorScores] * (weight / 100),
      0,
    ),
  );
}

export function classifyAiConfidence(confidence: number): AiSignalDecision {
  if (confidence >= SNIPER_CONFIDENCE_MINIMUM) return "SNIPER";
  if (confidence >= NORMAL_CONFIDENCE_MINIMUM) return "NORMAL";
  return "REJECT";
}

export function scoreStrategyDirection(
  snapshot: MarketSnapshot,
  conditions: StrategyConditions,
  direction: StrategyDirection,
): AiStrategyScore {
  const matches = directionalMatches(conditions, direction);
  const confirmations = [
    matches.fvg,
    matches.liquiditySweep,
    matches.orderBlock,
  ].filter(Boolean).length;
  const trendScore = trendStrength(conditions, direction);
  const newsRiskLevel = snapshot.newsRisk?.level ?? 50;
  const factors: AiFactorScores = {
    trendStrength: trendScore,
    liquiditySweep: smcQuality(
      matches.liquiditySweep,
      confirmations - Number(matches.liquiditySweep),
      trendScore,
    ),
    fvgQuality: smcQuality(
      matches.fvg,
      confirmations - Number(matches.fvg),
      trendScore,
    ),
    orderBlockQuality: smcQuality(
      matches.orderBlock,
      confirmations - Number(matches.orderBlock),
      trendScore,
    ),
    rsiCondition: rsiCondition(conditions.indicators.m1.rsi, direction),
    adxStrength: adxStrength(conditions, direction),
    atrVolatility: atrVolatility(snapshot, conditions),
    sessionQuality: sessionQuality(
      snapshot.capturedAt,
      conditions.filters.sessionActive,
    ),
    newsRisk: 100 - newsRiskLevel,
  };
  const rawConfidence = weightedConfidence(factors);
  const blockedReasons = [
    !conditions.filters.spreadAllowed ? "Spread filter rejected the setup." : null,
    !conditions.filters.sessionActive ? "Session filter rejected the setup." : null,
    newsRiskLevel >= HIGH_NEWS_RISK_LEVEL
      ? `News risk is too high (${newsRiskLevel}%).`
      : null,
  ].filter((reason): reason is string => reason !== null);
  const confidence = blockedReasons.length > 0 ? 0 : rawConfidence;
  const decision = classifyAiConfidence(confidence);
  const reasons = [
    `Trend strength ${Math.round(factors.trendStrength)}%.`,
    `Liquidity sweep ${Math.round(factors.liquiditySweep)}%.`,
    `FVG quality ${Math.round(factors.fvgQuality)}%.`,
    `Order block quality ${Math.round(factors.orderBlockQuality)}%.`,
    `RSI condition ${Math.round(factors.rsiCondition)}%.`,
    `ADX strength ${Math.round(factors.adxStrength)}%.`,
    `ATR volatility ${Math.round(factors.atrVolatility)}%.`,
    `Session quality ${Math.round(factors.sessionQuality)}%.`,
    snapshot.newsRisk?.reason ??
      `News-risk safety score ${Math.round(factors.newsRisk)}%.`,
    ...blockedReasons,
  ];

  return { direction, confidence, decision, factors, reasons };
}

export function selectBestAiScore(
  snapshot: MarketSnapshot,
  conditions: StrategyConditions,
) {
  const buy = scoreStrategyDirection(snapshot, conditions, "BUY");
  const sell = scoreStrategyDirection(snapshot, conditions, "SELL");

  if (buy.confidence === sell.confidence) return null;
  return buy.confidence > sell.confidence ? buy : sell;
}
