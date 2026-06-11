import { hash } from "bcrypt";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid registration details." },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 3);

  const passwordHash = await hash(parsed.data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash,
      trialEndsAt,
      subscriptions: {
        create: {
          status: "TRIAL",
          currentPeriodEnd: trialEndsAt,
        },
      },
      auditLogs: {
        create: {
          action: "USER_REGISTERED",
          metadata: {
            source: "credentials",
            trialDays: 3,
          },
        },
      },
    },
    select: {
      id: true,
      email: true,
      trialEndsAt: true,
    },
  });

  return NextResponse.json({ user }, { status: 201 });
}
