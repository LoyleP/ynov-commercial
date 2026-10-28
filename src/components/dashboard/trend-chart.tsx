"use client";

import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { Dashboard } from "@/lib/leads/stats";
import { fr } from "@/messages/fr";

export function TrendChart({
  trend,
  year,
  hasPrevious,
}: {
  trend: Dashboard["trend"];
  year: number;
  hasPrevious: boolean;
}) {
  const config = {
    current: { label: fr.dashboard.trend.series(year), color: "var(--primary)" },
    previous: { label: fr.dashboard.trend.series(year - 1), color: "var(--muted-foreground)" },
  } satisfies ChartConfig;
  const data = trend.map(({ month, current, previous }) => ({
    month: fr.dashboard.trend.months[month],
    current,
    previous,
  }));
  return (
    <Card id="trend-chart">
      <CardHeader>
        <CardTitle id="trend-chart-title">{fr.dashboard.trend.title}</CardTitle>
        <CardDescription>{fr.dashboard.trend.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer id="trend-chart-plot" config={config} className="aspect-auto h-64 w-full">
          <ComposedChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} width={36} />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              dataKey="current"
              type="monotone"
              stroke="var(--color-current)"
              fill="var(--color-current)"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            {hasPrevious ? (
              <Line
                dataKey="previous"
                type="monotone"
                stroke="var(--color-previous)"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            ) : null}
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
