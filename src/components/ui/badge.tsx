import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.08em]",
  {
    variants: {
      variant: {
        default: "border-primary/30 bg-primary/15 text-primary",
        secondary:
          "border-primary/25 bg-secondary text-secondary-foreground",
        outline: "border-white/15 text-muted-foreground",
        success:
          "border-emerald-400/30 bg-emerald-400/12 text-emerald-300",
        warning: "border-amber-300/30 bg-amber-300/12 text-amber-200",
        danger: "border-red-400/30 bg-red-400/12 text-red-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
