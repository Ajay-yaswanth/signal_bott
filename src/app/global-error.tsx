"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

import { RiskDisclaimer } from "@/components/trading/risk-disclaimer";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <main className="flex min-h-screen items-center px-4 py-10 terminal-grid sm:px-6">
          <div className="mx-auto w-full max-w-2xl space-y-4">
            <EmptyState
              icon={AlertTriangle}
              title="ULTRON Signals is temporarily unavailable"
              description="The application could not initialize. Retry once the service connection is restored."
              action={
                <Button type="button" onClick={reset}>
                  <RotateCcw aria-hidden="true" />
                  Retry application
                </Button>
              }
            />
            <RiskDisclaimer />
          </div>
        </main>
      </body>
    </html>
  );
}
