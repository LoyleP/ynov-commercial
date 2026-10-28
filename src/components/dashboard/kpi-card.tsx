import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { domId } from "@/lib/dom-id";
import { formatChange, formatNumber, formatPercent, formatPoints } from "@/lib/format";
import type { Kpi } from "@/lib/leads/stats";
import { cn } from "@/lib/utils";
import { fr } from "@/messages/fr";

export function KpiCard({
  id,
  label,
  kpi,
  asRate = false,
  previousYear,
}: {
  id: string;
  label: string;
  kpi: Kpi;
  /** The value is a ratio (shown as a percentage, change in points). */
  asRate?: boolean;
  previousYear: number;
}) {
  const { value, previous } = kpi;
  const direction = previous === null ? 0 : Math.sign(Number((value - previous).toFixed(6)));
  const Icon = direction > 0 ? ArrowUp : direction < 0 ? ArrowDown : Minus;
  const change =
    previous === null
      ? null
      : asRate
        ? formatPoints(value, previous, fr.dashboard.kpis.points)
        : formatChange(value, previous);
  return (
    <Card id={domId("kpi-card", id)} size="sm">
      <CardContent className="space-y-1">
        <p id={domId("kpi-card", id, "label")} className="text-muted-foreground text-sm">
          {label}
        </p>
        <p id={domId("kpi-card", id, "value")} className="text-3xl font-semibold tabular-nums">
          {asRate ? formatPercent(value) : formatNumber(value)}
        </p>
        <p
          id={domId("kpi-card", id, "change")}
          className="text-muted-foreground flex flex-wrap items-center gap-x-1.5 text-xs"
        >
          {change === null ? (
            fr.dashboard.kpis.noPrevious
          ) : (
            <>
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-medium",
                  direction > 0 && "text-success-foreground",
                  direction < 0 && "text-destructive",
                )}
              >
                <Icon aria-hidden className="size-3" />
                {change}
              </span>
              {fr.dashboard.kpis.vs(previousYear)}
            </>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
