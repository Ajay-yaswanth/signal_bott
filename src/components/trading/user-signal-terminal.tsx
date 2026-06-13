import Link from "next/link";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Clock3,
  Crosshair,
  LockKeyhole,
  RadioTower,
  ShieldCheck,
  Target,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type UserSignalItem = {
  id: string;
  symbol: string;
  direction: "BUY" | "SELL" | "WAIT";
  signalType: "MANUAL" | "NORMAL" | "SNIPER";
  session: "ASIA" | "LONDON" | "NEW_YORK" | "LATE" | "UNKNOWN";
  entry: string | null;
  stopLoss: string | null;
  tp1: string | null;
  tp2: string | null;
  tp3: string | null;
  confidence: number;
  reason: string;
  status: "ACTIVE" | "CLOSED" | "EXPIRED";
  result: "TP1" | "TP2" | "TP3" | "SL" | "BE" | "PENDING";
  createdAt: string;
};

function directionVariant(direction: UserSignalItem["direction"]) {
  if (direction === "BUY") return "success" as const;
  if (direction === "SELL") return "danger" as const;
  return "warning" as const;
}

function displayStatus(signal: UserSignalItem) {
  if (signal.result === "TP1" || signal.result === "TP2" || signal.result === "TP3") {
    return { label: `${signal.result} HIT`, variant: "success" as const };
  }
  if (signal.result === "SL") {
    return { label: "SL HIT", variant: "danger" as const };
  }
  if (signal.status === "EXPIRED") {
    return { label: "EXPIRED", variant: "outline" as const };
  }
  if (signal.status === "ACTIVE") {
    return { label: "ACTIVE", variant: "success" as const };
  }
  return { label: signal.result === "BE" ? "BREAK EVEN" : "CLOSED", variant: "outline" as const };
}

function PriceLevel({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | null;
  tone?: "risk" | "target";
}) {
  return (
    <div className="rounded-lg border border-white/8 bg-black/15 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 font-mono text-sm font-semibold text-white",
          tone === "risk" && "text-red-300",
          tone === "target" && "text-emerald-300",
        )}
      >
        {value ?? "MARKET"}
      </p>
    </div>
  );
}

function LockedSignalCard({
  signal,
  sniper,
}: {
  signal?: UserSignalItem;
  sniper?: boolean;
}) {
  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-xl border bg-[#070c17]/95 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.32)]",
        sniper ? "border-violet-400/20" : "border-primary/15",
      )}
    >
      <div
        className={cn(
          "absolute inset-0 opacity-50",
          sniper
            ? "bg-[radial-gradient(circle_at_90%_10%,rgba(167,139,250,0.16),transparent_35%)]"
            : "bg-[radial-gradient(circle_at_90%_10%,rgba(214,169,63,0.14),transparent_35%)]",
        )}
      />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {sniper ? "Premium sniper entry" : "Premium normal signal"}
            </p>
            <p className="mt-2 font-mono text-xl font-semibold text-white">
              {signal?.symbol ?? "LIVE SETUP"}
            </p>
          </div>
          <LockKeyhole
            className={cn("size-5", sniper ? "text-violet-300" : "text-primary")}
            aria-hidden="true"
          />
        </div>
        <div className="my-5 grid grid-cols-3 gap-2">
          {["Entry", "Stop loss", "Targets"].map((label) => (
            <div key={label} className="rounded-lg border border-white/8 bg-black/20 p-3">
              <p className="text-[9px] uppercase tracking-[0.14em] text-slate-500">
                {label}
              </p>
              <div className="mt-3 h-4 rounded bg-white/10 blur-[3px]" />
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-white/10 bg-black/25 p-4 text-center">
          <p className="text-sm font-semibold text-white">Signal details locked</p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Activate premium access to reveal direction, execution levels,
            confidence, and strategy reasoning.
          </p>
          <Button asChild size="sm" className="mt-4">
            <Link href="/pricing">Unlock premium signals</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

function SignalCard({
  signal,
  sniper,
}: {
  signal: UserSignalItem;
  sniper?: boolean;
}) {
  const status = displayStatus(signal);
  const DirectionIcon = signal.direction === "SELL" ? ArrowDownRight : ArrowUpRight;

  return (
    <article
      className={cn(
        "overflow-hidden rounded-xl border bg-[#070c17]/95 shadow-[0_24px_70px_rgba(0,0,0,0.32)]",
        sniper ? "border-violet-400/20" : "border-primary/15",
      )}
    >
      <div
        className={cn(
          "border-b border-white/8 px-5 py-4",
          sniper
            ? "bg-violet-400/[0.045]"
            : "bg-primary/[0.035]",
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-xl font-semibold text-white">{signal.symbol}</p>
              <Badge variant={directionVariant(signal.direction)}>{signal.direction}</Badge>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <p className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-slate-500">
              <Clock3 className="size-3" aria-hidden="true" />
              {signal.createdAt} · {signal.session.replace("_", " ")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p
                className={cn(
                  "font-mono text-2xl font-semibold",
                  sniper ? "text-violet-300" : "text-primary",
                )}
              >
                {signal.confidence}%
              </p>
              <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">
                confidence
              </p>
            </div>
            <span
              className={cn(
                "flex size-10 items-center justify-center rounded-lg border",
                signal.direction === "SELL"
                  ? "border-red-400/20 bg-red-400/10 text-red-300"
                  : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
              )}
            >
              <DirectionIcon className="size-5" aria-hidden="true" />
            </span>
          </div>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div
            className={cn(
              "h-full rounded-full",
              sniper ? "bg-violet-400" : "bg-primary",
            )}
            style={{ width: `${signal.confidence}%` }}
          />
        </div>
      </div>

      <div className="p-5">
        <div className="grid gap-2 sm:grid-cols-5">
          <PriceLevel label="Entry" value={signal.entry} />
          <PriceLevel label="Stop loss" value={signal.stopLoss} tone="risk" />
          <PriceLevel label="TP1" value={signal.tp1} tone="target" />
          <PriceLevel label="TP2" value={signal.tp2} tone="target" />
          <PriceLevel label="TP3" value={signal.tp3} tone="target" />
        </div>
        <div className="mt-4 rounded-lg border border-white/8 bg-white/[0.025] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            Signal reason
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-300">{signal.reason}</p>
        </div>
      </div>
    </article>
  );
}

function SignalSection({
  title,
  description,
  signals,
  hasAccess,
  sniper,
}: {
  title: string;
  description: string;
  signals: UserSignalItem[];
  hasAccess: boolean;
  sniper?: boolean;
}) {
  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            {sniper ? (
              <Crosshair className="size-4 text-violet-300" aria-hidden="true" />
            ) : (
              <RadioTower className="size-4 text-emerald-300" aria-hidden="true" />
            )}
            <h2 className="text-lg font-semibold text-white">{title}</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
        <Badge variant={sniper ? "secondary" : "success"}>
          {signals.length} {signals.length === 1 ? "signal" : "signals"}
        </Badge>
      </div>
      <div className="grid gap-4">
        {hasAccess ? (
          signals.length > 0 ? (
            signals.map((signal) => (
              <SignalCard key={signal.id} signal={signal} sniper={sniper} />
            ))
          ) : (
            <Card className={cn(sniper && "border-violet-400/15")}>
              <CardContent className="flex min-h-40 items-center justify-center p-8 text-center">
                <div>
                  <Target className="mx-auto size-5 text-primary" aria-hidden="true" />
                  <p className="mt-3 text-sm font-semibold text-white">
                    No active {sniper ? "sniper entries" : "normal signals"}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    The strategy engine is waiting for a qualified setup.
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        ) : (
          <>
            <LockedSignalCard signal={signals[0]} sniper={sniper} />
            {signals.length > 1 ? <LockedSignalCard signal={signals[1]} sniper={sniper} /> : null}
          </>
        )}
      </div>
    </section>
  );
}

export function UserSignalTerminal({
  hasAccess,
  normalSignals,
  sniperSignals,
  recentSignals,
}: {
  hasAccess: boolean;
  normalSignals: UserSignalItem[];
  sniperSignals: UserSignalItem[];
  recentSignals: UserSignalItem[];
}) {
  return (
    <div className="space-y-7">
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.045] p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Normal signals
            </p>
            <Activity className="size-4 text-emerald-300" aria-hidden="true" />
          </div>
          <p className="mt-3 font-mono text-2xl font-semibold text-white">
            {normalSignals.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Currently active</p>
        </div>
        <div className="rounded-xl border border-violet-400/15 bg-violet-400/[0.045] p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Sniper entries
            </p>
            <Crosshair className="size-4 text-violet-300" aria-hidden="true" />
          </div>
          <p className="mt-3 font-mono text-2xl font-semibold text-white">
            {sniperSignals.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">90%+ confidence</p>
        </div>
        <div className="rounded-xl border border-primary/15 bg-primary/[0.045] p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Premium access
            </p>
            {hasAccess ? (
              <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
            ) : (
              <LockKeyhole className="size-4 text-primary" aria-hidden="true" />
            )}
          </div>
          <p className="mt-3 font-mono text-lg font-semibold text-white">
            {hasAccess ? "UNLOCKED" : "LOCKED"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {hasAccess ? "Full execution details" : "Upgrade required"}
          </p>
        </div>
      </section>

      <SignalSection
        title="Live normal signals"
        description="Qualified setups scoring 75% or above"
        signals={normalSignals}
        hasAccess={hasAccess}
      />
      <SignalSection
        title="Sniper entries"
        description="Highest-conviction setups scoring 90% or above"
        signals={sniperSignals}
        hasAccess={hasAccess}
        sniper
      />

      {hasAccess && recentSignals.length > 0 ? (
        <Card className="border-primary/15 bg-[#070c17]/90">
          <CardHeader>
            <CardTitle>Recent signal status</CardTitle>
            <p className="text-xs text-muted-foreground">
              Latest completed, stopped, and expired setups
            </p>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {recentSignals.map((signal) => {
              const status = displayStatus(signal);
              return (
                <div key={signal.id} className="rounded-lg border border-white/8 bg-white/[0.025] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-semibold text-white">{signal.symbol}</p>
                      <Badge variant={directionVariant(signal.direction)}>
                        {signal.direction}
                      </Badge>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>{signal.signalType}</span>
                    <span>{signal.createdAt}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
