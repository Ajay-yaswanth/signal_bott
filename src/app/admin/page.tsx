import { CreditCard, ShieldCheck, Users } from "lucide-react";
import { redirect } from "next/navigation";

import { AdminSignalManager } from "@/components/admin/admin-signal-manager";
import { TradingOperationsDashboard } from "@/components/admin/trading-operations-dashboard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Strategy Command Center",
  description: "Professional signal operations and AI strategy monitoring.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function utcDayStart() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

function currentMarketSession(at = new Date()) {
  const hour = at.getUTCHours();
  if (hour >= 12 && hour < 17) return "NEW YORK";
  if (hour >= 7 && hour < 12) return "LONDON";
  if (hour >= 17 && hour < 21) return "LATE SESSION";
  return "ASIA";
}

function formatTime(value: Date) {
  return value.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

export default async function AdminPage() {
  const admin = await getAdminUser();
  if (!admin) redirect("/dashboard");

  const now = new Date();
  const dayStart = utcDayStart();
  const [
    signals,
    liveSignals,
    sniperEntries,
    dailySignals,
    activeUsers,
    resultGroups,
    statusGroups,
    users,
    activeTrials,
    billingSubscriptions,
    failedPayments,
  ] = await Promise.all([
    prisma.signal.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.signal.count({ where: { status: "ACTIVE" } }),
    prisma.signal.count({
      where: { status: "ACTIVE", confidence: { gte: 90 } },
    }),
    prisma.signal.count({ where: { createdAt: { gte: dayStart } } }),
    prisma.user.count({
      where: {
        OR: [
          { trialEndsAt: { gt: now } },
          { subscriptions: { some: { status: "ACTIVE" } } },
        ],
      },
    }),
    prisma.signal.groupBy({
      by: ["result"],
      _count: { _all: true },
    }),
    prisma.signal.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        subscriptions: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    }),
    prisma.user.findMany({
      where: { trialEndsAt: { gt: now } },
      orderBy: { trialEndsAt: "asc" },
    }),
    prisma.subscription.findMany({
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.payment.findMany({
      where: { status: { in: ["failed", "created"] } },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  const resultCount = Object.fromEntries(
    resultGroups.map((group) => [group.result, group._count._all]),
  );
  const statusCount = Object.fromEntries(
    statusGroups.map((group) => [group.status, group._count._all]),
  );
  const wins =
    (resultCount.TP1 ?? 0) + (resultCount.TP2 ?? 0) + (resultCount.TP3 ?? 0);
  const losses = resultCount.SL ?? 0;
  const winRate =
    wins + losses === 0 ? 0 : Math.round((wins / (wins + losses)) * 100);

  const tradingSignals = signals.map((signal) => ({
    id: signal.id,
    symbol: signal.symbol,
    direction: signal.direction,
    signalType: "MANUAL" as const,
    session: "UNKNOWN" as const,
    status: signal.status,
    result: signal.result,
    confidence: signal.confidence,
    entry: signal.entry?.toFixed(2) ?? null,
    bias: signal.bias,
    createdAt: formatTime(signal.createdAt),
    score: null,
  }));

  const managedSignals = signals.slice(0, 20).map((signal) => ({
    id: signal.id,
    symbol: signal.symbol,
    direction: signal.direction,
    entry: signal.entry?.toFixed(2) ?? null,
    stopLoss: signal.stopLoss?.toFixed(2) ?? null,
    tp1: signal.tp1?.toFixed(2) ?? null,
    tp2: signal.tp2?.toFixed(2) ?? null,
    tp3: signal.tp3?.toFixed(2) ?? null,
    confidence: signal.confidence,
    bias: signal.bias,
    reason: signal.reason,
    status: signal.status,
    result: signal.result,
    points: signal.points?.toFixed(2) ?? null,
    updatedAt: formatTime(signal.updatedAt),
  }));

  return (
    <DashboardShell active="/admin">
      <header className="mb-6 overflow-hidden rounded-2xl border border-primary/20 bg-[linear-gradient(135deg,rgba(16,20,32,0.98),rgba(4,8,18,0.96))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.38)]">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                <ShieldCheck className="mr-1 size-3" aria-hidden="true" />
                ADMIN COMMAND
              </Badge>
              <Badge variant="success">ENGINE ONLINE</Badge>
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Strategy command center
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Monitor live execution, sniper-grade opportunities, signal
              outcomes, market sessions, and AI strategy confidence from one
              professional desk.
            </p>
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/[0.06] px-5 py-4 lg:text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Desk operator
            </p>
            <p className="mt-2 font-semibold text-white">{admin.name}</p>
            <p className="mt-1 text-xs text-primary">{admin.email}</p>
          </div>
        </div>
      </header>

      <Tabs defaultValue="command">
        <TabsList className="max-w-full overflow-x-auto border-primary/15 bg-[#070c17]/90">
          <TabsTrigger value="command">Command center</TabsTrigger>
          <TabsTrigger value="signals">Signal operations</TabsTrigger>
          <TabsTrigger value="billing">Billing operations</TabsTrigger>
          <TabsTrigger value="users">User access</TabsTrigger>
        </TabsList>

        <TabsContent value="command">
          <TradingOperationsDashboard
            metrics={{
              liveSignals,
              sniperEntries,
              winRate,
              dailySignals,
              activeUsers,
              currentSession: currentMarketSession(now),
              statusCounts: {
                active: statusCount.ACTIVE ?? 0,
                closed: statusCount.CLOSED ?? 0,
                expired: statusCount.EXPIRED ?? 0,
              },
            }}
            signals={tradingSignals}
          />
        </TabsContent>

        <TabsContent value="signals">
          <AdminSignalManager signals={managedSignals} />
        </TabsContent>

        <TabsContent value="billing">
          <div className="grid gap-5 xl:grid-cols-3">
            <Card className="border-primary/15 bg-[#070c17]/90">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="size-4 text-primary" aria-hidden="true" />
                  Active paid trials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeTrials.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No active paid trials.</p>
                ) : (
                  activeTrials.map((trial) => (
                    <div key={trial.id} className="rounded-lg border border-white/8 bg-white/[0.025] p-3">
                      <p className="font-semibold text-white">{trial.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{trial.email}</p>
                      <p className="mt-2 text-xs text-primary">
                        Trial access · ends{" "}
                        {trial.trialEndsAt ? formatTime(trial.trialEndsAt) : "--"}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-primary/15 bg-[#070c17]/90">
              <CardHeader>
                <CardTitle>Subscriptions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {billingSubscriptions.slice(0, 12).map((subscription) => (
                  <div key={subscription.id} className="rounded-lg border border-white/8 bg-white/[0.025] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{subscription.user.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Subscription access
                        </p>
                      </div>
                      <Badge
                        variant={
                          subscription.status === "ACTIVE"
                            ? "success"
                            : subscription.status === "PAST_DUE"
                              ? "danger"
                              : subscription.status === "CANCELLED"
                                ? "warning"
                                : "outline"
                        }
                      >
                        {subscription.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-primary/15 bg-[#070c17]/90">
              <CardHeader>
                <CardTitle>Failed payments and cancellations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {failedPayments.map((payment) => (
                  <div key={payment.id} className="rounded-lg border border-red-400/15 bg-red-400/[0.035] p-3">
                    <p className="font-semibold text-white">{payment.user.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatCurrency(payment.amount)} · {payment.status}
                    </p>
                  </div>
                ))}
                {billingSubscriptions
                  .filter((subscription) => subscription.status === "CANCELLED")
                  .slice(0, 12)
                  .map((subscription) => (
                    <div key={subscription.id} className="rounded-lg border border-amber-300/15 bg-amber-300/[0.035] p-3">
                      <p className="font-semibold text-white">{subscription.user.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Cancelled subscription
                      </p>
                    </div>
                  ))}
                {failedPayments.length === 0 &&
                !billingSubscriptions.some(
                  (subscription) => subscription.status === "CANCELLED",
                ) ? (
                  <p className="text-sm text-muted-foreground">
                    No failed payments or cancelled users.
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card className="border-primary/15 bg-[#070c17]/90">
            <CardHeader className="flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-4 text-primary" aria-hidden="true" />
                  User access
                </CardTitle>
                <p className="mt-2 text-xs text-muted-foreground">
                  Latest platform members and access state
                </p>
              </div>
              <Badge variant="secondary">{users.length} shown</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="border-y border-white/8 bg-black/15 text-[10px] uppercase tracking-[0.16em] text-slate-500">
                    <tr>
                      {["User", "Role", "Access", "Trial ends", "Joined"].map(
                        (heading) => (
                          <th key={heading} className="px-5 py-3 font-semibold">
                            {heading}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      const subscription = user.subscriptions[0];
                      const hasTrial = Boolean(
                        user.trialEndsAt && user.trialEndsAt > now,
                      );
                      const hasAccess =
                        subscription?.status === "ACTIVE" || hasTrial;

                      return (
                        <tr
                          key={user.id}
                          className="border-b border-white/7 last:border-0"
                        >
                          <td className="px-5 py-4">
                            <p className="font-semibold text-white">{user.name}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {user.email}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <Badge variant={user.role === "ADMIN" ? "secondary" : "outline"}>
                              {user.role}
                            </Badge>
                          </td>
                          <td className="px-5 py-4">
                            <Badge variant={hasAccess ? "success" : "danger"}>
                              {hasAccess ? "ACTIVE" : "INACTIVE"}
                            </Badge>
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-400">
                            {user.trialEndsAt
                              ? formatTime(user.trialEndsAt)
                              : "--"}
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-400">
                            {formatTime(user.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
