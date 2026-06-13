import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasActiveSignalAccess } from "@/lib/signal-access";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user, signal] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscriptions: {
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.signal.findFirst({
      where: {
        symbol: "XAUUSD",
        status: "ACTIVE",
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),
  ]);

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  if (!hasActiveSignalAccess(user)) {
    return NextResponse.json(
      {
        success: false,
        error: "Active subscription required.",
        access: {
          status: "EXPIRED",
          upgradeUrl: "/pricing",
        },
      },
      { status: 403 },
    );
  }

  if (!signal) {
    return NextResponse.json(
      { success: false, error: "No active XAUUSD signal." },
      { status: 404 },
    );
  }

  const etag = `"${signal.id}:${signal.updatedAt.getTime()}"`;

  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, {
      status: 304,
      headers: {
        ETag: etag,
        "Cache-Control": "private, no-cache",
      },
    });
  }

  return NextResponse.json(
    {
      success: true,
      signal: {
        id: signal.id,
        symbol: signal.symbol,
        direction: signal.direction,
        entry: signal.entry?.toString() ?? null,
        stopLoss: signal.stopLoss?.toString() ?? null,
        tp1: signal.tp1?.toString() ?? null,
        tp2: signal.tp2?.toString() ?? null,
        tp3: signal.tp3?.toString() ?? null,
        confidence: signal.confidence,
        bias: signal.bias,
        reason: signal.reason,
        status: signal.status,
        result: signal.result,
        createdAt: signal.createdAt.toISOString(),
        updatedAt: signal.updatedAt.toISOString(),
      },
    },
    {
      headers: {
        ETag: etag,
        "Cache-Control": "private, no-cache",
      },
    },
  );
}
