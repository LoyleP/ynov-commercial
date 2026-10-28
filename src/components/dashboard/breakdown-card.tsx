import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { domId } from "@/lib/dom-id";
import { formatNumber, formatPercent } from "@/lib/format";
import type { Breakdown } from "@/lib/leads/stats";
import { fr } from "@/messages/fr";

export function BreakdownCard({
  id,
  title,
  rows,
  labels,
}: {
  id: string;
  title: string;
  rows: Breakdown[];
  labels: Record<string, string>;
}) {
  const max = Math.max(1, ...rows.map((row) => row.leads));
  return (
    <Card id={domId("breakdown-card", id)}>
      <CardHeader>
        <CardTitle id={domId("breakdown-card", id, "title")}>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul id={domId("breakdown-card", id, "rows")} className="space-y-3">
          {rows.map((row) => (
            <li
              key={row.key}
              id={domId("breakdown-card", id, "row", row.key)}
              className="space-y-1"
            >
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="font-medium">{labels[row.key] ?? row.key}</span>
                <span className="text-muted-foreground text-right tabular-nums">
                  {fr.dashboard.breakdown.leads(formatNumber(row.leads))}
                  {" · "}
                  {fr.dashboard.breakdown.conversion(formatPercent(row.rate))}
                </span>
              </div>
              <div aria-hidden className="bg-muted h-2 overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full rounded-full transition-[width]"
                  style={{ width: `${(row.leads / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
