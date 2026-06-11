"use client";

import { AlertCircle, RotateCcw } from "lucide-react";

import { RiskDisclaimer } from "@/components/trading/risk-disclaimer";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center bg-background px-4 py-10 text-foreground terminal-grid sm:px-6">
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <EmptyState
          icon={AlertCircle}
          title="The terminal could not load"
          description="A temporary problem interrupted this view. Retry the request, or return after checking the service connection."
          action={
            <Button type="button" onClick={reset}>
              <RotateCcw aria-hidden="true" />
              Try again
            </Button>
          }
        />
        <RiskDisclaimer />
      </div>
    </main>
  );
}
