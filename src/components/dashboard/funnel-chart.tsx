import { ArrowRight } from "lucide-react";
import { Fragment } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { domId } from "@/lib/dom-id";
import { formatNumber, formatPercent } from "@/lib/format";
import type { Dashboard } from "@/lib/leads/stats";
import { fr } from "@/messages/fr";

export function FunnelChart({ funnel }: { funnel: Dashboard["funnel"] }) {
  const total = funnel[0]?.count ?? 0;
  return (
    <Card id="funnel-chart" className="h-full">
      <CardHeader>
        <CardTitle id="funnel-chart-title">{fr.dashboard.funnel.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <ol id="funnel-chart-steps" className="flex flex-1 justify-between">
          {funnel.map(({ stage, count }, index) => {
            const ratio = total ? count / total : 0;
            const previous = funnel[index - 1]?.count ?? 0;
            const stepRate = previous ? count / previous : 0;
            return (
              <Fragment key={stage}>
                {index > 0 ? (
                  // Between two columns: an arrow with the share of the previous step that gets through.
                  <li
                    role="presentation"
                    title={fr.dashboard.funnel.stepRate(
                      formatPercent(stepRate),
                      fr.dashboard.funnel.stages[stage],
                    )}
                    id={domId("funnel-chart-step", stage, "arrow")}
                    className="text-muted-foreground flex w-5 shrink-0 flex-col pt-6 pb-10 sm:w-11"
                  >
                    <div className="flex flex-1 flex-col items-center justify-center gap-0.5">
                      <ArrowRight aria-hidden className="size-4" />
                      <span className="hidden text-[10px] font-medium whitespace-nowrap tabular-nums sm:block">
                        {formatPercent(stepRate)}
                      </span>
                    </div>
                  </li>
                ) : null}
                <li
                  id={domId("funnel-chart-step", stage)}
                  className="flex max-w-28 min-w-0 flex-1 flex-col items-center gap-1"
                >
                  {index > 0 ? (
                    <span className="sr-only">
                      {fr.dashboard.funnel.stepRate(
                        formatPercent(stepRate),
                        fr.dashboard.funnel.stages[stage],
                      )}
                    </span>
                  ) : null}
                  <span className="text-sm font-semibold tabular-nums">{formatNumber(count)}</span>
                  <div
                    aria-hidden
                    className="bg-muted flex min-h-32 w-full flex-1 items-end overflow-hidden rounded-md"
                  >
                    <div
                      className="bg-primary w-full rounded-md transition-[height]"
                      style={{ height: `${Math.max(ratio * 100, count ? 2 : 0)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium whitespace-nowrap">
                    {fr.dashboard.funnel.stages[stage]}
                  </span>
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {formatPercent(ratio)}
                  </span>
                </li>
              </Fragment>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
