import { NextResponse } from "next/server";

import { getAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { createAdminSignalSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const admin = await getAdminUser();

  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = createAdminSignalSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid signal details." },
      { status: 400 },
    );
  }

  const signal = await prisma.$transaction(async (transaction) => {
    const created = await transaction.signal.create({
      data: {
        ...parsed.data,
        status: "ACTIVE",
        result: "PENDING",
      },
      select: {
        id: true,
        symbol: true,
        direction: true,
      },
    });

    await transaction.auditLog.create({
      data: {
        userId: admin.id,
        action: "SIGNAL_CREATED",
        metadata: {
          signalId: created.id,
          symbol: created.symbol,
          direction: created.direction,
        },
      },
    });

    return created;
  });

  return NextResponse.json({ signal }, { status: 201 });
}
