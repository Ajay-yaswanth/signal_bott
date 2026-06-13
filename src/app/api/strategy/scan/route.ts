import { NextResponse } from "next/server";

import {
  isAuthorizedCronRequest,
  isAuthorizedStrategyRequest,
} from "@/lib/strategy-auth";
import { getConfiguredMarketDataProvider } from "@/lib/market-data";
import { generateAutomatedSignal } from "@/lib/strategy/generator";
import { marketSnapshotSchema } from "@/lib/strategy/market-snapshot";

async function runScan(body: unknown) {
  const parsed = marketSnapshotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Invalid market snapshot.",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  try {
    const result = await generateAutomatedSignal(parsed.data);
    return NextResponse.json(result, { status: result.created ? 201 : 200 });
  } catch (error) {
    console.error("Automated strategy scan failed.", error);
    return NextResponse.json(
      { error: "Automated strategy scan failed." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!isAuthorizedStrategyRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return runScan(await request.json().catch(() => null));
}

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const provider = getConfiguredMarketDataProvider();
    return runScan(await provider.getSnapshot());
  } catch (error) {
    console.error("Configured market data provider failed.", error);
    return NextResponse.json(
      { error: "Configured market data provider failed." },
      { status: 502 },
    );
  }
}
