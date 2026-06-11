import { Bell, RadioTower } from "lucide-react";
import { getServerSession } from "next-auth";

import { LogoutButton } from "@/components/auth/logout-button";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { RiskDisclaimer } from "@/components/trading/risk-disclaimer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";

export async function DashboardShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active: string;
}) {
  const session = await getServerSession(authOptions);
  const role = session?.user.role ?? "USER";
  const initials =
    session?.user.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "US";

  return (
    <div className="min-h-screen bg-background text-foreground terminal-grid">
      <Sidebar active={active} role={role} />
      <div className="min-w-0 lg:pl-72">
        <MobileNav active={active} role={role} />
        <header className="sticky top-0 z-20 hidden h-20 items-center justify-between border-b border-white/10 bg-[#050914]/80 px-6 backdrop-blur-xl lg:flex">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Live Terminal
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              XAUUSD liquidity, signal risk, and desk execution
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="success">
              <RadioTower className="mr-1 size-3" aria-hidden="true" />
              Live Feed
            </Badge>
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell aria-hidden="true" />
            </Button>
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <LogoutButton compact />
          </div>
        </header>
        <main className="mx-auto min-w-0 w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
          <footer className="mt-8">
            <RiskDisclaimer />
          </footer>
        </main>
      </div>
    </div>
  );
}
