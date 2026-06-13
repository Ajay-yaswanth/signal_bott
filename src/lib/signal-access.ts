import "server-only";

type SignalAccessUser = {
  trialEndsAt: Date | null;
  subscriptions: Array<{
    status: "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELLED" | "EXPIRED";
    currentPeriodEnd: Date | null;
  }>;
};

export function hasActiveSignalAccess(user: SignalAccessUser, at = new Date()) {
  const paidTrialActive = Boolean(user.trialEndsAt && user.trialEndsAt > at);
  const activeSubscription = user.subscriptions.some(
    (subscription) =>
      subscription.status === "ACTIVE" &&
      (!subscription.currentPeriodEnd || subscription.currentPeriodEnd > at),
  );

  return paidTrialActive || activeSubscription;
}
