import Link from "next/link";
import {
  Activity,
  BarChart3,
  CreditCard,
  Gauge,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/signals", label: "Signals", icon: Activity },
  { href: "/performance", label: "Performance", icon: BarChart3 },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
  { href: "/admin", label: "Admin", icon: ShieldCheck },
];

export function Sidebar({
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
    <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-white/10 bg-[#050914]/86 backdrop-blur-xl lg:block">
      <div className="flex h-20 items-center gap-3 px-5">
        <div className="flex size-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/15 text-primary">
          <Gauge className="size-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">ULTRON Signals</p>
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
            XAUUSD terminal
          </p>
        </div>
      </div>
      <nav className="space-y-1 px-3">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.href;

          return (
            <Button
              key={item.href}
              asChild
              variant={isActive ? "secondary" : "ghost"}
              className={cn("w-full justify-start", isActive && "text-primary")}
            >
              <Link href={item.href}>
                <Icon aria-hidden="true" />
                {item.label}
              </Link>
            </Button>
          );
        })}
      </nav>
      <div className="absolute inset-x-3 bottom-3 space-y-3">
        <div className="rounded-lg border border-primary/20 bg-primary/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Gold Session
          </p>
          <p className="mt-2 text-sm text-slate-200">
            London/New York overlap is active.
          </p>
        </div>
        <LogoutButton className="w-full justify-start" />
      </div>
    </aside>
  );
}
