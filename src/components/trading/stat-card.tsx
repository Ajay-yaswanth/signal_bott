import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
  tone = "gold",
}: {
  label: string;
  value: string;
  change: string;
  icon?: LucideIcon;
  tone?: "gold" | "green" | "red" | "blue";
}) {
  const toneClass = {
    gold: "text-primary",
    green: "text-emerald-300",
    red: "text-red-300",
    blue: "text-sky-300",
  }[tone];

  return (
    <div className="glass-panel rounded-lg p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        {Icon ? <Icon className={cn("size-4", toneClass)} aria-hidden="true" /> : null}
      </div>
      <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
      <p className={cn("mt-1 text-xs font-medium", toneClass)}>{change}</p>
    </div>
  );
}
