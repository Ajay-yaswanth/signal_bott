import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cancelRazorpaySubscription } from "@/lib/razorpay";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
      razorpaySubscriptionId: { not: null },
      status: { in: ["TRIAL", "ACTIVE", "PAST_DUE"] },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!subscription?.razorpaySubscriptionId) {
    return NextResponse.json(
      { error: "No cancellable subscription found." },
      { status: 404 },
    );
  }

  try {
    await cancelRazorpaySubscription(subscription.razorpaySubscriptionId, true);
    await prisma.$transaction([
      prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "RAZORPAY_SUBSCRIPTION_CANCEL_REQUESTED",
          metadata: {
            subscriptionId: subscription.razorpaySubscriptionId,
            cancelAtPeriodEnd: true,
          },
        },
      }),
    ]);

    return NextResponse.json({
      cancelled: true,
      message: "Autopay cancellation scheduled for the end of the current access period.",
    });
  } catch (error) {
    console.error("Unable to cancel Razorpay subscription", error);
    return NextResponse.json(
      { error: "Unable to cancel subscription right now." },
      { status: 502 },
    );
  }
}
