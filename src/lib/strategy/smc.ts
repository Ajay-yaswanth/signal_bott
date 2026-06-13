import type {
  Candle,
  DirectionFlags,
  Quote,
} from "@/lib/strategy/types";

function recentCandles(candles: Candle[], lookback: number) {
  if (!Number.isInteger(lookback) || lookback < 3) {
    throw new Error("Lookback must be an integer of at least 3.");
  }

  return candles.slice(-lookback);
}

export function detectFairValueGap(
  candles: Candle[],
  quote: Pick<Quote, "ask" | "bid">,
  lookback = 10,
): DirectionFlags {
  const window = recentCandles(candles, lookback);
  let bullish = false;
  let bearish = false;

  for (let index = window.length - 2; index >= 1; index -= 1) {
    const older = window[index - 1];
    const newer = window[index + 1];

    if (newer.low > older.high && quote.ask >= older.high && quote.ask <= newer.low) {
      bullish = true;
    }

    if (newer.high < older.low && quote.bid <= older.low && quote.bid >= newer.high) {
      bearish = true;
    }

    if (bullish && bearish) break;
  }

  return { bullish, bearish };
}

export function detectLiquiditySweep(
  candles: Candle[],
  {
    lookback = 20,
    sweepPips = 2,
    pipSize,
  }: {
    lookback?: number;
    sweepPips?: number;
    pipSize: number;
  },
): DirectionFlags {
  const window = recentCandles(candles, lookback);
  const sweptCandle = window.at(-2);
  const swingCandles = window.slice(0, -3);

  if (!sweptCandle || swingCandles.length === 0) {
    return { bullish: false, bearish: false };
  }

  const swingHigh = Math.max(...swingCandles.map((candle) => candle.high));
  const swingLow = Math.min(...swingCandles.map((candle) => candle.low));
  const threshold = sweepPips * pipSize;

  return {
    bullish:
      sweptCandle.low < swingLow - threshold && sweptCandle.close > swingLow,
    bearish:
      sweptCandle.high > swingHigh + threshold && sweptCandle.close < swingHigh,
  };
}

export function detectOrderBlock(
  candles: Candle[],
  quote: Pick<Quote, "ask" | "bid">,
  {
    lookback = 30,
    movePips = 4,
    pipSize,
  }: {
    lookback?: number;
    movePips?: number;
    pipSize: number;
  },
): DirectionFlags {
  const window = recentCandles(candles, lookback);
  const moveThreshold = movePips * pipSize;
  let bullish = false;
  let bearish = false;

  for (let index = window.length - 6; index >= 0; index -= 1) {
    const block = window[index];
    const confirmationOne = window[index + 1];
    const confirmationTwo = window[index + 2];

    if (
      block.close < block.open &&
      (confirmationOne.close > block.open + moveThreshold ||
        confirmationTwo.close > block.open + moveThreshold) &&
      quote.ask >= block.low &&
      quote.ask <= block.open
    ) {
      bullish = true;
    }

    if (
      block.close > block.open &&
      (confirmationOne.close < block.open - moveThreshold ||
        confirmationTwo.close < block.open - moveThreshold) &&
      quote.bid >= block.open &&
      quote.bid <= block.high
    ) {
      bearish = true;
    }

    if (bullish && bearish) break;
  }

  return { bullish, bearish };
}
