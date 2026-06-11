"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { month: "Jan", equity: 100000, drawdown: 2.1 },
  { month: "Feb", equity: 107400, drawdown: 1.5 },
  { month: "Mar", equity: 112900, drawdown: 2.8 },
  { month: "Apr", equity: 121200, drawdown: 1.1 },
  { month: "May", equity: 128800, drawdown: 1.9 },
  { month: "Jun", equity: 136500, drawdown: 1.3 },
];

export function PerformanceChartClient() {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <AreaChart data={data} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="equity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d6a93f" stopOpacity={0.38} />
              <stop offset="95%" stopColor="#d6a93f" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(226, 232, 240, 0.12)" strokeDasharray="3 3" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="#94a3b8" />
          <YAxis
            tickLine={false}
            axisLine={false}
            stroke="#94a3b8"
            tickFormatter={(value) => `$${Number(value) / 1000}k`}
          />
          <Tooltip
            formatter={(value) => [`$${Number(value).toLocaleString()}`, "Equity"]}
            contentStyle={{
              borderRadius: "8px",
              background: "#080b13",
              border: "1px solid rgba(214, 169, 63, 0.28)",
              color: "#f8fafc",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
            }}
          />
          <Area
            type="monotone"
            dataKey="equity"
            stroke="#d6a93f"
            strokeWidth={2}
            fill="url(#equity)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
