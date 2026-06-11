import { Download, Target, TrendingUp } from "lucide-react";

import { PerformanceChart } from "@/components/charts/performance-chart";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const rows = [
  ["Crypto momentum", "43", "76.7%", "2.3R", "$24,800"],
  ["Equities swing", "18", "66.1%", "1.7R", "$8,950"],
  ["Metals intraday", "12", "70.0%", "1.9R", "$2,740"],
];

export const metadata = {
  title: "Performance",
  description:
    "Review ULTRON Signals performance, equity progression, and risk analytics.",
  robots: { index: false, follow: false },
};

export default function PerformancePage() {
  return (
    <AppShell active="/performance">
      <PageHeader
        eyebrow="Analytics"
        title="Performance"
        description="Measure signal groups by return profile, drawdown, hit rate, and contribution to desk PnL."
        action={
          <Button variant="outline">
            <Download aria-hidden="true" />
            Export
          </Button>
        }
      />

      <Tabs defaultValue="equity">
        <TabsList>
          <TabsTrigger value="equity">Equity</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="risk">Risk</TabsTrigger>
        </TabsList>
        <TabsContent value="equity">
          <Card>
            <CardHeader className="flex-row flex-wrap items-center justify-between">
              <CardTitle>Portfolio equity</CardTitle>
              <Badge variant="success">
                <TrendingUp className="mr-1 size-3" aria-hidden="true" />
                +36.5% YTD
              </Badge>
            </CardHeader>
            <CardContent>
              <PerformanceChart />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sources">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-sm">
                  <thead className="border-b bg-muted/60 text-left text-xs uppercase text-muted-foreground">
                    <tr>
                      {["Source", "Signals", "Win rate", "Avg R", "PnL"].map((heading) => (
                        <th key={heading} className="px-4 py-3 font-medium">{heading}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row[0]} className="border-b last:border-0">
                        {row.map((cell, index) => (
                          <td key={`${row[0]}-${cell}`} className="px-4 py-4 font-medium">
                            {index === 0 ? <span className="font-semibold">{cell}</span> : cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="risk">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["Max drawdown", "4.8%", "Trailing 90 days"],
              ["Risk per signal", "0.8%", "Desk policy"],
              ["Sharpe estimate", "1.92", "Rolling 6 months"],
            ].map(([label, value, detail]) => (
              <Card key={label}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="size-4" aria-hidden="true" />
                    {label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
