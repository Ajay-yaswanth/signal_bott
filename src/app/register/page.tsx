import Link from "next/link";

import { AuthCard } from "@/components/marketing/auth-card";
import { RiskDisclaimer } from "@/components/trading/risk-disclaimer";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Register",
  description:
    "Create an ULTRON Signals account and begin a three-day XAUUSD signal trial.",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen bg-background text-foreground terminal-grid lg:grid-cols-[1fr_480px]">
      <section className="hidden border-r border-white/10 bg-[#050914]/72 p-10 backdrop-blur-xl lg:flex lg:flex-col lg:justify-between">
        <Button asChild variant="ghost" className="w-fit">
          <Link href="/">ULTRON Signals</Link>
        </Button>
        <div>
          <p className="text-3xl font-semibold tracking-normal text-foreground">
            Build a premium XAUUSD signal desk without duct-taping spreadsheets.
          </p>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
            Start with clean routing, Auth.js, Prisma, PostgreSQL, Zod validation, shadcn/ui, and chart-ready analytics.
          </p>
        </div>
      </section>
      <section className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md space-y-4">
          <AuthCard mode="register" />
          <RiskDisclaimer />
        </div>
      </section>
    </main>
  );
}
