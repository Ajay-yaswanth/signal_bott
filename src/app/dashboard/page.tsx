import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/layout/page-header";
import { LiveSignalFeed } from "@/components/trading/live-signal-feed";
import { SubscriptionStatusCard } from "@/components/trading/subscription-status-card";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Dashboard",
  description:
    "Review the latest live XAUUSD signal, trade levels, and subscription access.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function formatPrice(value: { toFixed: (digits: number) => string } | null) {
  return value?.toFixed(2) ?? null;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    redirect("/login");
  }

  const [user, latestSignal] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscriptions: {
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.signal.findFirst({
      where: {
        symbol: "XAUUSD",
        status: "ACTIVE",
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),
  ]);

  if (!user) {
    redirect("/login");
  }

  const now = new Date();
  const latestSubscription = user.subscriptions[0];
  const activeSubscription = user.subscriptions.find(
    (subscription) =>
      subscription.status === "ACTIVE" &&
      (!subscription.currentPeriodEnd || subscription.currentPeriodEnd > now),
  );
  const trialIsActive = Boolean(user.trialEndsAt && user.trialEndsAt > now);
  const hasSignalAccess = trialIsActive || Boolean(activeSubscription);
  const status = activeSubscription
    ? "ACTIVE"
    : trialIsActive
      ? "TRIAL"
      : latestSubscription?.status === "PAST_DUE" ||
          latestSubscription?.status === "CANCELLED"
        ? latestSubscription.status
        : "EXPIRED";
  const periodEnd =
    activeSubscription?.currentPeriodEnd ??
    user.trialEndsAt ??
    latestSubscription?.currentPeriodEnd ??
    now;
  const trialDaysRemaining = user.trialEndsAt
    ? Math.max(
        0,
        Math.ceil(
          (user.trialEndsAt.getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : 0;
  const signal = latestSignal
    ? {
        symbol: latestSignal.symbol,
        id: latestSignal.id,
        direction: latestSignal.direction,
        entry: formatPrice(latestSignal.entry),
        stopLoss: formatPrice(latestSignal.stopLoss),
        tp1: formatPrice(latestSignal.tp1),
        tp2: formatPrice(latestSignal.tp2),
        tp3: formatPrice(latestSignal.tp3),
        confidence: latestSignal.confidence,
        bias: latestSignal.bias,
        reason: latestSignal.reason,
        status: latestSignal.status,
        updatedAt: latestSignal.updatedAt.toISOString(),
      }
    : null;

  return (
    <DashboardShell active="/dashboard">
      <PageHeader
        eyebrow="User dashboard"
        title="Live XAUUSD signal"
        description="Your latest gold setup, trade levels, institutional market bias, and ICT/SMC execution context."
      />

      <SubscriptionStatusCard
        status={status}
        periodEnd={periodEnd.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
        trialDaysRemaining={trialDaysRemaining}
      />

      <LiveSignalFeed
        initialSignal={hasSignalAccess ? signal : null}
        initialHasAccess={hasSignalAccess}
      />
    </DashboardShell>
  );
}
