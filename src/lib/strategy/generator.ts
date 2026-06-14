import "server-only";

import type { SignalDirection } from "@prisma/client";

import {
  selectBestAiScore,
  type AiStrategyScore,
  type StrategyDirection,
} from "@/lib/strategy/ai-scoring";
import { evaluateStrategyConditions } from "@/lib/strategy/engine";
import { prisma } from "@/lib/prisma";
import type { MarketSnapshot, StrategyConditions } from "@/lib/strategy/types";

const DEFAULT_MAX_NORMAL_PER_DAY = 25;
const DEFAULT_MAX_SNIPER_PER_DAY = 8;
const DEFAULT_DUPLICATE_WINDOW_MINUTES = 30;

type SignalType = "NORMAL" | "SNIPER";

type Candidate = {
  direction: StrategyDirection;
  type: SignalType;
  confidence: number;
  conditions: StrategyConditions;
  aiScore: AiStrategyScore;
};

export type GenerationResult =
  | { created: false; reason: string; confidence?: number }
  | {
      created: true;
      signal: {
        id: string;
        symbol: string;
        direction: SignalDirection;
        type: SignalType;
        confidence: number;
        createdAt: Date;
      };
    };

function boundedDailyLimit(
  value: string | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= minimum && parsed <= maximum
    ? parsed
    : fallback;
}

function utcDayRange(at: Date) {
  const start = new Date(
    Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate()),
  );
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

function selectCandidate(
  score: AiStrategyScore | null,
  conditions: StrategyConditions,
): Candidate | null {
  if (!score || score.decision === "REJECT") return null;

  return {
    direction: score.direction,
    type: score.decision,
    confidence: score.confidence,
    conditions,
    aiScore: score,
  };
}

function signalLevels(snapshot: MarketSnapshot, candidate: Candidate) {
  const entry =
    candidate.direction === "BUY" ? snapshot.quote.ask : snapshot.quote.bid;
  const risk = candidate.conditions.indicators.m5.atr * 1.2;
  const multiplier = candidate.direction === "BUY" ? 1 : -1;

  return {
    entry,
    stopLoss: entry - risk * multiplier,
    tp1: entry + risk * multiplier,
    tp2: entry + risk * 2 * multiplier,
    tp3: entry + risk * 3 * multiplier,
  };
}

function candidateDescription(candidate: Candidate) {
  const bullish = candidate.direction === "BUY";
  const smc = candidate.conditions.smc;
  const confirmations = [
    (bullish ? smc.fairValueGap.bullish : smc.fairValueGap.bearish)
      ? "fair value gap"
      : null,
    (bullish ? smc.liquiditySweep.bullish : smc.liquiditySweep.bearish)
      ? "liquidity sweep"
      : null,
    (bullish ? smc.orderBlock.bullish : smc.orderBlock.bearish)
      ? "order block"
      : null,
  ].filter(Boolean);

  return {
    bias: `${candidate.type === "SNIPER" ? "Sniper" : "Automated"} ${candidate.direction.toLowerCase()} setup`,
    reason: `EMA 8/21/50 trend, RSI and ADX confirmed with ${confirmations.join(", ")}.`,
  };
}

export async function generateAutomatedSignal(
  snapshot: MarketSnapshot,
): Promise<GenerationResult> {
  const conditions = evaluateStrategyConditions({
    m1Candles: snapshot.m1Candles,
    m5Candles: snapshot.m5Candles,
    m15Candles: snapshot.m15Candles,
    quote: snapshot.quote,
    evaluatedAt: snapshot.capturedAt,
  });
  const bestScore = selectBestAiScore(snapshot, conditions);
  const candidate = selectCandidate(bestScore, conditions);

  if (!candidate) {
    return {
      created: false,
      reason: bestScore
        ? `AI score rejected the setup at ${bestScore.confidence}% confidence.`
        : "AI score found no directional edge.",
      confidence: bestScore?.confidence,
    };
  }

  const { start, end } = utcDayRange(snapshot.capturedAt);
  const maxDaily =
    candidate.type === "SNIPER"
      ? boundedDailyLimit(
          process.env.ULTRON_MAX_SNIPER_SIGNALS_PER_DAY,
          DEFAULT_MAX_SNIPER_PER_DAY,
          5,
          10,
        )
      : boundedDailyLimit(
          process.env.ULTRON_MAX_NORMAL_SIGNALS_PER_DAY,
          DEFAULT_MAX_NORMAL_PER_DAY,
          20,
          30,
        );
  const duplicateWindowMinutes = DEFAULT_DUPLICATE_WINDOW_MINUTES;
  const duplicateSince = new Date(
    snapshot.capturedAt.getTime() - duplicateWindowMinutes * 60_000,
  );
  const [dailyCount, duplicate] = await Promise.all([
    prisma.signal.count({
      where: {
        createdAt: { gte: start, lt: end },
      },
    }),
    prisma.signal.findFirst({
      where: {
        symbol: snapshot.symbol,
        direction: candidate.direction,
        createdAt: { gte: duplicateSince },
      },
      select: { id: true },
    }),
  ]);

  if (dailyCount >= maxDaily) {
    return {
      created: false,
      reason: `${candidate.type.toLowerCase()} daily limit reached.`,
      confidence: candidate.confidence,
    };
  }

  if (duplicate) {
    return {
      created: false,
      reason: "Duplicate setup suppressed.",
      confidence: candidate.confidence,
    };
  }

  const levels = signalLevels(snapshot, candidate);
  const description = candidateDescription(candidate);

  try {
    const signal = await prisma.signal.create({
      data: {
        symbol: snapshot.symbol,
        direction: candidate.direction,
        confidence: candidate.confidence,
        ...levels,
        ...description,
        status: "ACTIVE",
        result: "PENDING",
        createdAt: snapshot.capturedAt,
      },
      select: {
        id: true,
        symbol: true,
        direction: true,
        confidence: true,
        createdAt: true,
      },
    });

    return {
      created: true,
      signal: {
        ...signal,
        type: candidate.type,
      },
    };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return {
        created: false,
        reason: "Duplicate scan suppressed.",
        confidence: candidate.confidence,
      };
    }

    throw error;
  }
}
