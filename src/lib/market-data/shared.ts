import type { Candle } from "@/lib/strategy/types";

export class MarketDataProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MarketDataProviderError";
  }
}

export function requiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new MarketDataProviderError(`${name} is not configured.`);
  }

  return value;
}

export function positiveEnvNumber(name: string) {
  const value = Number(requiredEnv(name));

  if (!Number.isFinite(value) || value <= 0) {
    throw new MarketDataProviderError(`${name} must be a positive number.`);
  }

  return value;
}

export async function fetchJson(url: URL, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new MarketDataProviderError(
      `Market data request failed with status ${response.status}.`,
    );
  }

  return body;
}

export function chronological(candles: Candle[]) {
  return candles.toSorted(
    (left, right) => left.timestamp.getTime() - right.timestamp.getTime(),
  );
}

export function numeric(value: unknown, field: string) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new MarketDataProviderError(`Invalid numeric ${field}.`);
  }

  return parsed;
}
