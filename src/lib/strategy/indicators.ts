import type {
  Candle,
  DirectionalIndex,
  IndicatorSnapshot,
  StrategyConfig,
} from "@/lib/strategy/types";

function assertPeriod(period: number) {
  if (!Number.isInteger(period) || period <= 0) {
    throw new Error("Indicator period must be a positive integer.");
  }
}

function assertValues(values: number[], minimum: number, indicator: string) {
  if (values.length < minimum) {
    throw new Error(`${indicator} requires at least ${minimum} values.`);
  }
}

function average(values: number[]) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

export function calculateEma(values: number[], period: number) {
  assertPeriod(period);
  assertValues(values, period, "EMA");

  const multiplier = 2 / (period + 1);
  let ema = average(values.slice(0, period));

  for (let index = period; index < values.length; index += 1) {
    ema = (values[index] - ema) * multiplier + ema;
  }

  return ema;
}

export function calculateRsi(values: number[], period: number) {
  assertPeriod(period);
  assertValues(values, period + 1, "RSI");

  let averageGain = 0;
  let averageLoss = 0;

  for (let index = 1; index <= period; index += 1) {
    const change = values[index] - values[index - 1];
    averageGain += Math.max(change, 0);
    averageLoss += Math.max(-change, 0);
  }

  averageGain /= period;
  averageLoss /= period;

  for (let index = period + 1; index < values.length; index += 1) {
    const change = values[index] - values[index - 1];
    averageGain =
      (averageGain * (period - 1) + Math.max(change, 0)) / period;
    averageLoss =
      (averageLoss * (period - 1) + Math.max(-change, 0)) / period;
  }

  if (averageLoss === 0) return averageGain === 0 ? 50 : 100;

  return 100 - 100 / (1 + averageGain / averageLoss);
}

export function calculateTrueRange(current: Candle, previous?: Candle) {
  if (!previous) return current.high - current.low;

  return Math.max(
    current.high - current.low,
    Math.abs(current.high - previous.close),
    Math.abs(current.low - previous.close),
  );
}

export function calculateAtr(candles: Candle[], period: number) {
  assertPeriod(period);
  assertValues(candles.map((candle) => candle.close), period + 1, "ATR");

  const trueRanges = candles.map((candle, index) =>
    calculateTrueRange(candle, candles[index - 1]),
  );
  let atr = average(trueRanges.slice(1, period + 1));

  for (let index = period + 1; index < trueRanges.length; index += 1) {
    atr = (atr * (period - 1) + trueRanges[index]) / period;
  }

  return atr;
}

export function calculateAdx(
  candles: Candle[],
  period: number,
): DirectionalIndex {
  assertPeriod(period);
  assertValues(candles.map((candle) => candle.close), period * 2 + 1, "ADX");

  const trueRanges: number[] = [];
  const plusDm: number[] = [];
  const minusDm: number[] = [];

  for (let index = 1; index < candles.length; index += 1) {
    const current = candles[index];
    const previous = candles[index - 1];
    const upMove = current.high - previous.high;
    const downMove = previous.low - current.low;

    trueRanges.push(calculateTrueRange(current, previous));
    plusDm.push(upMove > downMove && upMove > 0 ? upMove : 0);
    minusDm.push(downMove > upMove && downMove > 0 ? downMove : 0);
  }

  let smoothedTr = trueRanges.slice(0, period).reduce((sum, value) => sum + value, 0);
  let smoothedPlusDm = plusDm.slice(0, period).reduce((sum, value) => sum + value, 0);
  let smoothedMinusDm = minusDm.slice(0, period).reduce((sum, value) => sum + value, 0);
  const dxValues: number[] = [];
  let plusDi = 0;
  let minusDi = 0;

  for (let index = period - 1; index < trueRanges.length; index += 1) {
    if (index >= period) {
      smoothedTr =
        smoothedTr - smoothedTr / period + trueRanges[index];
      smoothedPlusDm =
        smoothedPlusDm - smoothedPlusDm / period + plusDm[index];
      smoothedMinusDm =
        smoothedMinusDm - smoothedMinusDm / period + minusDm[index];
    }

    plusDi = smoothedTr === 0 ? 0 : (100 * smoothedPlusDm) / smoothedTr;
    minusDi = smoothedTr === 0 ? 0 : (100 * smoothedMinusDm) / smoothedTr;
    const denominator = plusDi + minusDi;
    dxValues.push(
      denominator === 0 ? 0 : (100 * Math.abs(plusDi - minusDi)) / denominator,
    );
  }

  let adx = average(dxValues.slice(0, period));

  for (let index = period; index < dxValues.length; index += 1) {
    adx = (adx * (period - 1) + dxValues[index]) / period;
  }

  return { adx, plusDi, minusDi };
}

export function calculateIndicatorSnapshot(
  candles: Candle[],
  config: StrategyConfig,
): IndicatorSnapshot {
  const closedCandles = candles.slice(0, -1);
  const closes = closedCandles.map((candle) => candle.close);
  const previousCloses = closes.slice(0, -1);

  return {
    emaFast: calculateEma(closes, config.emaFastPeriod),
    emaSlow: calculateEma(closes, config.emaSlowPeriod),
    emaTrend: calculateEma(closes, config.emaTrendPeriod),
    previousEmaFast: calculateEma(previousCloses, config.emaFastPeriod),
    previousEmaSlow: calculateEma(previousCloses, config.emaSlowPeriod),
    rsi: calculateRsi(closes, config.rsiPeriod),
    atr: calculateAtr(closedCandles, config.atrPeriod),
    directionalIndex: calculateAdx(closedCandles, config.adxPeriod),
  };
}
