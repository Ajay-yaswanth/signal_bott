import type { Prisma } from "@/generated/prisma/client";

const directions = ["BUY", "SELL", "WAIT"] as const;
const results = ["TP1", "TP2", "TP3", "SL", "BE", "PENDING"] as const;

export type SignalHistoryFilters = {
  search: string;
  direction?: (typeof directions)[number];
  result?: (typeof results)[number];
  date?: string;
};

function valueFrom(
  params: Record<string, string | string[] | undefined> | URLSearchParams,
  key: string,
) {
  const value =
    params instanceof URLSearchParams ? params.get(key) : params[key];

  return Array.isArray(value) ? value[0] : value ?? "";
}

export function parseSignalHistoryFilters(
  params: Record<string, string | string[] | undefined> | URLSearchParams,
): SignalHistoryFilters {
  const direction = valueFrom(params, "direction");
  const result = valueFrom(params, "result");
  const date = valueFrom(params, "date");

  return {
    search: valueFrom(params, "search").trim().slice(0, 30),
    direction: directions.includes(direction as (typeof directions)[number])
      ? (direction as (typeof directions)[number])
      : undefined,
    result: results.includes(result as (typeof results)[number])
      ? (result as (typeof results)[number])
      : undefined,
    date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined,
  };
}

export function buildSignalHistoryWhere(
  filters: SignalHistoryFilters,
): Prisma.SignalWhereInput {
  const where: Prisma.SignalWhereInput = {};

  if (filters.search) {
    where.symbol = {
      contains: filters.search,
      mode: "insensitive",
    };
  }

  if (filters.direction) {
    where.direction = filters.direction;
  }

  if (filters.result) {
    where.result = filters.result;
  }

  if (filters.date) {
    const start = new Date(`${filters.date}T00:00:00.000Z`);
    const end = new Date(`${filters.date}T23:59:59.999Z`);
    where.createdAt = { gte: start, lte: end };
  }

  return where;
}

export function signalHistoryQuery(filters: SignalHistoryFilters) {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.direction) params.set("direction", filters.direction);
  if (filters.result) params.set("result", filters.result);
  if (filters.date) params.set("date", filters.date);

  return params.toString();
}
