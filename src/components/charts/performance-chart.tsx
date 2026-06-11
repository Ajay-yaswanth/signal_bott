"use client";

import dynamic from "next/dynamic";

const DynamicPerformanceChart = dynamic(
  () =>
    import("@/components/charts/performance-chart-client").then(
      (module) => module.PerformanceChartClient,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[320px] w-full animate-pulse rounded-lg bg-muted" />
    ),
  },
);

export function PerformanceChart() {
  return <DynamicPerformanceChart />;
}
