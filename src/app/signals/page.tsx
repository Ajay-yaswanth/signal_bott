import Link from "next/link";
import { Download, Filter, RotateCcw, Search } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/layout/page-header";
import {
  SignalHistoryView,
  type SignalHistoryItem,
} from "@/components/trading/signal-history-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildSignalHistoryWhere,
  parseSignalHistoryFilters,
  signalHistoryQuery,
} from "@/lib/signal-history";

export const metadata = {
  title: "Signal History",
  description:
    "Filter, review, and export the complete ULTRON Signals trade history.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SignalsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    redirect("/login");
  }

  const filters = parseSignalHistoryFilters(await searchParams);
  const signals = await prisma.signal.findMany({
    where: buildSignalHistoryWhere(filters),
    orderBy: { createdAt: "desc" },
  });
  const items: SignalHistoryItem[] = signals.map((signal) => ({
    id: signal.id,
    symbol: signal.symbol,
    direction: signal.direction,
    entry: signal.entry?.toFixed(2) ?? null,
    confidence: signal.confidence,
    bias: signal.bias,
    status: signal.status,
    result: signal.result,
    points: signal.points?.toFixed(2) ?? null,
    createdAt: signal.createdAt.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  }));
  const exportQuery = signalHistoryQuery(filters);

  return (
    <DashboardShell active="/signals">
      <PageHeader
        eyebrow="Signal operations"
        title="Signal history"
        description="Review every seeded and published signal, filter outcomes, inspect points gained or lost, and export the current result set."
        action={
          <Button asChild>
            <a href={`/api/signals/export${exportQuery ? `?${exportQuery}` : ""}`}>
              <Download aria-hidden="true" />
              Export CSV
            </a>
          </Button>
        }
      />

      <form
        method="get"
        className="glass-panel mb-4 grid gap-3 rounded-lg p-4 sm:grid-cols-2 xl:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr_auto]"
      >
        <label className="relative">
          <span className="sr-only">Search symbol</span>
          <Search
            className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            name="search"
            defaultValue={filters.search}
            placeholder="Search symbol"
            className="pl-9"
          />
        </label>
        <label>
          <span className="sr-only">Filter by direction</span>
          <select
            name="direction"
            defaultValue={filters.direction ?? ""}
            className="h-10 w-full rounded-lg border border-white/15 bg-[#080d18] px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All directions</option>
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
            <option value="WAIT">WAIT</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Filter by result</span>
          <select
            name="result"
            defaultValue={filters.result ?? ""}
            className="h-10 w-full rounded-lg border border-white/15 bg-[#080d18] px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All results</option>
            {["TP1", "TP2", "TP3", "SL", "BE", "PENDING"].map((result) => (
              <option key={result} value={result}>
                {result}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Filter by date</span>
          <Input name="date" type="date" defaultValue={filters.date ?? ""} />
        </label>
        <div className="flex gap-2">
          <Button type="submit" className="flex-1 xl:flex-none">
            <Filter aria-hidden="true" />
            Apply
          </Button>
          <Button asChild variant="outline" size="icon" aria-label="Clear filters">
            <Link href="/signals">
              <RotateCcw aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </form>

      <div className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {items.length} signal{items.length === 1 ? "" : "s"} found
      </div>
      <SignalHistoryView signals={items} />
    </DashboardShell>
  );
}
