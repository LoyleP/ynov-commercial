import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { domId } from "@/lib/dom-id";
import { formatNumber, formatPercent } from "@/lib/format";
import type { Dashboard } from "@/lib/leads/stats";
import { fr } from "@/messages/fr";

export function FunnelChart({ funnel }: { funnel: Dashboard["funnel"] }) {
  const total = funnel[0]?.count ?? 0;
  return (
    <Card id="funnel-chart">
      <CardHeader>
        <CardTitle id="funnel-chart-title">{fr.dashboard.funnel.title}</CardTitle>
        <CardDescription>{fr.dashboard.funnel.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ol id="funnel-chart-steps" className="space-y-3">
          {funnel.map(({ stage, count }) => {
            const ratio = total ? count / total : 0;
            return (
              <li key={stage} id={domId("funnel-chart-step", stage)} className="space-y-1">
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="font-medium">{fr.dashboard.funnel.stages[stage]}</span>
                  <span className="text-muted-foreground tabular-nums">
                    <span className="text-foreground font-medium">{formatNumber(count)}</span>
                    {" · "}
                    {fr.dashboard.funnel.ofLeads(formatPercent(ratio))}
                  </span>
                </div>
                <div aria-hidden className="bg-muted h-2 overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full transition-[width]"
                    style={{ width: `${ratio * 100}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
