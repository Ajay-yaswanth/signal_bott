import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Clock3,
  LockKeyhole,
  Minus,
  ShieldAlert,
  Target,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type LiveSignal = {
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
  updatedAt: string;
};

function DirectionBadge({
  direction,
}: {
  direction: LiveSignal["direction"];
}) {
  return (
    <Badge
      variant={
        direction === "BUY"
          ? "success"
          : direction === "SELL"
            ? "danger"
            : "warning"
      }
      className="px-3 py-1"
    >
      {direction}
    </Badge>
  );
}

function PriceLevel({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string | null;
  emphasis?: "risk" | "target";
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 font-mono text-base font-semibold text-foreground",
          emphasis === "risk" && "text-red-300",
          emphasis === "target" && "text-emerald-300",
        )}
      >
        {value ?? "Market"}
      </p>
    </div>
  );
}

export function LiveSignalPanel({
  signal,
  hasAccess,
}: {
  signal: LiveSignal | null;
  hasAccess: boolean;
}) {
  if (!hasAccess) {
    return (
      <div className="glass-panel relative overflow-hidden rounded-lg p-6">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(214,169,63,0.08),transparent_55%)]" />
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Latest live signal
              </p>
              <h2 className="mt-2 font-mono text-2xl font-semibold text-foreground">
                {signal?.symbol ?? "XAUUSD"}
              </h2>
            </div>
            <Badge variant={signal ? "success" : "outline"}>
              {signal?.status ?? "LOCKED"}
            </Badge>
          </div>

          <div className="my-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {["Direction", "Entry", "Stop loss", "Targets"].map((label) => (
              <div
                key={label}
                className="rounded-lg border border-white/10 bg-black/25 p-3"
              >
                <p className="text-[0.68rem] uppercase tracking-[0.12em] text-muted-foreground">
                  {label}
                </p>
                <div className="mt-3 h-5 w-16 rounded bg-white/10 blur-sm" />
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-primary/25 bg-[#050914]/92 p-5 text-center">
            <LockKeyhole
              className="mx-auto size-6 text-primary"
              aria-hidden="true"
            />
            <h3 className="mt-3 font-semibold text-foreground">
              Upgrade to unlock this XAUUSD setup
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
              Your trial has expired and there is no active subscription.
              Upgrade to reveal direction, entry, stop loss, three profit
              targets, confidence, market bias, and ICT/SMC reasoning.
            </p>
            <Button asChild className="mt-4">
              <Link href="/pricing">View upgrade options</Link>
            </Button>
          </div>

          {signal ? (
            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock3 className="size-4" aria-hidden="true" />
              Last updated {signal.updatedAt}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  if (!signal) {
    return (
      <div className="glass-panel rounded-lg p-6">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/15 text-primary">
            <Target className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              No live XAUUSD signal
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              The desk is waiting for a qualified ICT/SMC setup. A new signal
              will appear here after confirmation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const DirectionIcon =
    signal.direction === "BUY"
      ? ArrowUpRight
      : signal.direction === "SELL"
        ? ArrowDownRight
        : Minus;

  return (
    <article className="glass-panel rounded-lg p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Latest live XAUUSD signal
          </p>
          <div className="mt-2 flex items-center gap-3">
            <h2 className="font-mono text-2xl font-semibold text-foreground sm:text-3xl">
              {signal.symbol}
            </h2>
            <DirectionBadge direction={signal.direction} />
          </div>
          <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock3 className="size-4" aria-hidden="true" />
            Last updated {signal.updatedAt}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            {signal.status === "ACTIVE" ? (
              <>
                <span className="absolute -right-1 -top-1 size-2 rounded-full bg-emerald-400" />
                <span className="absolute -right-1 -top-1 size-2 animate-ping rounded-full bg-emerald-400" />
              </>
            ) : null}
            <Badge variant="success">{signal.status}</Badge>
          </div>
          <div
            className={cn(
              "flex size-11 items-center justify-center rounded-lg border",
              signal.direction === "BUY" &&
                "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
              signal.direction === "SELL" &&
                "border-red-400/30 bg-red-400/10 text-red-300",
              signal.direction === "WAIT" &&
                "border-amber-300/30 bg-amber-300/10 text-amber-200",
            )}
          >
            <DirectionIcon className="size-5" aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 min-[380px]:grid-cols-2 lg:grid-cols-5">
        <PriceLevel label="Entry price" value={signal.entry} />
        <PriceLevel label="Stop loss" value={signal.stopLoss} emphasis="risk" />
        <PriceLevel label="TP1" value={signal.tp1} emphasis="target" />
        <PriceLevel label="TP2" value={signal.tp2} emphasis="target" />
        <PriceLevel label="TP3" value={signal.tp3} emphasis="target" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="rounded-lg border border-primary/20 bg-primary/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Confidence
              </p>
              <p className="mt-2 font-mono text-3xl font-semibold text-primary">
                {signal.confidence}%
              </p>
            </div>
            <ShieldAlert className="size-6 text-primary" aria-hidden="true" />
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/30">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${signal.confidence}%` }}
            />
          </div>
        </div>

        <div className="min-w-0 rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Market bias
          </p>
          <p className="mt-2 break-words font-medium text-foreground">
            {signal.bias}
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            ICT / SMC reasons
          </p>
          <p className="mt-2 break-words text-sm leading-6 text-muted-foreground">
            {signal.reason}
          </p>
        </div>
      </div>
    </article>
  );
}
