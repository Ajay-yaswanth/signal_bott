"use client";

import { LoaderCircle, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function LogoutButton({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Button
      type="button"
      variant="ghost"
      size={compact ? "icon" : "default"}
      className={className}
      aria-label="Log out"
      disabled={isLoading}
      onClick={async () => {
        setIsLoading(true);
        try {
          await signOut({ callbackUrl: "/login" });
        } finally {
          setIsLoading(false);
        }
      }}
    >
      {isLoading ? (
        <LoaderCircle className="animate-spin" aria-hidden="true" />
      ) : (
        <LogOut aria-hidden="true" />
      )}
      {compact ? null : isLoading ? "Logging out" : "Log out"}
    </Button>
  );
}
