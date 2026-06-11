import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PricingCard({
  name,
  price,
  description,
  features,
  featured = false,
  action,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  featured?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "glass-panel rounded-lg p-5",
        featured && "border-primary/45 shadow-[0_0_42px_rgba(214,169,63,0.16)]",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-foreground">{name}</h3>
        {featured ? <Badge variant="secondary">Elite</Badge> : null}
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
      <div className="mt-6 flex items-end gap-1">
        <span className="text-4xl font-semibold text-primary">{price}</span>
        <span className="pb-1 text-sm text-muted-foreground">/mo</span>
      </div>
      <ul className="mt-6 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm text-slate-200">
            <Check className="size-4 text-primary" aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>
      {action ?? (
        <Button className="mt-6 w-full" variant={featured ? "default" : "outline"}>
          Choose {name}
        </Button>
      )}
    </div>
  );
}
