import { describe, expect, it } from "vitest";

import { hasActiveSignalAccess } from "@/lib/signal-access";

const now = new Date("2026-06-13T12:00:00.000Z");

describe("premium signal access", () => {
  it("allows an active paid trial", () => {
    expect(
      hasActiveSignalAccess(
        {
          trialAccess: {
            status: "ACTIVE",
            startsAt: new Date("2026-06-13T10:00:00.000Z"),
            endsAt: new Date("2026-06-14T12:00:00.000Z"),
          },
          subscriptions: [],
        },
        now,
      ),
    ).toBe(true);
  });

  it("allows an active, unexpired subscription", () => {
    expect(
      hasActiveSignalAccess(
        {
          trialAccess: null,
          subscriptions: [
            {
              status: "ACTIVE",
              currentPeriodEnd: new Date("2026-07-13T12:00:00.000Z"),
            },
          ],
        },
        now,
      ),
    ).toBe(true);
  });

  it("rejects expired paid trials and subscriptions", () => {
    expect(
      hasActiveSignalAccess(
        {
          trialAccess: {
            status: "EXPIRED",
            startsAt: new Date("2026-06-10T12:00:00.000Z"),
            endsAt: new Date("2026-06-12T12:00:00.000Z"),
          },
          subscriptions: [
            {
              status: "ACTIVE",
              currentPeriodEnd: new Date("2026-06-12T12:00:00.000Z"),
            },
          ],
        },
        now,
      ),
    ).toBe(false);
  });
});
