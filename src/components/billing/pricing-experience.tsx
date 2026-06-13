"use client";

import { Check, Crown, Sparkles } from "lucide-react";

import { RazorpaySubscribeButton } from "@/components/billing/razorpay-subscribe-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BILLING_PLANS,
  formatInr,
  PAID_TRIAL,
} from "@/lib/billing-plans";
import { cn } from "@/lib/utils";

function PlanCard({
  plan,
}: {
  plan: (typeof BILLING_PLANS)[number];
}) {
  const cycle = plan.billingCycle === "MONTHLY" ? "month" : "3 months";
  const normalSignals =
    plan.normalSignalsMin === plan.normalSignalsMax
      ? `${plan.normalSignalsMin} normal signals per day`
      : `${plan.normalSignalsMin} to ${plan.normalSignalsMax} normal signals per day`;

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-[#070c17]/95 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.34)]",
        plan.mostPopular &&
          "border-primary/45 shadow-[0_0_60px_rgba(214,169,63,0.14)]",
      )}
    >
      {plan.mostPopular ? (
        <Badge className="absolute right-4 top-4">Most Popular</Badge>
      ) : null}
      <div className="flex size-11 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
        {plan.tier === "PRIME_ELITE" ? (
          <Crown className="size-5" aria-hidden="true" />
        ) : (
          <Sparkles className="size-5" aria-hidden="true" />
        )}
      </div>
      <h3 className="mt-5 text-xl font-semibold text-white">{plan.name}</h3>
      <p className="mt-2 min-h-10 text-xs leading-5 text-muted-foreground">
        {plan.description}
      </p>
      <div className="mt-5 flex items-end gap-2">
        {plan.amount !== plan.originalAmount ? (
          <span className="pb-1 text-sm text-slate-500 line-through">
            {formatInr(plan.originalAmount)}
          </span>
        ) : null}
        <span className="font-mono text-3xl font-semibold text-primary">
          {formatInr(plan.amount)}
        </span>
        <span className="pb-1 text-xs text-muted-foreground">/{cycle}</span>
      </div>
      <ul className="mt-5 space-y-3">
        {[
          `${plan.sniperSignalsDay} sniper signals per day`,
          normalSignals,
          `Target performance: ${plan.targetPerformance}`,
          "Full entry, SL, TP1, TP2 and TP3",
        ].map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-xs text-slate-300">
            <Check className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>
      <RazorpaySubscribeButton
        planCode={plan.code}
        planName={`${plan.name} ${cycle}`}
        renewalText={`${formatInr(plan.amount)} every ${cycle}.`}
      />
    </article>
  );
}

function Plans({ cycle }: { cycle: "MONTHLY" | "QUARTERLY" }) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {BILLING_PLANS.filter((plan) => plan.billingCycle === cycle).map((plan) => (
        <PlanCard key={plan.code} plan={plan} />
      ))}
    </div>
  );
}

export function PricingExperience() {
  const monthly = BILLING_PLANS.filter((plan) => plan.billingCycle === "MONTHLY");

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-2xl border border-primary/35 bg-[radial-gradient(circle_at_80%_20%,rgba(214,169,63,0.18),transparent_35%),linear-gradient(135deg,rgba(18,22,34,0.98),rgba(4,8,18,0.98))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.4)]">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <Badge variant="secondary">Paid Trial</Badge>
            <h2 className="mt-4 text-3xl font-semibold text-white">
              Test the premium signal desk for 2 days
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Get complete signal access for two days, then continue on the
              recurring plan you select below.
            </p>
            <p className="mt-4 rounded-lg border border-primary/20 bg-primary/[0.06] px-4 py-3 text-sm font-semibold text-primary">
              After 2 days, your selected monthly plan renews automatically
              unless cancelled.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-6 text-center">
            <p className="text-sm text-slate-500 line-through">
              {formatInr(PAID_TRIAL.originalAmount)}
            </p>
            <p className="mt-1 font-mono text-5xl font-semibold text-primary">
              {formatInr(PAID_TRIAL.offerAmount)}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
              2 days access
            </p>
          </div>
        </div>
      </section>

      <Tabs defaultValue="monthly">
        <TabsList className="mx-auto border-primary/15 bg-[#070c17]/90">
          <TabsTrigger value="monthly">1 Month</TabsTrigger>
          <TabsTrigger value="quarterly">3 Months · Save More</TabsTrigger>
        </TabsList>
        <TabsContent value="monthly">
          <Plans cycle="MONTHLY" />
        </TabsContent>
        <TabsContent value="quarterly">
          <Plans cycle="QUARTERLY" />
        </TabsContent>
      </Tabs>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#070c17]/95">
        <div className="border-b border-white/10 p-5">
          <h2 className="text-xl font-semibold text-white">Plan comparison</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Signal limits are daily maximums. Target performance is not a
            guarantee of results.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-black/15 text-left text-[10px] uppercase tracking-[0.16em] text-slate-500">
              <tr>
                {["Plan", "Monthly", "Sniper/day", "Normal/day", "Target performance"].map(
                  (heading) => (
                    <th key={heading} className="px-5 py-3 font-semibold">
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {monthly.map((plan) => (
                <tr key={plan.code} className="border-t border-white/8">
                  <td className="px-5 py-4 font-semibold text-white">{plan.name}</td>
                  <td className="px-5 py-4 font-mono text-primary">
                    {formatInr(plan.amount)}
                  </td>
                  <td className="px-5 py-4 text-slate-300">{plan.sniperSignalsDay}</td>
                  <td className="px-5 py-4 text-slate-300">
                    {plan.normalSignalsMin === plan.normalSignalsMax
                      ? plan.normalSignalsMin
                      : `${plan.normalSignalsMin}-${plan.normalSignalsMax}`}
                  </td>
                  <td className="px-5 py-4 text-slate-300">
                    {plan.targetPerformance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
