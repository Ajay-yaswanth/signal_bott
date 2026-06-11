import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcrypt";

import {
  PrismaClient,
  SignalDirection,
  SignalResult,
  SignalStatus,
  SubscriptionStatus,
  UserRole,
} from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: `${process.env.DATABASE_URL}`,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const now = new Date();
  const trialEndsAt = new Date(now);
  trialEndsAt.setDate(trialEndsAt.getDate() + 3);

  const currentPeriodEnd = new Date(now);
  currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

  const adminPasswordHash = await hash("UltronAdmin123!", 12);
  const demoPasswordHash = await hash("UltronTrader123!", 12);
  const daysAgo = (days: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() - days);
    return date;
  };

  const admin = await prisma.user.upsert({
    where: { email: "admin@ultronsignals.com" },
    update: {
      passwordHash: adminPasswordHash,
    },
    create: {
      name: "ULTRON Admin",
      email: "admin@ultronsignals.com",
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      trialEndsAt,
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: "trader@ultronsignals.com" },
    update: {
      passwordHash: demoPasswordHash,
    },
    create: {
      name: "Demo Trader",
      email: "trader@ultronsignals.com",
      passwordHash: demoPasswordHash,
      role: UserRole.USER,
      trialEndsAt,
    },
  });

  await prisma.subscription.upsert({
    where: { razorpaySubscriptionId: "sub_ultron_demo_pro" },
    update: {
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd,
    },
    create: {
      userId: demoUser.id,
      status: SubscriptionStatus.ACTIVE,
      razorpayCustomerId: "cust_ultron_demo",
      razorpaySubscriptionId: "sub_ultron_demo_pro",
      currentPeriodEnd,
    },
  });

  await prisma.payment.upsert({
    where: { razorpayPaymentId: "pay_ultron_demo_001" },
    update: {},
    create: {
      userId: demoUser.id,
      razorpayPaymentId: "pay_ultron_demo_001",
      amount: 14900,
      currency: "INR",
      status: "captured",
    },
  });

  const signals = [
    {
      id: "seed-signal-xauusd-buy-active",
      data: {
        symbol: "XAUUSD",
        direction: SignalDirection.BUY,
        entry: "2338.40",
        stopLoss: "2327.20",
        tp1: "2348.00",
        tp2: "2356.50",
        tp3: "2364.80",
        confidence: 92,
        bias: "Bullish liquidity reclaim",
        reason:
          "London sweep reclaimed with buyers holding above session VWAP and momentum confirming higher-low structure.",
        status: SignalStatus.ACTIVE,
        result: SignalResult.PENDING,
        points: null,
      },
    },
    {
      id: "seed-signal-xauusd-sell-active",
      data: {
        symbol: "XAUUSD",
        direction: SignalDirection.SELL,
        entry: "2368.10",
        stopLoss: "2378.60",
        tp1: "2358.00",
        tp2: "2351.20",
        tp3: "2346.00",
        confidence: 81,
        bias: "Bearish rejection plan",
        reason:
          "NY session failed to accept above prior-day high after an upper imbalance rejection.",
        status: SignalStatus.ACTIVE,
        result: SignalResult.PENDING,
        points: null,
      },
    },
    {
      id: "seed-signal-xauusd-buy-closed",
      data: {
        symbol: "XAUUSD",
        direction: SignalDirection.BUY,
        entry: "2316.80",
        stopLoss: "2307.40",
        tp1: "2326.40",
        tp2: "2335.10",
        tp3: "2342.20",
        confidence: 88,
        bias: "Trend continuation",
        reason:
          "Gold held demand after a stop sweep and completed continuation into the second target.",
        status: SignalStatus.CLOSED,
        result: SignalResult.TP2,
        points: "18.30",
      },
    },
    {
      id: "seed-signal-btcusdt-wait",
      data: {
        symbol: "BTCUSDT",
        direction: SignalDirection.WAIT,
        entry: null,
        stopLoss: null,
        tp1: null,
        tp2: null,
        tp3: null,
        confidence: 64,
        bias: "Range compression",
        reason:
          "Market is inside a noisy range. Waiting for clean liquidity break before issuing direction.",
        status: SignalStatus.ACTIVE,
        result: SignalResult.PENDING,
        points: null,
      },
    },
    {
      id: "seed-signal-xauusd-sell-sl",
      data: {
        symbol: "XAUUSD",
        direction: SignalDirection.SELL,
        entry: "2352.20",
        stopLoss: "2361.70",
        tp1: "2344.00",
        tp2: "2336.20",
        tp3: "2328.40",
        confidence: 72,
        bias: "Bearish premium rejection",
        reason:
          "Sell-side setup invalidated after price accepted above the premium array and displaced through the stop.",
        status: SignalStatus.CLOSED,
        result: SignalResult.SL,
        points: "-9.50",
        createdAt: daysAgo(4),
      },
    },
    {
      id: "seed-signal-xauusd-buy-tp3",
      data: {
        symbol: "XAUUSD",
        direction: SignalDirection.BUY,
        entry: "2298.50",
        stopLoss: "2289.30",
        tp1: "2308.00",
        tp2: "2317.80",
        tp3: "2329.60",
        confidence: 90,
        bias: "Bullish discount accumulation",
        reason:
          "Price swept sell-side liquidity, filled the discount fair-value gap, and expanded through all targets.",
        status: SignalStatus.CLOSED,
        result: SignalResult.TP3,
        points: "31.10",
        createdAt: daysAgo(8),
      },
    },
    {
      id: "seed-signal-xauusd-sell-be",
      data: {
        symbol: "XAUUSD",
        direction: SignalDirection.SELL,
        entry: "2341.60",
        stopLoss: "2349.80",
        tp1: "2334.20",
        tp2: "2327.00",
        tp3: "2318.50",
        confidence: 69,
        bias: "Neutral-to-bearish distribution",
        reason:
          "Initial displacement stalled after entry, so risk was removed at breakeven before reversal.",
        status: SignalStatus.CLOSED,
        result: SignalResult.BE,
        points: "0.00",
        createdAt: daysAgo(12),
      },
    },
  ];

  await Promise.all(
    signals.map(({ id, data }) =>
      prisma.signal.upsert({
        where: { id },
        update: data,
        create: { id, ...data },
      }),
    ),
  );

  await Promise.all(
    [
      {
        id: "seed-audit-admin-created",
        userId: admin.id,
        action: "SEED_ADMIN_CREATED",
        metadata: { source: "prisma/seed.ts" },
      },
      {
        id: "seed-audit-subscription-activated",
        userId: demoUser.id,
        action: "DEMO_SUBSCRIPTION_ACTIVATED",
        metadata: {
          razorpayCustomerId: "cust_ultron_demo",
          razorpaySubscriptionId: "sub_ultron_demo_pro",
        },
      },
    ].map(({ id, ...data }) =>
      prisma.auditLog.upsert({
        where: { id },
        update: data,
        create: { id, ...data },
      }),
    ),
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
