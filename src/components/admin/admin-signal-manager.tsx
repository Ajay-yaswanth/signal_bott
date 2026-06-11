"use client";

import type { FormEvent } from "react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Plus, RadioTower, Save, SquareCheckBig } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import {
  createAdminSignalSchema,
  updateAdminSignalSchema,
} from "@/lib/validators";

const selectClass =
  "h-10 w-full rounded-lg border border-white/15 bg-[#080d18] px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";
const textareaClass =
  "min-h-24 w-full resize-y rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring";

type AdminSignalItem = {
  id: string;
  symbol: string;
  direction: "BUY" | "SELL" | "WAIT";
  entry: string | null;
  stopLoss: string | null;
  tp1: string | null;
  tp2: string | null;
  tp3: string | null;
  confidence: number;
  bias: string;
  reason: string;
  status: "ACTIVE" | "CLOSED" | "EXPIRED";
  result: "TP1" | "TP2" | "TP3" | "SL" | "BE" | "PENDING";
  points: string | null;
  updatedAt: string;
};

function FormMessage({
  error,
  success,
}: {
  error: string;
  success: string;
}) {
  if (!error && !success) return null;

  return (
    <p
      className={
        error
          ? "rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-200"
          : "rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200"
      }
    >
      {error || success}
    </p>
  );
}

function CreateSignalForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    const form = event.currentTarget;
    const parsed = createAdminSignalSchema.safeParse(
      Object.fromEntries(new FormData(form)),
    );

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check signal details.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Unable to create signal.");
        return;
      }

      form.reset();
      setSuccess("Signal created and audit log recorded.");
      router.refresh();
    } catch {
      setError("Unable to reach the signal service. Try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create new signal</CardTitle>
        <p className="text-sm text-muted-foreground">
          Publish a validated live signal for users with active access.
        </p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="create-symbol">Symbol</Label>
              <Input
                id="create-symbol"
                name="symbol"
                defaultValue="XAUUSD"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-direction">Direction</Label>
              <select
                id="create-direction"
                name="direction"
                className={selectClass}
                defaultValue="WAIT"
              >
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
                <option value="WAIT">WAIT</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-confidence">Confidence %</Label>
              <Input
                id="create-confidence"
                name="confidence"
                type="number"
                min="0"
                max="100"
                defaultValue="75"
                required
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["entry", "Entry"],
              ["stopLoss", "Stop loss"],
              ["tp1", "TP1"],
              ["tp2", "TP2"],
              ["tp3", "TP3"],
            ].map(([name, label]) => (
              <div key={name} className="space-y-2">
                <Label htmlFor={`create-${name}`}>{label}</Label>
                <Input
                  id={`create-${name}`}
                  name={name}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Optional"
                />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-bias">Market bias</Label>
            <Input
              id="create-bias"
              name="bias"
              placeholder="Bullish liquidity reclaim"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-reason">ICT / SMC reason</Label>
            <textarea
              id="create-reason"
              name="reason"
              className={textareaClass}
              placeholder="Describe liquidity, market structure, imbalance, and confirmation."
              required
            />
          </div>
          <FormMessage error={error} success={success} />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            ) : (
              <Plus aria-hidden="true" />
            )}
            {isLoading ? "Creating" : "Create signal"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ManageSignalCard({ signal }: { signal: AdminSignalItem }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submitUpdate(closeSignal: boolean) {
    const form = formRef.current;
    if (!form) return;

    setError("");
    setSuccess("");
    const values = Object.fromEntries(new FormData(form));
    if (closeSignal) values.status = "CLOSED";
    const parsed = updateAdminSignalSchema.safeParse(values);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check signal update.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/signals/${signal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Unable to update signal.");
        return;
      }

      setSuccess(
        closeSignal
          ? "Signal closed and audit log recorded."
          : "Signal updated and audit log recorded.",
      );
      router.refresh();
    } catch {
      setError("Unable to reach the signal service. Try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="items-start justify-between gap-3 sm:flex-row">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="font-mono">{signal.symbol}</CardTitle>
            <Badge
              variant={
                signal.direction === "BUY"
                  ? "success"
                  : signal.direction === "SELL"
                    ? "danger"
                    : "warning"
              }
            >
              {signal.direction}
            </Badge>
            <Badge variant={signal.status === "ACTIVE" ? "success" : "outline"}>
              {signal.status}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{signal.bias}</p>
        </div>
        <p className="text-xs text-muted-foreground sm:whitespace-nowrap">
          {signal.updatedAt}
        </p>
      </CardHeader>
      <CardContent>
        <form
          ref={formRef}
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void submitUpdate(false);
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor={`${signal.id}-status`}>Status</Label>
              <select
                id={`${signal.id}-status`}
                name="status"
                defaultValue={signal.status}
                className={selectClass}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="CLOSED">CLOSED</option>
                <option value="EXPIRED">EXPIRED</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${signal.id}-result`}>Result</Label>
              <select
                id={`${signal.id}-result`}
                name="result"
                defaultValue={signal.result}
                className={selectClass}
              >
                {["PENDING", "TP1", "TP2", "TP3", "SL", "BE"].map((result) => (
                  <option key={result} value={result}>
                    {result}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${signal.id}-points`}>Points</Label>
              <Input
                id={`${signal.id}-points`}
                name="points"
                type="number"
                step="0.01"
                defaultValue={signal.points ?? ""}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label>Entry</Label>
              <Input value={signal.entry ?? "Market"} disabled readOnly />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                ["stopLoss", "Stop loss", signal.stopLoss],
                ["tp1", "TP1", signal.tp1],
                ["tp2", "TP2", signal.tp2],
                ["tp3", "TP3", signal.tp3],
              ] satisfies Array<[string, string, string | null]>
            ).map(([name, label, value]) => (
              <div key={name} className="space-y-2">
                <Label htmlFor={`${signal.id}-${name}`}>{label}</Label>
                <Input
                  id={`${signal.id}-${name}`}
                  name={name}
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={value ?? ""}
                  placeholder="Optional"
                />
              </div>
            ))}
          </div>
          <FormMessage error={error} success={success} />
          <div className="grid gap-2 sm:flex sm:flex-wrap">
            <Button
              type="submit"
              variant="outline"
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <LoaderCircle className="animate-spin" aria-hidden="true" />
              ) : (
                <Save aria-hidden="true" />
              )}
              Save changes
            </Button>
            <Button
              type="button"
              disabled={isLoading}
              className="w-full sm:w-auto"
              onClick={() => void submitUpdate(true)}
            >
              <SquareCheckBig aria-hidden="true" />
              Close with result
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function AdminSignalManager({
  signals,
}: {
  signals: AdminSignalItem[];
}) {
  return (
    <div className="space-y-4">
      <CreateSignalForm />
      <div className="space-y-4">
        {signals.length === 0 ? (
          <EmptyState
            icon={RadioTower}
            title="No signals to manage"
            description="Create the first validated XAUUSD setup to make it available to eligible users."
          />
        ) : (
          signals.map((signal) => (
            <ManageSignalCard
              key={`${signal.id}-${signal.updatedAt}`}
              signal={signal}
            />
          ))
        )}
      </div>
    </div>
  );
}
