import { afterEach, describe, expect, it } from "vitest";

import {
  isAuthorizedCronRequest,
  isAuthorizedStrategyRequest,
} from "@/lib/strategy-auth";

afterEach(() => {
  delete process.env.CRON_SECRET;
  delete process.env.ULTRON_STRATEGY_API_KEY;
});

describe("strategy route authentication", () => {
  it("accepts Vercel cron bearer authentication", () => {
    process.env.CRON_SECRET = "cron-test-secret";

    expect(
      isAuthorizedCronRequest(
        new Request("https://example.com/api/strategy/scan", {
          headers: { authorization: "Bearer cron-test-secret" },
        }),
      ),
    ).toBe(true);
  });

  it("rejects invalid cron authentication", () => {
    process.env.CRON_SECRET = "cron-test-secret";

    expect(
      isAuthorizedCronRequest(
        new Request("https://example.com/api/strategy/scan", {
          headers: { authorization: "Bearer wrong-secret" },
        }),
      ),
    ).toBe(false);
  });

  it("accepts strategy API keys through x-api-key", () => {
    process.env.ULTRON_STRATEGY_API_KEY = "strategy-test-key";

    expect(
      isAuthorizedStrategyRequest(
        new Request("https://example.com/api/strategy/scan", {
          headers: { "x-api-key": "strategy-test-key" },
        }),
      ),
    ).toBe(true);
  });
});
