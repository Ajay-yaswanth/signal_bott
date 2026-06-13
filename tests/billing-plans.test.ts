import { describe, expect, it } from "vitest";

import { BILLING_PLANS, PAID_TRIAL } from "@/lib/billing-plans";

describe("billing catalog", () => {
  it("defines a ₹9 two-day paid trial", () => {
    expect(PAID_TRIAL.offerAmount).toBe(900);
    expect(PAID_TRIAL.originalAmount).toBe(8_900);
    expect(PAID_TRIAL.durationDays).toBe(2);
  });

  it("defines monthly and quarterly plans for all three tiers", () => {
    expect(BILLING_PLANS).toHaveLength(6);
    expect(BILLING_PLANS.filter((plan) => plan.billingCycle === "MONTHLY")).toHaveLength(3);
    expect(BILLING_PLANS.filter((plan) => plan.billingCycle === "QUARTERLY")).toHaveLength(3);
  });

  it("marks Pro as most popular and stores quarterly discounts", () => {
    expect(
      BILLING_PLANS.filter((plan) => plan.mostPopular).every(
        (plan) => plan.tier === "PRO",
      ),
    ).toBe(true);
    expect(
      BILLING_PLANS.filter((plan) => plan.billingCycle === "QUARTERLY").every(
        (plan) => plan.amount < plan.originalAmount,
      ),
    ).toBe(true);
  });
});
