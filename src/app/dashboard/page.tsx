import { ShieldCheck } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SubscriptionStatusCard } from "@/components/trading/subscription-status-card";
import {
  UserSignalTerminal,
  type UserSignalItem,
} from "@/components/trading/user-signal-terminal";
import { Badge } from "@/components/ui/badge";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasActiveSignalAccess } from "@/lib/signal-access";

export const metadata = {
  title: "Live Signal Terminal",
  description:
    "Review live normal signals, sniper entries, execution levels, and strategy confidence.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function formatSignal(signal: {
  id: string;
  symbol: string;
  direction: UserSignalItem["direction"];
  entry: { toFixed: (digits: number) => string } | null;
  stopLoss: { toFixed: (digits: number) => string } | null;
  tp1: { toFixed: (digits: number) => string } | null;
  tp2: { toFixed: (digits: number) => string } | null;
  tp3: { toFixed: (digits: number) => string } | null;
  confidence: number;
  reason: string;
  status: UserSignalItem["status"];
  result: UserSignalItem["result"];
  createdAt: Date;
}): UserSignalItem {
  return {
    id: signal.id,
    symbol: signal.symbol,
    direction: signal.direction,
    signalType: "MANUAL",
    session: "UNKNOWN",
    entry: signal.entry?.toFixed(2) ?? null,
    stopLoss: signal.stopLoss?.toFixed(2) ?? null,
    tp1: signal.tp1?.toFixed(2) ?? null,
    tp2: signal.tp2?.toFixed(2) ?? null,
    tp3: signal.tp3?.toFixed(2) ?? null,
    confidence: signal.confidence,
    reason: signal.reason,
    status: signal.status,
    result: signal.result,
    createdAt: signal.createdAt.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) redirect("/login");

  const [user, activeSignals, recentSignals] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscriptions: {
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.signal.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ confidence: "desc" }, { createdAt: "desc" }],
      take: 12,
    }),
    prisma.signal.findMany({
      where: {
        OR: [
          { status: { in: ["CLOSED", "EXPIRED"] } },
          { result: { in: ["TP1", "TP2", "TP3", "SL", "BE"] } },
        ],
      },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
  ]);

  if (!user) redirect("/login");

  const now = new Date();
  const latestSubscription = user.subscriptions[0];
  const activeSubscription = user.subscriptions.find(
    (subscription) =>
      subscription.status === "ACTIVE" &&
      (!subscription.currentPeriodEnd || subscription.currentPeriodEnd > now),
  );
  const paidTrialIsActive = Boolean(user.trialEndsAt && user.trialEndsAt > now);
  const hasSignalAccess = hasActiveSignalAccess(user, now);
  const status = activeSubscription
    ? "ACTIVE"
    : paidTrialIsActive
      ? "TRIAL"
      : latestSubscription?.status ?? "EXPIRED";
  const periodEnd =
    activeSubscription?.currentPeriodEnd ??
    user.trialEndsAt ??
    latestSubscription?.currentPeriodEnd ??
    now;
  const formattedActiveSignals = activeSignals.map(formatSignal);
  const normalSignals = formattedActiveSignals.filter(
    (signal) => signal.signalType !== "SNIPER" && signal.confidence < 90,
  );
  const sniperSignals = formattedActiveSignals.filter(
    (signal) => signal.signalType === "SNIPER" || signal.confidence >= 90,
  );

  // Locked accounts only receive display metadata. Premium trade details never
  // enter their rendered server-component payload.
  const lockedView = (signal: UserSignalItem): UserSignalItem => ({
    ...signal,
    direction: "WAIT",
    entry: null,
    stopLoss: null,
    tp1: null,
    tp2: null,
    tp3: null,
    confidence: 0,
    reason: "",
  });

  return (
    <DashboardShell active="/dashboard">
      <header className="mb-5 overflow-hidden rounded-2xl border border-primary/20 bg-[linear-gradient(135deg,rgba(16,20,32,0.98),rgba(4,8,18,0.96))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.38)]">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="success">LIVE STRATEGY FEED</Badge>
              <Badge variant={hasSignalAccess ? "secondary" : "outline"}>
                <ShieldCheck className="mr-1 size-3" aria-hidden="true" />
                {hasSignalAccess ? "PREMIUM ACCESS" : "PREMIUM LOCKED"}
              </Badge>
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Your signal terminal
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Track live normal setups, sniper entries, execution levels,
              confidence, reasoning, and outcome status from one trading desk.
            </p>
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/[0.06] px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Signed in as
            </p>
            <p className="mt-2 font-semibold text-white">{user.name}</p>
            <p className="mt-1 text-xs text-primary">{status} ACCESS</p>
          </div>
        </div>
      </header>

      <SubscriptionStatusCard
        status={status}
        periodEnd={periodEnd.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
        planName="No active plan"
        paidTrialActive={paidTrialIsActive}
        cancelAtPeriodEnd={false}
        canCancel={Boolean(
          latestSubscription?.razorpaySubscriptionId &&
            ["ACTIVE", "PAST_DUE", "TRIAL"].includes(latestSubscription.status),
        )}
      />

      <UserSignalTerminal
        hasAccess={hasSignalAccess}
        normalSignals={
          hasSignalAccess ? normalSignals : normalSignals.slice(0, 2).map(lockedView)
        }
        sniperSignals={
          hasSignalAccess ? sniperSignals : sniperSignals.slice(0, 2).map(lockedView)
        }
        recentSignals={hasSignalAccess ? recentSignals.map(formatSignal) : []}
      />
    </DashboardShell>
  );
}
