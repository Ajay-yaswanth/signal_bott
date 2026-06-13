import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { findBillingPlan, PAID_TRIAL } from "@/lib/billing-plans";
import { prisma } from "@/lib/prisma";
import {
  createRazorpayPlan,
  createRazorpaySubscription,
  getRazorpayConfig,
  mapRazorpaySubscriptionStatus,
  unixTimestampToDate,
} from "@/lib/razorpay";

const requestSchema = z.object({
  planCode: z.string().min(1),
  autopayConsent: z.literal(true),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Select a plan and consent to recurring autopay." },
      { status: 400 },
    );
  }

  const plan = findBillingPlan(parsed.data.planCode);
  if (!plan) {
    return NextResponse.json({ error: "Invalid plan selected." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { subscriptions: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }
  if (user.subscriptions.some((subscription) => subscription.status === "ACTIVE")) {
    return NextResponse.json(
      { error: "You already have an active subscription." },
      { status: 409 },
    );
  }
  if (user.trialEndsAt) {
    return NextResponse.json(
      { error: "The paid trial has already been used on this account." },
      { status: 409 },
    );
  }

  try {
    const razorpayPlan = await createRazorpayPlan(plan);
    const startAt = new Date(Date.now() + PAID_TRIAL.durationDays * 86_400_000);
    const razorpaySubscription = await createRazorpaySubscription({
      planId: razorpayPlan.id,
      planCode: plan.code,
      intervalMonths: plan.intervalMonths,
      userId: user.id,
      email: user.email,
      startAt,
    });
    const localSubscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        status: mapRazorpaySubscriptionStatus(razorpaySubscription.status),
        razorpayCustomerId: razorpaySubscription.customer_id ?? null,
        razorpaySubscriptionId: razorpaySubscription.id,
        currentPeriodEnd: unixTimestampToDate(razorpaySubscription.current_end),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "RAZORPAY_PAID_TRIAL_SUBSCRIPTION_CREATED",
        metadata: {
          subscriptionId: localSubscription.razorpaySubscriptionId,
          planCode: plan.code,
          planName: plan.name,
          paidTrialAmount: PAID_TRIAL.offerAmount,
          subscriptionStartAt: startAt.toISOString(),
          autopayConsent: true,
        },
      },
    });

    return NextResponse.json({
      keyId: getRazorpayConfig().keyId,
      subscriptionId: razorpaySubscription.id,
      name: user.name,
      email: user.email,
      planName: plan.name,
      startAt: startAt.toISOString(),
    });
  } catch (error) {
    console.error("Unable to create Razorpay paid-trial subscription", error);
    return NextResponse.json(
      { error: "Unable to start Razorpay checkout. Try again shortly." },
      { status: 502 },
    );
  }
}
