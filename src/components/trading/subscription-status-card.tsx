import { CalendarDays, CreditCard } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function SubscriptionStatusCard({
  status,
  periodEnd,
  trialDaysRemaining,
}: {
  status: "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELLED" | "EXPIRED";
  periodEnd: string;
  trialDaysRemaining: number;
}) {
  const badgeVariant =
    status === "ACTIVE"
      ? "success"
      : status === "TRIAL"
        ? "warning"
        : status === "PAST_DUE"
          ? "danger"
          : "outline";
  const statusMessage =
    status === "TRIAL"
      ? `${trialDaysRemaining} trial day${trialDaysRemaining === 1 ? "" : "s"} remaining`
      : status === "ACTIVE"
        ? "Your active subscription includes live signal details and analytics."
        : status === "PAST_DUE"
          ? "Payment is past due. Update billing to restore signal access."
          : status === "CANCELLED"
            ? "Your subscription is cancelled and live signal access is locked."
            : "Your trial has expired and live signal access is locked.";

  return (
    <div className="glass-panel mb-4 grid gap-4 rounded-lg p-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/15 text-primary">
          <CreditCard className="size-5" aria-hidden="true" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-foreground">Account access</p>
            <Badge variant={badgeVariant}>{status}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{statusMessage}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarDays className="size-4 text-primary" aria-hidden="true" />
        Access through {periodEnd}
      </div>
    </div>
  );
}
