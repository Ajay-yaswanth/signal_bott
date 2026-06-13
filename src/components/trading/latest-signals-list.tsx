import { Clock3, RadioTower } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export type LatestSignalItem = {
  id: string;
  symbol: string;
  direction: "BUY" | "SELL" | "WAIT";
  entry: string | null;
  stopLoss: string | null;
  tp1: string | null;
  tp2: string | null;
  tp3: string | null;
  confidence: number;
  bias: string;
  reason: string;
  status: "ACTIVE" | "CLOSED" | "EXPIRED";
  createdAt: string;
};

function directionVariant(direction: LatestSignalItem["direction"]) {
  return direction === "BUY"
    ? "success"
    : direction === "SELL"
      ? "danger"
      : "warning";
}

export function LatestSignalsList({
  signals,
}: {
  signals: LatestSignalItem[];
}) {
  if (signals.length === 0) {
    return (
      <EmptyState
        icon={RadioTower}
        title="No published signals yet"
        description="The latest signals will appear here after an admin publishes the first setup."
      />
    );
  }

  return (
    <section className="mb-6">
      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          Latest signals
        </p>
        <h2 className="mt-1 text-xl font-semibold text-foreground">
          Newest published setups
        </h2>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {signals.map((signal) => (
          <article key={signal.id} className="glass-panel rounded-lg p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-mono text-lg font-semibold text-foreground">
                    {signal.symbol}
                  </h3>
                  <Badge variant={directionVariant(signal.direction)}>
                    {signal.direction}
                  </Badge>
                  <Badge variant={signal.status === "ACTIVE" ? "success" : "outline"}>
                    {signal.status}
                  </Badge>
                </div>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {signal.bias}
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                <Clock3 className="size-3.5" aria-hidden="true" />
                {signal.createdAt}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                ["Entry", signal.entry ?? "Market"],
                ["Stop loss", signal.stopLoss ?? "--"],
                ["Confidence", `${signal.confidence}%`],
                ["TP1", signal.tp1 ?? "--"],
                ["TP2", signal.tp2 ?? "--"],
                ["TP3", signal.tp3 ?? "--"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-white/10 bg-white/[0.03] p-3"
                >
                  <p className="text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-1 truncate font-mono text-sm font-semibold text-foreground">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">
              {signal.reason}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
