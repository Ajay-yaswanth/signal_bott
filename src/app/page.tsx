import Link from "next/link";
import {
  ArrowRight,
  CandlestickChart,
  CheckCircle2,
  RadioTower,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import { PerformanceChart } from "@/components/charts/performance-chart";
import { SiteNav } from "@/components/marketing/site-nav";
import { RiskDisclaimer } from "@/components/trading/risk-disclaimer";
import { SignalCard } from "@/components/trading/signal-card";
import { StatCard } from "@/components/trading/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Premium XAUUSD Signal Terminal",
  description:
    "Live gold signal setups, disciplined risk levels, and transparent performance analytics from ULTRON Signals.",
};

const xauusdSignals = [
  {
    symbol: "XAUUSD",
    side: "BUY" as const,
    entry: "2338.40",
    stopLoss: "2327.20",
    takeProfit: "2364.80",
    confidence: "92%",
    status: "Active",
    timeframe: "M15-H1",
    thesis: "Bullish liquidity reclaim after London sweep, with buyers defending VWAP and premium demand.",
  },
  {
    symbol: "XAUUSD",
    side: "SELL" as const,
    entry: "2368.10",
    stopLoss: "2378.60",
    takeProfit: "2346.00",
    confidence: "81%",
    status: "Pending",
    timeframe: "H1-H4",
    thesis: "Rejection plan at upper imbalance if NY session fails to accept above prior-day high.",
  },
];

const features = [
  {
    icon: RadioTower,
    title: "Gold-first signal feed",
    copy: "Publish XAUUSD entries, stops, targets, session bias, and confidence from one terminal.",
  },
  {
    icon: TrendingUp,
    title: "Performance truth",
    copy: "Track win rate, R multiple, drawdown, and equity curve without hiding weak periods.",
  },
  {
    icon: ShieldCheck,
    title: "Risk desk controls",
    copy: "Built-in disclaimer, analyst roles, approvals, and subscription-ready account models.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground terminal-grid">
      <SiteNav />
      <main>
        <section className="border-b border-white/10">
          <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
            <div className="flex flex-col justify-center">
              <Badge variant="secondary" className="mb-4 w-fit">
                Premium XAUUSD Signals
              </Badge>
              <h1 className="max-w-2xl text-4xl font-semibold tracking-normal text-foreground sm:text-6xl">
                ULTRON Signals
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
                A dark, professional gold signal terminal for traders who need clear XAUUSD setups, disciplined risk levels, and performance reporting that feels institutional.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/dashboard">
                    Open terminal
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/signals">View XAUUSD signals</Link>
                </Button>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <StatCard label="XAUUSD Win Rate" value="74.8%" change="+5.2% QoQ" icon={CandlestickChart} />
                <StatCard label="Avg R Multiple" value="2.4R" change="Last 90 days" icon={TrendingUp} tone="green" />
                <StatCard label="Max Drawdown" value="4.1%" change="Risk capped" icon={ShieldCheck} tone="gold" />
              </div>
            </div>

            <div className="grid content-center gap-4">
              <div className="grid min-w-0 gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-4">
                  {xauusdSignals.map((signal) => (
                    <SignalCard key={`${signal.symbol}-${signal.side}`} {...signal} />
                  ))}
                </div>
                <Card className="min-w-0">
                  <CardHeader className="flex-row flex-wrap items-center justify-between">
                    <div>
                      <CardTitle>XAUUSD execution curve</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Gold strategy equity across active sessions
                      </p>
                    </div>
                    <Badge variant="success">Live</Badge>
                  </CardHeader>
                  <CardContent>
                    <PerformanceChart />
                  </CardContent>
                </Card>
              </div>
              <RiskDisclaimer />
            </div>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card key={feature.title}>
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/15 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-muted-foreground">
                  <CheckCircle2 className="mr-2 inline size-4 text-primary" aria-hidden="true" />
                  {feature.copy}
                </CardContent>
              </Card>
            );
          })}
        </section>
      </main>
    </div>
  );
}
