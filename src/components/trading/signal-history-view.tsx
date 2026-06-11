import { CalendarDays, Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type SignalHistoryItem = {
  id: string;
  symbol: string;
  direction: "BUY" | "SELL" | "WAIT";
  entry: string | null;
  confidence: number;
  bias: string;
  status: "ACTIVE" | "CLOSED" | "EXPIRED";
  result: "TP1" | "TP2" | "TP3" | "SL" | "BE" | "PENDING";
  points: string | null;
  createdAt: string;
};

function directionVariant(direction: SignalHistoryItem["direction"]) {
  return direction === "BUY"
    ? "success"
    : direction === "SELL"
      ? "danger"
      : "warning";
}

function resultVariant(result: SignalHistoryItem["result"]) {
  if (result === "SL") return "danger";
  if (result === "PENDING") return "warning";
  if (result === "BE") return "outline";
  return "success";
}

function Points({ points }: { points: string | null }) {
  const numericPoints = points ? Number(points) : 0;

  return (
    <span
      className={cn(
        "font-mono font-semibold",
        numericPoints > 0 && "text-emerald-300",
        numericPoints < 0 && "text-red-300",
        numericPoints === 0 && "text-muted-foreground",
      )}
    >
      {points
        ? `${numericPoints > 0 ? "+" : ""}${numericPoints.toFixed(2)}`
        : "--"}
    </span>
  );
}

export function SignalHistoryView({
  signals,
}: {
  signals: SignalHistoryItem[];
}) {
  if (signals.length === 0) {
    return (
      <div className="glass-panel rounded-lg p-8 text-center">
        <Target className="mx-auto size-6 text-primary" aria-hidden="true" />
        <h2 className="mt-3 font-semibold text-foreground">No signals found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Adjust the filters to review another part of the signal history.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="glass-panel hidden overflow-hidden rounded-lg md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="border-b border-white/10 bg-white/[0.03] text-left text-[0.68rem] uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                {[
                  "Date",
                  "Symbol",
                  "Direction",
                  "Entry",
                  "Confidence",
                  "Bias",
                  "Status",
                  "Result",
                  "Points",
                ].map((heading) => (
                  <th key={heading} className="px-4 py-3 font-semibold">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {signals.map((signal) => (
                <tr
                  key={signal.id}
                  className="border-b border-white/10 last:border-0 hover:bg-white/[0.025]"
                >
                  <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                    {signal.createdAt}
                  </td>
                  <td className="px-4 py-4 font-mono font-semibold text-foreground">
                    {signal.symbol}
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={directionVariant(signal.direction)}>
                      {signal.direction}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 font-mono text-foreground">
                    {signal.entry ?? "Market"}
                  </td>
                  <td className="px-4 py-4 font-mono text-primary">
                    {signal.confidence}%
                  </td>
                  <td className="max-w-52 truncate px-4 py-4 text-muted-foreground">
                    {signal.bias}
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={signal.status === "ACTIVE" ? "success" : "outline"}>
                      {signal.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={resultVariant(signal.result)}>
                      {signal.result}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Points points={signal.points} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 md:hidden">
        {signals.map((signal) => (
          <article key={signal.id} className="glass-panel rounded-lg p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-lg font-semibold text-foreground">
                  {signal.symbol}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="size-3.5" aria-hidden="true" />
                  {signal.createdAt}
                </p>
              </div>
              <Badge variant={directionVariant(signal.direction)}>
                {signal.direction}
              </Badge>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {signal.bias}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                ["Entry", signal.entry ?? "Market"],
                ["Confidence", `${signal.confidence}%`],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-white/10 bg-white/[0.03] p-3"
                >
                  <p className="text-[0.68rem] uppercase tracking-[0.12em] text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-1 font-mono text-sm font-semibold text-foreground">
                    {value}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant={signal.status === "ACTIVE" ? "success" : "outline"}>
                  {signal.status}
                </Badge>
                <Badge variant={resultVariant(signal.result)}>
                  {signal.result}
                </Badge>
              </div>
              <Points points={signal.points} />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
