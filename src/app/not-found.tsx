import Link from "next/link";
import { SearchX } from "lucide-react";

import { RiskDisclaimer } from "@/components/trading/risk-disclaimer";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center bg-background px-4 py-10 text-foreground terminal-grid sm:px-6">
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <EmptyState
          icon={SearchX}
          title="Page not found"
          description="This terminal route does not exist or is no longer available."
          action={
            <Button asChild>
              <Link href="/">Return home</Link>
            </Button>
          }
        />
        <RiskDisclaimer />
      </div>
    </main>
  );
}
