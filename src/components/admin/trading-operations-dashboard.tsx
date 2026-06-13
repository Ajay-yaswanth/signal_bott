import {
  Activity,
  Bot,
  Crosshair,
  RadioTower,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SignalItem = {
  id: string;
  symbol: string;
  direction: "BUY" | "SELL" | "WAIT";
  signalType: "MANUAL" | "NORMAL" | "SNIPER";
  session: "ASIA" | "LONDON" | "NEW_YORK" | "LATE" | "UNKNOWN";
  status: "ACTIVE" | "CLOSED" | "EXPIRED";
  result: "TP1" | "TP2" | "TP3" | "SL" | "BE" | "PENDING";
  confidence: number;
  entry: string | null;
  bias: string;
  createdAt: string;
  score: {
    trend: number;
    liquiditySweep: number;
    fvg: number;
    orderBlock: number;
    rsi: number;
    adx: number;
    atr: number;
    session: number;
    newsRisk: number;
  } | null;
};

type DashboardMetrics = {
  liveSignals: number;
  sniperEntries: number;
  winRate: number;
  dailySignals: number;
  activeUsers: number;
  currentSession: string;
  statusCounts: {
    active: number;
    closed: number;
    expired: number;
  };
};

const scoreLabels = {
  trend: "Trend strength",
  liquiditySweep: "Liquidity sweep",
  fvg: "FVG quality",
  orderBlock: "Order block",
  rsi: "RSI condition",
  adx: "ADX strength",
  atr: "ATR volatility",
  session: "Session quality",
  newsRisk: "News safety",
};

function directionVariant(direction: SignalItem["direction"]) {
  if (direction === "BUY") return "success" as const;
  if (direction === "SELL") return "danger" as const;
  return "warning" as const;
}

function MetricCard({
  label,
  value,
  note,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  icon: typeof Activity;
  tone: "gold" | "green" | "blue" | "violet";
}) {
  const tones = {
    gold: "border-primary/25 bg-primary/[0.08] text-primary",
    green: "border-emerald-400/25 bg-emerald-400/[0.07] text-emerald-300",
    blue: "border-sky-400/25 bg-sky-400/[0.07] text-sky-300",
    violet: "border-violet-400/25 bg-violet-400/[0.07] text-violet-300",
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#070c17]/90 p-5 shadow-[0_22px_60px_rgba(0,0,0,0.32)]">
      <div
        className={cn(
          "absolute -right-8 -top-8 size-28 rounded-full blur-3xl",
          tone === "gold" && "bg-primary/15",
          tone === "green" && "bg-emerald-400/15",
          tone === "blue" && "bg-sky-400/15",
          tone === "violet" && "bg-violet-400/15",
        )}
      />
      <div className="relative flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          {label}
        </p>
        <span className={cn("rounded-lg border p-2", tones[tone])}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <p className="relative mt-5 font-mono text-3xl font-semibold tracking-tight text-white">
        {value}
      </p>
      <p className="relative mt-2 text-xs text-slate-400">{note}</p>
    </div>
  );
}

function ScoreBreakdown({ signal }: { signal?: SignalItem }) {
  if (!signal?.score) {
    return (
      <Card className="border-primary/15 bg-[#070c17]/90">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="size-4 text-primary" aria-hidden="true" />
            AI score breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-64 items-center justify-center rounded-lg border border-dashed border-white/10 bg-black/10 p-8 text-center text-sm text-muted-foreground">
            The next automated signal will populate the nine-factor strategy
            score.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/15 bg-[#070c17]/90">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Bot className="size-4 text-primary" aria-hidden="true" />
            AI score breakdown
          </CardTitle>
          <p className="mt-2 text-xs text-muted-foreground">
            Latest scored setup · {signal.symbol} · {signal.direction}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl font-semibold text-primary">
            {signal.confidence}%
          </p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            confidence
          </p>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {Object.entries(signal.score).map(([key, value]) => (
          <div key={key} className="rounded-lg border border-white/8 bg-white/[0.025] p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-300">
                {scoreLabels[key as keyof typeof scoreLabels]}
              </span>
              <span className="font-mono text-xs font-semibold text-white">
                {value}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
              <div
                className={cn(
                  "h-full rounded-full",
                  value >= 90
                    ? "bg-emerald-400"
                    : value >= 75
                      ? "bg-primary"
                      : value >= 50
                        ? "bg-sky-400"
                        : "bg-red-400",
                )}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function StatusPanel({
  metrics,
}: {
  metrics: DashboardMetrics;
}) {
  const total =
    metrics.statusCounts.active +
    metrics.statusCounts.closed +
    metrics.statusCounts.expired;
  const statuses = [
    {
      label: "Active",
      value: metrics.statusCounts.active,
      color: "bg-emerald-400",
      text: "text-emerald-300",
    },
    {
      label: "Closed",
      value: metrics.statusCounts.closed,
      color: "bg-primary",
      text: "text-primary",
    },
    {
      label: "Expired",
      value: metrics.statusCounts.expired,
      color: "bg-slate-500",
      text: "text-slate-400",
    },
  ];

  return (
    <Card className="border-primary/15 bg-[#070c17]/90">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="size-4 text-primary" aria-hidden="true" />
          Strategy operations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-primary/15 bg-primary/[0.05] p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Market session
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {metrics.currentSession}
              </p>
            </div>
            <span className="relative flex size-3">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex size-3 rounded-full bg-emerald-400" />
            </span>
          </div>
        </div>
        <div className="mt-5 space-y-4">
          {statuses.map((status) => (
            <div key={status.label}>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-slate-400">{status.label}</span>
                <span className={cn("font-mono font-semibold", status.text)}>
                  {status.value}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className={cn("h-full rounded-full", status.color)}
                  style={{
                    width: `${total === 0 ? 0 : (status.value / total) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-white/8 bg-white/[0.025] p-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Engine
            </p>
            <p className="mt-2 text-xs font-semibold text-emerald-300">
              AI SCORING ONLINE
            </p>
          </div>
          <div className="rounded-lg border border-white/8 bg-white/[0.025] p-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Risk gate
            </p>
            <p className="mt-2 text-xs font-semibold text-primary">
              75 / 90 POLICY
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LiveSignalTape({ signals }: { signals: SignalItem[] }) {
  return (
    <Card className="overflow-hidden border-primary/15 bg-[#070c17]/90">
      <CardHeader className="flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <RadioTower className="size-4 text-emerald-300" aria-hidden="true" />
            Live signal tape
          </CardTitle>
          <p className="mt-2 text-xs text-muted-foreground">
            Latest strategy and manual desk executions
          </p>
        </div>
        <Badge variant="success">Live</Badge>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-y border-white/8 bg-black/15 text-[10px] uppercase tracking-[0.16em] text-slate-500">
              <tr>
                {["Instrument", "Type", "Entry", "Confidence", "Session", "Status"].map(
                  (heading) => (
                    <th key={heading} className="px-5 py-3 font-semibold">
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {signals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center text-muted-foreground">
                    No live signals are active.
                  </td>
                </tr>
              ) : (
                signals.map((signal) => (
                  <tr
                    key={signal.id}
                    className="border-b border-white/7 transition-colors last:border-0 hover:bg-white/[0.025]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            signal.status === "ACTIVE"
                              ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                              : "bg-slate-500",
                          )}
                        />
                        <div>
                          <p className="font-mono font-semibold text-white">
                            {signal.symbol}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-500">
                            {signal.createdAt}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={directionVariant(signal.direction)}>
                          {signal.direction}
                        </Badge>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {signal.signalType}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-200">
                      {signal.entry ?? "MARKET"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "font-mono font-semibold",
                          signal.confidence >= 90
                            ? "text-violet-300"
                            : signal.confidence >= 75
                              ? "text-primary"
                              : "text-slate-400",
                        )}
                      >
                        {signal.confidence}%
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-300">
                      {signal.session.replace("_", " ")}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={signal.status === "ACTIVE" ? "success" : "outline"}>
                        {signal.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function SniperFeed({ signals }: { signals: SignalItem[] }) {
  return (
    <Card className="border-violet-400/20 bg-[linear-gradient(145deg,rgba(15,10,30,0.95),rgba(5,9,20,0.95))]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crosshair className="size-4 text-violet-300" aria-hidden="true" />
          Sniper entries
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          High-conviction setups scoring 90% or above
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {signals.length === 0 ? (
          <div className="flex min-h-44 items-center justify-center rounded-lg border border-dashed border-violet-400/15 bg-violet-400/[0.03] p-6 text-center text-sm text-muted-foreground">
            No sniper setup is currently active.
          </div>
        ) : (
          signals.slice(0, 4).map((signal) => (
            <div
              key={signal.id}
              className="rounded-lg border border-violet-400/15 bg-violet-400/[0.045] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-mono font-semibold text-white">{signal.symbol}</p>
                    <Badge variant={directionVariant(signal.direction)}>
                      {signal.direction}
                    </Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">
                    {signal.bias}
                  </p>
                </div>
                <p className="font-mono text-lg font-semibold text-violet-300">
                  {signal.confidence}%
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-white/7 pt-3 text-[10px] uppercase tracking-[0.14em] text-slate-500">
                <span>{signal.session.replace("_", " ")}</span>
                <span>{signal.createdAt}</span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function TradingOperationsDashboard({
  metrics,
  signals,
}: {
  metrics: DashboardMetrics;
  signals: SignalItem[];
}) {
  const liveSignals = signals.filter((signal) => signal.status === "ACTIVE");
  const sniperSignals = liveSignals.filter(
    (signal) => signal.signalType === "SNIPER" || signal.confidence >= 90,
  );
  const latestScoredSignal = signals.find((signal) => signal.score);

  return (
    <div className="space-y-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Live signals"
          value={metrics.liveSignals.toLocaleString()}
          note="Currently actionable"
          icon={RadioTower}
          tone="green"
        />
        <MetricCard
          label="Sniper entries"
          value={metrics.sniperEntries.toLocaleString()}
          note="90%+ confidence"
          icon={Crosshair}
          tone="violet"
        />
        <MetricCard
          label="Win rate"
          value={`${metrics.winRate}%`}
          note="Resolved wins vs losses"
          icon={TrendingUp}
          tone="gold"
        />
        <MetricCard
          label="Signals today"
          value={metrics.dailySignals.toLocaleString()}
          note="UTC desk session"
          icon={Target}
          tone="blue"
        />
        <MetricCard
          label="Active users"
          value={metrics.activeUsers.toLocaleString()}
          note="Paid or trial access"
          icon={Users}
          tone="gold"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <LiveSignalTape signals={liveSignals.length > 0 ? liveSignals : signals.slice(0, 8)} />
        <SniperFeed signals={sniperSignals} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <ScoreBreakdown signal={latestScoredSignal} />
        <StatusPanel metrics={metrics} />
      </section>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/15 bg-primary/[0.04] px-4 py-3 text-xs text-muted-foreground">
        <Sparkles className="size-4 text-primary" aria-hidden="true" />
        <span>AI strategy scoring is active.</span>
        <span className="hidden text-white/20 sm:inline">|</span>
        <span>Normal threshold 75%</span>
        <span className="hidden text-white/20 sm:inline">|</span>
        <span>Sniper threshold 90%</span>
        <ShieldCheck className="ml-auto size-4 text-emerald-300" aria-hidden="true" />
      </div>
    </div>
  );
}
