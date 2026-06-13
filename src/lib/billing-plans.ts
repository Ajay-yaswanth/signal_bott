export const PAID_TRIAL = {
  originalAmount: 8_900,
  offerAmount: 900,
  durationDays: 2,
} as const;

export const BILLING_PLANS = [
  {
    code: "starter-monthly",
    tier: "STARTER",
    billingCycle: "MONTHLY",
    name: "Starter",
    description: "A focused signal flow for disciplined part-time traders.",
    amount: 69_900,
    originalAmount: 69_900,
    intervalMonths: 1,
    sniperSignalsDay: 2,
    normalSignalsMin: 8,
    normalSignalsMax: 8,
    targetPerformance: "Up to 70%",
    mostPopular: false,
  },
  {
    code: "pro-monthly",
    tier: "PRO",
    billingCycle: "MONTHLY",
    name: "Pro",
    description: "Higher-frequency access for active trading sessions.",
    amount: 99_900,
    originalAmount: 99_900,
    intervalMonths: 1,
    sniperSignalsDay: 4,
    normalSignalsMin: 11,
    normalSignalsMax: 16,
    targetPerformance: "Up to 80%",
    mostPopular: true,
  },
  {
    code: "prime-elite-monthly",
    tier: "PRIME_ELITE",
    billingCycle: "MONTHLY",
    name: "Prime Elite",
    description: "Maximum daily access for experienced signal users.",
    amount: 129_900,
    originalAmount: 129_900,
    intervalMonths: 1,
    sniperSignalsDay: 6,
    normalSignalsMin: 20,
    normalSignalsMax: 20,
    targetPerformance: "85% to 90%",
    mostPopular: false,
  },
  {
    code: "starter-quarterly",
    tier: "STARTER",
    billingCycle: "QUARTERLY",
    name: "Starter",
    description: "Three months of focused access at a discounted price.",
    amount: 179_900,
    originalAmount: 209_700,
    intervalMonths: 3,
    sniperSignalsDay: 2,
    normalSignalsMin: 8,
    normalSignalsMax: 8,
    targetPerformance: "Up to 70%",
    mostPopular: false,
  },
  {
    code: "pro-quarterly",
    tier: "PRO",
    billingCycle: "QUARTERLY",
    name: "Pro",
    description: "Three months of active-session access at a discounted price.",
    amount: 249_900,
    originalAmount: 299_700,
    intervalMonths: 3,
    sniperSignalsDay: 4,
    normalSignalsMin: 11,
    normalSignalsMax: 16,
    targetPerformance: "Up to 80%",
    mostPopular: true,
  },
  {
    code: "prime-elite-quarterly",
    tier: "PRIME_ELITE",
    billingCycle: "QUARTERLY",
    name: "Prime Elite",
    description: "Three months of maximum access at a discounted price.",
    amount: 319_900,
    originalAmount: 389_700,
    intervalMonths: 3,
    sniperSignalsDay: 6,
    normalSignalsMin: 20,
    normalSignalsMax: 20,
    targetPerformance: "85% to 90%",
    mostPopular: false,
  },
] as const;

export type BillingPlanCode = (typeof BILLING_PLANS)[number]["code"];

export function findBillingPlan(code: string) {
  return BILLING_PLANS.find((plan) => plan.code === code);
}

export function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}
