import Link from "next/link";

import { AuthCard } from "@/components/marketing/auth-card";
import { RiskDisclaimer } from "@/components/trading/risk-disclaimer";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Login",
  description: "Sign in to the ULTRON Signals XAUUSD trading terminal.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-background text-foreground terminal-grid lg:grid-cols-[1fr_480px]">
      <section className="hidden border-r border-white/10 bg-[#050914]/72 p-10 backdrop-blur-xl lg:flex lg:flex-col lg:justify-between">
        <Button asChild variant="ghost" className="w-fit">
          <Link href="/">ULTRON Signals</Link>
        </Button>
        <div>
          <p className="text-3xl font-semibold tracking-normal text-foreground">
            Gold signal operations should feel calm, measurable, and fast.
          </p>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
            Log in to review open signals, publish updates, and monitor desk-wide performance in one place.
          </p>
        </div>
      </section>
      <section className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md space-y-4">
          <AuthCard mode="login" />
          <RiskDisclaimer />
        </div>
      </section>
    </main>
  );
}
