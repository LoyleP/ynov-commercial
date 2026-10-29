import Link from "next/link";
import { AgentSparkline } from "@/components/agents/agent-sparkline";
import { ClickableRow } from "@/components/agents/clickable-row";
import { DeltaPill } from "@/components/dashboard/delta-pill";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { domId } from "@/lib/dom-id";
import { formatNumber, formatPercent } from "@/lib/format";
import type { AgentRow, AgentsDashboard, Metric } from "@/lib/leads/agents";
import type { Kpi } from "@/lib/leads/stats";
import { cn } from "@/lib/utils";
import { fr } from "@/messages/fr";

function Figure({ id, kpi, asRate = false }: { id: string; kpi: Kpi; asRate?: boolean }) {
  return (
    <div className="flex flex-col items-start gap-1">
      <span id={domId(id, "value")} className="font-medium tabular-nums">
        {asRate ? formatPercent(kpi.value) : formatNumber(kpi.value)}
      </span>
      <DeltaPill
        id={domId(id, "change")}
        value={kpi.value}
        previous={kpi.previous}
        asRate={asRate}
      />
    </div>
  );
}

export function AgentsTable({
  data,
  metric,
  hrefs,
}: {
  data: AgentsDashboard;
  metric: Metric;
  /** Where each agent's panel opens, by agent name. */
  hrefs: Record<string, string>;
}) {
  const rows: AgentRow[] = [data.team, ...data.agents];
  return (
    <div id="agents-table" className="bg-card ring-foreground/10 rounded-xl ring-1">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">{fr.agents.columns.agent}</TableHead>
            <TableHead>{fr.dashboard.kpis.leads}</TableHead>
            <TableHead>{fr.dashboard.kpis.interviews}</TableHead>
            <TableHead>{fr.dashboard.kpis.enrolled}</TableHead>
            <TableHead>{fr.dashboard.kpis.rate}</TableHead>
            <TableHead className="w-64 pr-4">
              {fr.agents.columns.evolution} · {fr.agents.metrics[metric]}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const id = domId("agents-table-row", row.key);
            const isTeam = row.key === "team";
            const href = hrefs[row.key];
            const cells = (
              <>
                <TableCell
                  id={domId(id, "name")}
                  className={cn("pl-4", isTeam ? "font-semibold" : "font-medium")}
                >
                  {href ? (
                    <Link href={href} scroll={false} className="hover:underline">
                      {row.key}
                    </Link>
                  ) : (
                    fr.agents.team
                  )}
                </TableCell>
                <TableCell>
                  <Figure id={domId(id, "leads")} kpi={row.kpis.leads} />
                </TableCell>
                <TableCell>
                  <Figure id={domId(id, "interviews")} kpi={row.kpis.interviews} />
                </TableCell>
                <TableCell>
                  <Figure id={domId(id, "enrolled")} kpi={row.kpis.enrolled} />
                </TableCell>
                <TableCell>
                  <Figure id={domId(id, "rate")} kpi={row.kpis.rate} asRate />
                </TableCell>
                <TableCell className="pr-4">
                  <AgentSparkline
                    id={domId(id, "evolution")}
                    series={row.series}
                    metric={metric}
                    granularity={data.granularity}
                  />
                </TableCell>
              </>
            );
            return href ? (
              <ClickableRow key={row.key} id={id} href={href}>
                {cells}
              </ClickableRow>
            ) : (
              <TableRow key={row.key} id={id} className={cn(isTeam && "bg-muted/50")}>
                {cells}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
