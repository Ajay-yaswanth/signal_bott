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
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function RazorpaySubscribeButton({
  planCode,
  planName,
  renewalText,
}: {
  planCode: string;
  planName: string;
  renewalText: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState("");

  async function startCheckout() {
    if (!consent) {
      setMessage("Confirm recurring autopay consent before continuing.");
      return;
    }

    setMessage("");
    setIsLoading(true);

    try {
      const loaded = await loadRazorpayCheckout();
      if (!loaded || !window.Razorpay) {
        setMessage("Unable to load Razorpay checkout.");
        return;
      }

      const response = await fetch("/api/razorpay/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode, autopayConsent: true }),
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
        return;
      }

      const checkout = new window.Razorpay({
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: "ULTRON Signals",
        description: `₹9 paid trial, then ${planName} recurring autopay`,
        prefill: {
          name: data.name ?? "",
          email: data.email ?? "",
        },
        theme: { color: "#d6a93f" },
        handler: async (checkoutResponse) => {
          const verification = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(checkoutResponse),
          });
          const verificationData = (await verification.json()) as {
            error?: string;
            paidTrialStatus?: "ACTIVE" | "PENDING";
          };

          if (!verification.ok) {
            setMessage(
              verificationData.error ??
                "Payment received. Subscription verification is pending.",
            );
            return;
          }

          setMessage(
            verificationData.paidTrialStatus === "ACTIVE"
              ? "Paid trial activated. Redirecting to dashboard."
              : "Payment verification is pending. Access unlocks after capture.",
          );
          router.push("/dashboard");
          router.refresh();
        },
        modal: { ondismiss: () => setIsLoading(false) },
      });

      checkout.on("payment.failed", (failure) => {
        setMessage(failure.error?.description ?? "Payment failed. Please retry.");
        setIsLoading(false);
      });
      checkout.open();
    } catch {
      setMessage("Unable to start checkout. Check your connection and retry.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-6 space-y-3">
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-primary/20 bg-primary/[0.055] p-3 text-xs leading-5 text-slate-300">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-1 accent-[#d6a93f]"
        />
        <span>
          I consent to recurring autopay. After 2 days, my selected plan renews
          automatically unless cancelled. {renewalText}
        </span>
      </label>
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
        {isLoading ? "Opening secure checkout" : "Start ₹9 paid trial"}
      </Button>
      {message ? (
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {message}
        </p>
      ) : null}
    </div>
  );
}
