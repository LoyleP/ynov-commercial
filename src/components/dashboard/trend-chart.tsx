"use client";

import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatDay, formatMonthShort } from "@/lib/format";
import type { Dashboard } from "@/lib/leads/stats";
import { fr } from "@/messages/fr";

const config = {
  current: { label: fr.dashboard.trend.current, color: "var(--primary)" },
  previous: { label: fr.dashboard.trend.compare, color: "var(--muted-foreground)" },
} satisfies ChartConfig;

export function TrendChart({
  trend,
  granularity,
  hasPrevious,
}: {
  trend: Dashboard["trend"];
  granularity: Dashboard["granularity"];
  hasPrevious: boolean;
}) {
  const label = (start: string) =>
    granularity === "month" ? formatMonthShort(start) : formatDay(start);
  const data = trend.map(({ start, current, previous }) => ({
    label: label(start),
    full: granularity === "week" ? fr.dashboard.trend.weekOf(formatDay(start)) : label(start),
    current,
    previous,
  }));
  return (
    <Card id="trend-chart">
      <CardHeader>
        <CardTitle id="trend-chart-title">{fr.dashboard.trend.title[granularity]}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer id="trend-chart-plot" config={config} className="aspect-auto h-64 w-full">
          <ComposedChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
            />
            <YAxis tickLine={false} axisLine={false} width={36} allowDecimals={false} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(_, payload) => payload[0]?.payload.full}
                />
              }
            />
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
