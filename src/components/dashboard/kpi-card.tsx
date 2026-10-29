import { DeltaPill } from "@/components/dashboard/delta-pill";
import { Card, CardContent } from "@/components/ui/card";
import { domId } from "@/lib/dom-id";
import { formatNumber, formatPercent } from "@/lib/format";
import type { Kpi } from "@/lib/leads/stats";
import { fr } from "@/messages/fr";

export function KpiCard({
  id,
  label,
  kpi,
  asRate = false,
  compareLabel,
}: {
  id: string;
  label: string;
  kpi: Kpi;
  /** The value is a ratio (shown as a percentage, change in points). */
  asRate?: boolean;
  /** The compared stretch ("1 oct. – 28 oct. 2025"), or null when comparison is off. */
  compareLabel: string | null;
}) {
  const { value, previous } = kpi;
  return (
    <Card id={domId("kpi-card", id)} size="sm">
      <CardContent className="space-y-1">
        <p id={domId("kpi-card", id, "label")} className="text-muted-foreground text-sm">
          {label}
        </p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p id={domId("kpi-card", id, "value")} className="text-3xl font-semibold tabular-nums">
            {asRate ? formatPercent(value) : formatNumber(value)}
          </p>
          <DeltaPill
            id={domId("kpi-card", id, "change")}
            value={value}
            previous={previous}
            asRate={asRate}
          />
        </div>
        {compareLabel !== null ? (
          <p id={domId("kpi-card", id, "comparison")} className="text-muted-foreground text-xs">
            {previous === null ? fr.dashboard.kpis.noPrevious : fr.dashboard.kpis.vs(compareLabel)}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
