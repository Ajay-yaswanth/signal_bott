import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildSignalHistoryWhere,
  parseSignalHistoryFilters,
} from "@/lib/signal-history";

function csvCell(value: string | number | null) {
  const text = value === null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const filters = parseSignalHistoryFilters(new URL(request.url).searchParams);
  const signals = await prisma.signal.findMany({
    where: buildSignalHistoryWhere(filters),
    orderBy: { createdAt: "desc" },
  });
  const header = [
    "Symbol",
    "Direction",
    "Entry",
    "Stop Loss",
    "TP1",
    "TP2",
    "TP3",
    "Confidence",
    "Bias",
    "Reason",
    "Status",
    "Result",
    "Points",
    "Created At",
  ];
  const rows = signals.map((signal) => [
    signal.symbol,
    signal.direction,
    signal.entry?.toString() ?? null,
    signal.stopLoss?.toString() ?? null,
    signal.tp1?.toString() ?? null,
    signal.tp2?.toString() ?? null,
    signal.tp3?.toString() ?? null,
    signal.confidence,
    signal.bias,
    signal.reason,
    signal.status,
    signal.result,
    signal.points?.toString() ?? null,
    signal.createdAt.toISOString(),
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((value) => csvCell(value)).join(","))
    .join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ultron-signal-history-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
