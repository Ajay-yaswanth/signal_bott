import { ArrowDownRight, ArrowUpRight, Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type SignalCardProps = {
  symbol: string;
  side: "BUY" | "SELL";
  entry: string;
  stopLoss: string;
  takeProfit: string;
  confidence: string;
  status: string;
  timeframe?: string;
  thesis?: string;
};

export function SignalCard({
  symbol,
  side,
  entry,
  stopLoss,
  takeProfit,
  confidence,
  status,
  timeframe = "M15-H1",
  thesis = "Institutional liquidity sweep with confirmation on momentum and volume delta.",
}: SignalCardProps) {
  const isBuy = side === "BUY";
  const DirectionIcon = isBuy ? ArrowUpRight : ArrowDownRight;

  return (
    <article className="glass-panel rounded-lg p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-mono text-lg font-semibold text-foreground">{symbol}</p>
            <Badge variant={isBuy ? "success" : "danger"}>{side}</Badge>
          </div>
          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
            {timeframe} / {status}
          </p>
        </div>
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-lg border",
            isBuy
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
              : "border-red-400/30 bg-red-400/10 text-red-300",
          )}
        >
          <DirectionIcon className="size-5" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">{thesis}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {[
          ["Entry", entry],
          ["SL", stopLoss],
          ["TP", takeProfit],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <p className="text-[0.68rem] uppercase tracking-[0.12em] text-muted-foreground">
              {label}
            </p>
            <p className="mt-1 font-mono text-sm text-foreground">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between rounded-lg border border-primary/20 bg-primary/10 px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-secondary-foreground">
          <Shield className="size-4" aria-hidden="true" />
          Risk managed setup
        </div>
        <span className="font-mono text-sm font-semibold text-primary">{confidence}</span>
      </div>
    </article>
  );
}
