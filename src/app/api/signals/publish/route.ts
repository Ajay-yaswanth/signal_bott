import { NextResponse } from "next/server";

import { isAuthorizedBotRequest } from "@/lib/bot-auth";
import { prisma } from "@/lib/prisma";
import { botPublishSignalSchema } from "@/lib/validators";

export async function POST(request: Request) {
  if (!isAuthorizedBotRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = botPublishSignalSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid signal payload.",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  const signal = await prisma.signal.create({
    data: {
      ...parsed.data,
      status: "ACTIVE",
      result: "PENDING",
    },
    select: {
      id: true,
      symbol: true,
      direction: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json(
    {
      success: true,
      signal: {
        ...signal,
        createdAt: signal.createdAt.toISOString(),
      },
    },
    { status: 201 },
  );
}
