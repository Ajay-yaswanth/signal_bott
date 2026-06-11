import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  fetchRazorpayPayment,
  fetchRazorpaySubscription,
  mapRazorpaySubscriptionStatus,
  unixTimestampToDate,
  verifyRazorpayCheckoutSignature,
} from "@/lib/razorpay";
import { razorpayCheckoutVerificationSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = razorpayCheckoutVerificationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid Razorpay checkout response." },
      { status: 400 },
    );
  }

  const paymentId = parsed.data.razorpay_payment_id;
  const subscriptionId = parsed.data.razorpay_subscription_id;

  if (
    !verifyRazorpayCheckoutSignature({
      paymentId,
      subscriptionId,
      signature: parsed.data.razorpay_signature,
    })
  ) {
    return NextResponse.json(
      { error: "Invalid Razorpay signature." },
      { status: 400 },
    );
  }

  const localSubscription = await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
      razorpaySubscriptionId: subscriptionId,
    },
  });

  if (!localSubscription) {
    return NextResponse.json(
      { error: "Subscription does not belong to this account." },
      { status: 403 },
    );
  }

  try {
    const [razorpaySubscription, payment] = await Promise.all([
      fetchRazorpaySubscription(subscriptionId),
      fetchRazorpayPayment(paymentId),
    ]);
    const subscriptionStatus = mapRazorpaySubscriptionStatus(
      razorpaySubscription.status,
    );

    await prisma.$transaction([
      prisma.subscription.update({
        where: { id: localSubscription.id },
        data: {
          status: subscriptionStatus,
          razorpayCustomerId: razorpaySubscription.customer_id ?? null,
          currentPeriodEnd: unixTimestampToDate(
            razorpaySubscription.current_end,
          ),
        },
      }),
      prisma.payment.upsert({
        where: { razorpayPaymentId: payment.id },
        update: {
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
        },
        create: {
          userId: session.user.id,
          razorpayPaymentId: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
        },
      }),
      prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "RAZORPAY_CHECKOUT_VERIFIED",
          metadata: {
            subscriptionId,
            paymentId,
            subscriptionStatus,
            paymentStatus: payment.status,
          },
        },
      }),
    ]);

    return NextResponse.json({ status: subscriptionStatus });
  } catch (error) {
    console.error("Unable to verify Razorpay checkout", error);
    return NextResponse.json(
      { error: "Checkout succeeded, but verification is still pending." },
      { status: 502 },
    );
  }
}
