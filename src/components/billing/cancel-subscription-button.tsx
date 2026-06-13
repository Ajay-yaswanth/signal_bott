"use client";

import { LoaderCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function CancelSubscriptionButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function cancel() {
    if (
      !window.confirm(
        "Cancel recurring autopay at the end of your current access period?",
      )
    ) {
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/razorpay/subscription/cancel", {
        method: "POST",
      });
      const data = (await response.json()) as { error?: string; message?: string };
      setMessage(data.message ?? data.error ?? "Cancellation request processed.");
      if (response.ok) router.refresh();
    } catch {
      setMessage("Unable to request cancellation right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={cancel}
      >
        {loading ? (
          <LoaderCircle className="animate-spin" aria-hidden="true" />
        ) : (
          <XCircle aria-hidden="true" />
        )}
        Cancel recurring autopay
      </Button>
      {message ? (
        <p className="mt-2 text-xs leading-5 text-muted-foreground">{message}</p>
      ) : null}
    </div>
  );
}
