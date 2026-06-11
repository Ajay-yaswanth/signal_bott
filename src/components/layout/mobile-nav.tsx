import Link from "next/link";
import { Gauge } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { navItems } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";

export function MobileNav({
  active,
  role,
}: {
  active: string;
  role: "USER" | "ADMIN";
}) {
  const visibleNavItems = navItems.filter(
    (item) => item.href !== "/admin" || role === "ADMIN",
  );

  return (
    <div className="sticky top-0 z-30 lg:hidden">
      <div className="flex h-16 items-center justify-between border-b border-white/10 bg-[#050914]/90 px-4 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/15 text-primary">
            <Gauge className="size-5" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold text-foreground">ULTRON</span>
        </Link>
        <LogoutButton compact />
      </div>
      <nav
        className="flex gap-2 overflow-x-auto border-b border-white/10 bg-[#050914]/92 px-4 py-3 backdrop-blur-xl"
        aria-label="Primary navigation"
      >
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium",
                isActive
                  ? "border-primary/40 bg-primary/15 text-primary"
                  : "border-white/10 bg-white/[0.03] text-muted-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
