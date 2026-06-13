import { PricingExperience } from "@/components/billing/pricing-experience";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { RiskDisclaimer } from "@/components/trading/risk-disclaimer";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Pricing",
  description:
    "Choose a paid trial and recurring ULTRON Signals subscription plan.",
  robots: { index: false, follow: false },
};

export default function PricingPage() {
  return (
    <DashboardShell active="/pricing">
      <header className="mb-7 text-center">
        <Badge variant="secondary">Razorpay recurring autopay</Badge>
        <h1 className="mx-auto mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
          Choose your signal access
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-400">
          Begin with a clearly disclosed ₹9 paid trial, then continue on your
          selected recurring monthly or three-month plan.
        </p>
      </header>
      <PricingExperience />
      <div className="mt-8">
        <RiskDisclaimer />
      </div>
    </DashboardShell>
  );
}
