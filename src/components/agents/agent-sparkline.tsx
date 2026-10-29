"use client";

import { Area, AreaChart, Line, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatDay, formatMonthShort, formatNumber, formatPercent } from "@/lib/format";
import type { Metric } from "@/lib/leads/agents";
import type { AgentPoint } from "@/lib/leads/agents";
import type { Granularity } from "@/lib/leads/stats";
import { fr } from "@/messages/fr";

const config = {
  value: { label: fr.dashboard.trend.current, color: "var(--primary)" },
  previous: { label: fr.dashboard.trend.compare, color: "var(--muted-foreground)" },
} satisfies ChartConfig;

/** The evolution of one figure over the period, with the compared stretch dashed behind it. */
export function AgentSparkline({
  id,
  series,
  metric,
  granularity,
}: {
  id: string;
  series: AgentPoint[];
  metric: Metric;
  granularity: Granularity;
}) {
  const format = metric === "rate" ? formatPercent : formatNumber;
  const data = series.map((point) => ({
    label:
      granularity === "month"
        ? formatMonthShort(point.start)
        : granularity === "week"
          ? fr.dashboard.trend.weekOf(formatDay(point.start))
          : formatDay(point.start),
    value: point.current[metric],
    previous: point.previous ? point.previous[metric] : null,
  }));
  const hasPrevious = data.some((point) => point.previous !== null);
  return (
    <ChartContainer id={id} config={config} className="aspect-auto h-12 w-full min-w-36">
      <AreaChart data={data} margin={{ top: 4, right: 2, bottom: 4, left: 2 }}>
        <XAxis dataKey="label" hide />
        <YAxis hide domain={[0, "auto"]} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              indicator="line"
              formatter={(value, name) => (
                <div className="flex w-full items-center justify-between gap-3">
                  <span className="text-muted-foreground">
                    {config[name as keyof typeof config]?.label}
                  </span>
                  <span className="font-medium tabular-nums">{format(Number(value))}</span>
                </div>
              )}
            />
          }
        />
        <Area
          dataKey="value"
          type="monotone"
          stroke="var(--color-value)"
          fill="var(--color-value)"
          fillOpacity={0.15}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
        {hasPrevious ? (
          <Line
            dataKey="previous"
            type="monotone"
            stroke="var(--color-previous)"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            dot={false}
            isAnimationActive={false}
          />
        ) : null}
      </AreaChart>
    </ChartContainer>
  );
}
