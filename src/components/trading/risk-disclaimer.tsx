import { AlertTriangle } from "lucide-react";

export function RiskDisclaimer() {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/10 p-4 text-sm leading-6 text-muted-foreground">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        <p>
          Trading gold, forex, crypto, and CFDs involves substantial risk. ULTRON Signals is a workflow and analytics platform, not financial advice. Always size positions responsibly and only trade capital you can afford to lose.
        </p>
      </div>
    </div>
  );
}
