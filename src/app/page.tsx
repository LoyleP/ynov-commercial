import { Inbox } from "lucide-react";
import { BreakdownCard } from "@/components/dashboard/breakdown-card";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { FunnelChart } from "@/components/dashboard/funnel-chart";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { EmptyState } from "@/components/empty-state";
import { formatRange } from "@/lib/format";
import { parseFilters } from "@/lib/leads/filters";
import { MOCK_LEADS } from "@/lib/leads/mock";
import { computeDashboard } from "@/lib/leads/stats";
import { fr } from "@/messages/fr";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const filters = parseFilters(await searchParams);
  const data = computeDashboard(MOCK_LEADS, filters);
  const { kpis } = data;
  const compareLabel = data.compareRange ? formatRange(data.compareRange) : null;

  return (
    <>
      <main className="page-width mx-auto w-full flex-1 space-y-6 px-6 py-8 sm:px-12 lg:px-24">
        <div>
          <h1 id="dashboard-title" className="text-2xl font-semibold">
            {fr.dashboard.title}
          </h1>
        </div>
        <div className="space-y-2">
          <FilterBar filters={filters} />
        </div>
        {kpis.leads.value === 0 ? (
          <EmptyState
            icon={Inbox}
            title={fr.dashboard.empty.title}
            body={fr.dashboard.empty.body}
          />
        ) : (
          <>
            <section id="dashboard-kpis" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <KpiCard
                id="leads"
                label={fr.dashboard.kpis.leads}
                kpi={kpis.leads}
                compareLabel={compareLabel}
              />
              <KpiCard
                id="interviews"
                label={fr.dashboard.kpis.interviews}
                kpi={kpis.interviews}
                compareLabel={compareLabel}
              />
              <KpiCard
                id="enrolled"
                label={fr.dashboard.kpis.enrolled}
                kpi={kpis.enrolled}
                compareLabel={compareLabel}
              />
              <KpiCard
                id="rate"
                label={fr.dashboard.kpis.rate}
                kpi={kpis.rate}
                asRate
                compareLabel={compareLabel}
              />
            </section>
            <section id="dashboard-overview" className="grid gap-4 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <TrendChart
                  trend={data.trend}
                  granularity={data.granularity}
                  hasPrevious={kpis.leads.previous !== null}
                />
              </div>
              <div className="lg:col-span-2 [&>*]:h-full">
                <FunnelChart funnel={data.funnel} />
              </div>
            </section>
            <section id="dashboard-breakdowns" className="grid gap-4 lg:grid-cols-2">
              <BreakdownCard
                id="source"
                title={fr.dashboard.breakdown.bySource}
                rows={data.bySource}
                labels={fr.dashboard.sources}
              />
              <BreakdownCard
                id="programme"
                title={fr.dashboard.breakdown.byProgramme}
                rows={data.byProgramme}
                labels={fr.dashboard.programmes}
              />
            </section>
          </>
        )}
      </main>
    </>
  );
}
