"use client";

import { CreditCard, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
};

type RazorpayCheckout = {
  open: () => void;
  on: (
    event: string,
    callback: (response: { error?: { description?: string } }) => void,
  ) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: {
      key: string;
      subscription_id: string;
      name: string;
      description: string;
      prefill: { name: string; email: string };
      theme: { color: string };
      handler: (response: RazorpaySuccessResponse) => void;
      modal: { ondismiss: () => void };
    }) => RazorpayCheckout;
  }
}

function loadRazorpayCheckout() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function RazorpaySubscribeButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function startCheckout() {
    setMessage("");
    setIsLoading(true);

    try {
      const loaded = await loadRazorpayCheckout();
      if (!loaded || !window.Razorpay) {
        setMessage("Unable to load Razorpay checkout.");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/razorpay/subscription", {
        method: "POST",
      });
      const data = (await response.json()) as {
        error?: string;
        keyId?: string;
        subscriptionId?: string;
        name?: string;
        email?: string;
      };

      if (!response.ok || !data.keyId || !data.subscriptionId) {
        setMessage(data.error ?? "Unable to start subscription checkout.");
        setIsLoading(false);
        return;
      }

      const checkout = new window.Razorpay({
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: "ULTRON Signals",
        description: "Monthly XAUUSD Signals Subscription",
        prefill: {
          name: data.name ?? "",
          email: data.email ?? "",
        },
        theme: { color: "#d6a93f" },
        handler: async (checkoutResponse) => {
          try {
            const verification = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(checkoutResponse),
            });
            const verificationData = (await verification.json()) as {
              error?: string;
            };

            if (!verification.ok) {
              setMessage(
                verificationData.error ??
                  "Payment received. Subscription verification is pending.",
              );
              return;
            }

            setMessage("Subscription activated. Redirecting to dashboard.");
            router.push("/dashboard");
            router.refresh();
          } catch {
            setMessage("Payment received. Verification is temporarily unavailable.");
          } finally {
            setIsLoading(false);
          }
        },
        modal: {
          ondismiss: () => setIsLoading(false),
        },
      });

      checkout.on("payment.failed", (failure) => {
        setMessage(failure.error?.description ?? "Payment failed. Please retry.");
        setIsLoading(false);
      });
      checkout.open();
    } catch {
      setMessage("Unable to start checkout. Check your connection and retry.");
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <Button
        type="button"
        className="w-full"
        disabled={isLoading}
        onClick={startCheckout}
      >
        {isLoading ? (
          <LoaderCircle className="animate-spin" aria-hidden="true" />
        ) : (
          <CreditCard aria-hidden="true" />
        )}
        {isLoading ? "Opening checkout" : "Subscribe monthly"}
      </Button>
      {message ? (
        <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
          {message}
        </p>
      ) : null}
    </div>
  );
}
