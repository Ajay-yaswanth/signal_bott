import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  parseTradingViewWebhook,
  TradingViewWebhookAuthError,
} from "@/lib/market-data/trading-view";
import { generateAutomatedSignal } from "@/lib/strategy/generator";

export async function POST(request: Request) {
  if (process.env.TRADINGVIEW_WEBHOOK_ENABLED !== "true") {
    return NextResponse.json(
      { error: "TradingView webhook is disabled." },
      { status: 404 },
    );
  }

  try {
    const snapshot = parseTradingViewWebhook(
      await request.json().catch(() => null),
    );
    const result = await generateAutomatedSignal(snapshot);

    return NextResponse.json(result, { status: result.created ? 201 : 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: error.issues[0]?.message ?? "Invalid TradingView payload.",
        },
        { status: 400 },
      );
    }

    if (error instanceof TradingViewWebhookAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    console.error("TradingView webhook failed.", error);
    return NextResponse.json(
      { error: "TradingView webhook processing failed." },
      { status: 500 },
    );
  }
}
