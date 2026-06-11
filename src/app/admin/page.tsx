import { CreditCard, IndianRupee, ShieldCheck, Users } from "lucide-react";
import { redirect } from "next/navigation";

import { AdminSignalManager } from "@/components/admin/admin-signal-manager";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/trading/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Admin",
  description:
    "Manage ULTRON Signals users, subscriptions, payments, and live signals.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount / 100);
}

function formatDate(value: Date | null) {
  return value
    ? value.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "--";
}

export default async function AdminPage() {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/dashboard");
  }

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    signals,
    users,
    subscriptions,
    payments,
    totalRevenue,
    monthlyRevenue,
    activeSubscriptions,
    recentAuditLogs,
  ] = await Promise.all([
    prisma.signal.findMany({
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        subscriptions: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    }),
    prisma.subscription.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    }),
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    }),
    prisma.payment.aggregate({
      where: { status: "captured" },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        status: "captured",
        createdAt: { gte: monthStart },
      },
      _sum: { amount: true },
    }),
    prisma.subscription.count({
      where: { status: "ACTIVE" },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    }),
  ]);

  const signalItems = signals.map((signal) => ({
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
    updatedAt: signal.updatedAt.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    }),
  }));

  return (
    <DashboardShell active="/admin">
      <PageHeader
        eyebrow="Administration"
        title="Admin dashboard"
        description="Create and manage signals, review users and subscriptions, monitor revenue, and inspect audit activity."
        action={
          <Badge variant="secondary">
            <ShieldCheck className="mr-1 size-3" aria-hidden="true" />
            ADMIN
          </Badge>
        }
      />

      <section className="mb-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total users"
          value={users.length.toLocaleString()}
          change={`${users.filter((user) => user.role === "ADMIN").length} admins`}
          icon={Users}
        />
        <StatCard
          label="Active subscriptions"
          value={activeSubscriptions.toLocaleString()}
          change={`${subscriptions.filter((item) => item.status === "TRIAL").length} trials`}
          icon={CreditCard}
          tone="green"
        />
        <StatCard
          label="Captured revenue"
          value={formatCurrency(totalRevenue._sum.amount ?? 0)}
          change="All time"
          icon={IndianRupee}
          tone="gold"
        />
        <StatCard
          label="Monthly revenue"
          value={formatCurrency(monthlyRevenue._sum.amount ?? 0)}
          change="Current month"
          icon={IndianRupee}
          tone="green"
        />
      </section>

      <Tabs defaultValue="signals">
        <TabsList className="max-w-full overflow-x-auto">
          <TabsTrigger value="signals">Signals</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="audit">Audit log</TabsTrigger>
        </TabsList>

        <TabsContent value="signals">
          <AdminSignalManager signals={signalItems} />
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>All users</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="border-y border-white/10 bg-white/[0.03] text-left text-xs uppercase text-muted-foreground">
                    <tr>
                      {["User", "Role", "Trial ends", "Subscription", "Joined"].map(
                        (heading) => (
                          <th key={heading} className="px-4 py-3 font-medium">
                            {heading}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-10 text-center text-muted-foreground"
                        >
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="border-b border-white/10 last:border-0">
                          <td className="px-4 py-4">
                            <p className="font-semibold text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </td>
                          <td className="px-4 py-4">
                            <Badge variant={user.role === "ADMIN" ? "secondary" : "outline"}>
                              {user.role}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-muted-foreground">
                            {formatDate(user.trialEndsAt)}
                          </td>
                          <td className="px-4 py-4">
                            <Badge
                              variant={
                                user.subscriptions[0]?.status === "ACTIVE"
                                  ? "success"
                                  : user.subscriptions[0]?.status === "PAST_DUE"
                                    ? "danger"
                                    : "warning"
                              }
                            >
                              {user.subscriptions[0]?.status ?? "NONE"}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-muted-foreground">
                            {formatDate(user.createdAt)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle>Subscriptions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-sm">
                  <thead className="border-y border-white/10 bg-white/[0.03] text-left text-xs uppercase text-muted-foreground">
                    <tr>
                      {[
                        "User",
                        "Status",
                        "Razorpay customer",
                        "Razorpay subscription",
                        "Period end",
                      ].map((heading) => (
                        <th key={heading} className="px-4 py-3 font-medium">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-10 text-center text-muted-foreground"
                        >
                          No subscription records yet.
                        </td>
                      </tr>
                    ) : (
                      subscriptions.map((subscription) => (
                        <tr
                          key={subscription.id}
                          className="border-b border-white/10 last:border-0"
                        >
                          <td className="px-4 py-4">
                            <p className="font-semibold text-foreground">
                              {subscription.user.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {subscription.user.email}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <Badge
                              variant={
                                subscription.status === "ACTIVE"
                                  ? "success"
                                  : subscription.status === "PAST_DUE"
                                    ? "danger"
                                    : "warning"
                              }
                            >
                              {subscription.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 font-mono text-xs text-muted-foreground">
                            {subscription.razorpayCustomerId ?? "--"}
                          </td>
                          <td className="px-4 py-4 font-mono text-xs text-muted-foreground">
                            {subscription.razorpaySubscriptionId ?? "--"}
                          </td>
                          <td className="px-4 py-4 text-muted-foreground">
                            {formatDate(subscription.currentPeriodEnd)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Recent payments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payment records yet.</p>
              ) : (
                payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex flex-col justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{payment.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {payment.razorpayPaymentId} | {formatDate(payment.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={payment.status === "captured" ? "success" : "warning"}>
                        {payment.status}
                      </Badge>
                      <p className="font-mono font-semibold text-primary">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Recent admin activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentAuditLogs.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No admin activity recorded yet.
                </p>
              ) : (
                recentAuditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-lg border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge variant="outline">{log.action}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {log.createdAt.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-foreground">{log.user.name}</p>
                    <p className="text-xs text-muted-foreground">{log.user.email}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
