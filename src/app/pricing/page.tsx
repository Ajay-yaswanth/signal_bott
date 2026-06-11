import { ShieldCheck } from "lucide-react";

import { RazorpaySubscribeButton } from "@/components/billing/razorpay-subscribe-button";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/layout/page-header";
import { PricingCard } from "@/components/trading/pricing-card";

export const metadata = {
  title: "Pricing",
  description:
    "Subscribe to ULTRON Signals for full live XAUUSD signal access.",
  robots: { index: false, follow: false },
};

export default function PricingPage() {
  return (
    <DashboardShell active="/pricing">
      <PageHeader
        eyebrow="Monthly access"
        title="ULTRON Signals subscription"
        description="Start with a 3-day free trial, then keep full XAUUSD signal access with one simple monthly subscription."
      />

      <section className="mx-auto max-w-xl">
        <PricingCard
          name="ULTRON Monthly"
          price="INR 1,499"
          description="Professional XAUUSD signals, ICT/SMC reasoning, targets, risk levels, history, and performance analytics."
          features={[
            "Live XAUUSD entry, SL, TP1, TP2 and TP3",
            "Market bias and ICT/SMC reasons",
            "Signal history and CSV exports",
            "Performance and risk analytics",
          ]}
          featured
          action={<RazorpaySubscribeButton />}
        />
      </section>

      <section className="mx-auto mt-4 max-w-xl">
        <div className="glass-panel rounded-lg p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/15 text-primary">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                Secure Razorpay recurring billing
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Checkout authorization is verified server-side, and signed
                webhooks keep payment and subscription access current.
              </p>
            </div>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
