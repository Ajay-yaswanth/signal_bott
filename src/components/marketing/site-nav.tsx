import Link from "next/link";
import { Gauge } from "lucide-react";

import { Button } from "@/components/ui/button";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/signals", label: "Signals" },
  { href: "/performance", label: "Performance" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteNav() {
  return (
    <header className="border-b border-white/10 bg-[#050914]/82 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/15 text-primary">
            <Gauge className="size-5" aria-hidden="true" />
          </span>
          <span className="hidden text-sm font-semibold text-foreground sm:inline">
            ULTRON Signals
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Button key={link.href} asChild variant="ghost" size="sm">
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/register">Start trial</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
