import { AgentPanel } from "@/components/agents/agent-panel";
import { AgentsTable } from "@/components/agents/agents-table";
import { MetricFilter } from "@/components/agents/metric-filter";
import { BreakdownCard } from "@/components/dashboard/breakdown-card";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { FunnelChart } from "@/components/dashboard/funnel-chart";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { formatRange } from "@/lib/format";
import { parseFilters } from "@/lib/leads/filters";
import { METRICS, computeAgents, type Metric } from "@/lib/leads/agents";
import { MOCK_LEADS, REPS } from "@/lib/leads/mock";
import { computeDashboard } from "@/lib/leads/stats";
import { fr } from "@/messages/fr";

export default async function AgentsPage({ searchParams }: PageProps<"/agents">) {
  const params = await searchParams;
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
  const filters = parseFilters(params);
  const metric: Metric = METRICS.find((value) => value === first(params.metrique)) ?? "leads";
  const data = computeAgents(MOCK_LEADS, filters);
  const selected = REPS.find((name) => name === first(params.agent));

  // The address that opens an agent's panel keeps every other filter as it is.
  const hrefs = Object.fromEntries(
    data.agents.map((agent) => {
      const query = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        const single = first(value);
        if (key !== "agent" && single) query.set(key, single);
      }
      query.set("agent", agent.key);
      return [agent.key, `/agents?${query}`];
    }),
  );

  const detail = selected
    ? computeDashboard(
        MOCK_LEADS.filter((lead) => lead.rep === selected),
        filters,
      )
    : null;
  const compareLabel = detail?.compareRange ? formatRange(detail.compareRange) : null;

  return (
    <main className="page-width mx-auto w-full flex-1 space-y-6 px-6 py-8 sm:px-12 lg:px-24">
      <h1 id="agents-title" className="text-2xl font-semibold">
        {fr.agents.title}
      </h1>
      <FilterBar filters={filters}>
        <MetricFilter metric={metric} />
      </FilterBar>
      <AgentsTable data={data} metric={metric} hrefs={hrefs} />
      {selected && detail ? (
        <AgentPanel name={selected} subtitle={formatRange(detail.range)}>
          <section id="agent-panel-kpis" className="grid grid-cols-2 gap-4">
            <KpiCard
              id="agent-leads"
              label={fr.dashboard.kpis.leads}
              kpi={detail.kpis.leads}
              compareLabel={compareLabel}
            />
            <KpiCard
              id="agent-interviews"
              label={fr.dashboard.kpis.interviews}
              kpi={detail.kpis.interviews}
              compareLabel={compareLabel}
            />
            <KpiCard
              id="agent-enrolled"
              label={fr.dashboard.kpis.enrolled}
              kpi={detail.kpis.enrolled}
              compareLabel={compareLabel}
            />
            <KpiCard
              id="agent-rate"
              label={fr.dashboard.kpis.rate}
              kpi={detail.kpis.rate}
              asRate
              compareLabel={compareLabel}
            />
          </section>
          <TrendChart
            trend={detail.trend}
            granularity={detail.granularity}
            hasPrevious={detail.kpis.leads.previous !== null}
          />
          <FunnelChart funnel={detail.funnel} />
          <BreakdownCard
            id="agent-source"
            title={fr.dashboard.breakdown.bySource}
            rows={detail.bySource}
            labels={fr.dashboard.sources}
          />
          <BreakdownCard
            id="agent-programme"
            title={fr.dashboard.breakdown.byProgramme}
            rows={detail.byProgramme}
            labels={fr.dashboard.programmes}
          />
        </AgentPanel>
      ) : null}
    </main>
  );
}
