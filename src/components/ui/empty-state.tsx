import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "glass-panel flex min-h-52 flex-col items-center justify-center rounded-lg p-6 text-center sm:p-8",
        className,
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-lg border border-primary/30 bg-primary/15 text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <h2 className="mt-4 font-semibold text-foreground">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
