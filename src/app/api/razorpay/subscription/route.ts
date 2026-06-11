import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createRazorpaySubscription,
  getRazorpayConfig,
  mapRazorpaySubscriptionStatus,
  unixTimestampToDate,
} from "@/lib/razorpay";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      subscriptions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const now = new Date();
  const activeSubscription = user.subscriptions.find(
    (subscription) =>
      subscription.status === "ACTIVE" &&
      (!subscription.currentPeriodEnd || subscription.currentPeriodEnd > now),
  );

  if (activeSubscription) {
    return NextResponse.json(
      { error: "You already have an active subscription." },
      { status: 409 },
    );
  }

  try {
    const razorpaySubscription = await createRazorpaySubscription({
      userId: user.id,
      email: user.email,
    });
    const localSubscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        status: mapRazorpaySubscriptionStatus(razorpaySubscription.status),
        razorpayCustomerId: razorpaySubscription.customer_id ?? null,
        razorpaySubscriptionId: razorpaySubscription.id,
        currentPeriodEnd: unixTimestampToDate(
          razorpaySubscription.current_end,
        ),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "RAZORPAY_SUBSCRIPTION_CREATED",
        metadata: {
          subscriptionId: localSubscription.razorpaySubscriptionId,
          status: localSubscription.status,
        },
      },
    });

    return NextResponse.json({
      keyId: getRazorpayConfig().keyId,
      subscriptionId: razorpaySubscription.id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Unable to create Razorpay subscription", error);
    return NextResponse.json(
      { error: "Unable to start Razorpay checkout. Try again shortly." },
      { status: 502 },
    );
  }
}
