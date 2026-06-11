"use client";

import { AlertCircle, RadioTower } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  LiveSignalPanel,
  type LiveSignal,
} from "@/components/trading/live-signal-panel";
import { Badge } from "@/components/ui/badge";

const POLL_INTERVAL_MS = 10_000;

type LatestSignalResponse = {
  success: boolean;
  signal?: LiveSignal;
};

function relativeTime(isoDate: string, now: number) {
  const seconds = Math.max(
    0,
    Math.floor((now - new Date(isoDate).getTime()) / 1000),
  );

  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
}

export function LiveSignalFeed({
  initialSignal,
  initialHasAccess,
}: {
  initialSignal: LiveSignal | null;
  initialHasAccess: boolean;
}) {
  const [signal, setSignal] = useState(initialSignal);
  const [hasAccess, setHasAccess] = useState(initialHasAccess);
  const [now, setNow] = useState(() => Date.now());
  const [lastCheckedAt, setLastCheckedAt] = useState(() => Date.now());
  const [syncError, setSyncError] = useState("");
  const lastCheckedAtRef = useRef(lastCheckedAt);
  const etagRef = useRef<string | null>(
    initialSignal
      ? `"${initialSignal.id}:${new Date(initialSignal.updatedAt).getTime()}"`
      : null,
  );
  const inFlightRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const pollLatestSignal = useCallback(async () => {
    if (
      document.visibilityState !== "visible" ||
      inFlightRef.current ||
      Date.now() - lastCheckedAtRef.current < POLL_INTERVAL_MS
    ) {
      return;
    }

    inFlightRef.current = true;
    abortRef.current = new AbortController();

    try {
      const response = await fetch("/api/signals/latest", {
        headers: etagRef.current
          ? { "If-None-Match": etagRef.current }
          : undefined,
        cache: "no-store",
        signal: abortRef.current.signal,
      });
      const checkedAt = Date.now();
      lastCheckedAtRef.current = checkedAt;
      setLastCheckedAt(checkedAt);

      if (response.status === 304) {
        setSyncError("");
        return;
      }

      if (response.status === 403) {
        setSyncError("");
        setHasAccess(false);
        setSignal(null);
        return;
      }

      if (response.status === 404) {
        setSyncError("");
        setSignal(null);
        return;
      }

      if (!response.ok) {
        setSyncError("Live sync unavailable");
        return;
      }

      const data = (await response.json()) as LatestSignalResponse;
      const responseEtag = response.headers.get("etag");

      if (responseEtag) {
        etagRef.current = responseEtag;
      }

      if (data.signal) {
        setSyncError("");
        setHasAccess(true);
        setSignal(data.signal);
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setSyncError("Live sync unavailable");
      }
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let timeoutId: number;

    const schedule = () => {
      timeoutId = window.setTimeout(async () => {
        await pollLatestSignal();
        schedule();
      }, POLL_INTERVAL_MS);
    };

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        Date.now() - lastCheckedAtRef.current >= POLL_INTERVAL_MS
      ) {
        void pollLatestSignal();
      }
    };

    schedule();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      abortRef.current?.abort();
    };
  }, [pollLatestSignal]);

  const displaySignal = signal
    ? {
        ...signal,
        updatedAt: relativeTime(signal.updatedAt, now),
      }
    : null;

  return (
    <div>
      <div className="mb-3 flex items-center justify-end">
        <Badge variant={syncError ? "danger" : "success"} className="gap-2">
          {syncError ? (
            <AlertCircle className="size-3" aria-hidden="true" />
          ) : (
            <>
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              <RadioTower className="size-3" aria-hidden="true" />
            </>
          )}
          {syncError || "Live sync"} | checked{" "}
          {relativeTime(new Date(lastCheckedAt).toISOString(), now)}
        </Badge>
      </div>
      <LiveSignalPanel signal={displaySignal} hasAccess={hasAccess} />
    </div>
  );
}
