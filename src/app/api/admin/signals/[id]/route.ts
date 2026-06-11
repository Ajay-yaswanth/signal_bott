import { NextResponse } from "next/server";

import { getAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { updateAdminSignalSchema } from "@/lib/validators";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();

  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body: unknown = await request.json().catch(() => null);
  const parsed = updateAdminSignalSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid signal update." },
      { status: 400 },
    );
  }

  const existing = await prisma.signal.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      result: true,
      stopLoss: true,
      tp1: true,
      tp2: true,
      tp3: true,
      points: true,
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Signal not found." }, { status: 404 });
  }

  const signal = await prisma.$transaction(async (transaction) => {
    const updated = await transaction.signal.update({
      where: { id },
      data: parsed.data,
      select: {
        id: true,
        status: true,
        result: true,
      },
    });

    await transaction.auditLog.create({
      data: {
        userId: admin.id,
        action:
          parsed.data.status === "CLOSED"
            ? "SIGNAL_CLOSED"
            : "SIGNAL_UPDATED",
        metadata: {
          signalId: existing.id,
          before: {
            status: existing.status,
            result: existing.result,
            stopLoss: existing.stopLoss?.toString() ?? null,
            tp1: existing.tp1?.toString() ?? null,
            tp2: existing.tp2?.toString() ?? null,
            tp3: existing.tp3?.toString() ?? null,
            points: existing.points?.toString() ?? null,
          },
          after: {
            status: parsed.data.status,
            result: parsed.data.result,
            stopLoss: parsed.data.stopLoss,
            tp1: parsed.data.tp1,
            tp2: parsed.data.tp2,
            tp3: parsed.data.tp3,
            points: parsed.data.points,
          },
        },
      },
    });

    return updated;
  });

  return NextResponse.json({ signal });
}
