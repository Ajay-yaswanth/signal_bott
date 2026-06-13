import { CalendarDays, CreditCard } from "lucide-react";

import { CancelSubscriptionButton } from "@/components/billing/cancel-subscription-button";
import { Badge } from "@/components/ui/badge";

export function SubscriptionStatusCard({
  status,
  periodEnd,
  planName,
  paidTrialActive,
  cancelAtPeriodEnd,
  canCancel,
}: {
  status:
    | "TRIAL"
    | "ACTIVE"
    | "PAST_DUE"
    | "CANCELLED"
    | "EXPIRED";
  periodEnd: string;
  planName: string | null;
  paidTrialActive: boolean;
  cancelAtPeriodEnd: boolean;
  canCancel: boolean;
}) {
  const badgeVariant =
    status === "ACTIVE" || paidTrialActive
      ? "success"
      : status === "PAST_DUE"
        ? "danger"
        : status === "TRIAL"
          ? "warning"
          : "outline";
  const statusMessage = paidTrialActive
    ? "Your paid 2-day trial is active. Recurring autopay starts after the trial."
    : status === "ACTIVE"
      ? "Your recurring subscription includes full premium signal access."
      : status === "PAST_DUE"
        ? "Payment is past due. Premium signals are locked until payment succeeds."
        : status === "CANCELLED"
          ? "Recurring autopay is cancelled."
          : status === "TRIAL"
            ? "Your paid trial authorization is being confirmed."
            : "No active paid trial or subscription. Premium signals are locked.";

  return (
    <div className="glass-panel mb-5 grid gap-4 rounded-lg p-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/15 text-primary">
          <CreditCard className="size-5" aria-hidden="true" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-foreground">
              {planName ?? "Premium signal access"}
            </p>
            <Badge variant={badgeVariant}>
              {paidTrialActive ? "PAID TRIAL" : status}
            </Badge>
            {cancelAtPeriodEnd ? <Badge variant="warning">CANCEL SCHEDULED</Badge> : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{statusMessage}</p>
          {canCancel && !cancelAtPeriodEnd ? <CancelSubscriptionButton /> : null}
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarDays className="size-4 text-primary" aria-hidden="true" />
        Access through {periodEnd}
      </div>
    </div>
  );
}
