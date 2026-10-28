import { Inbox } from "lucide-react";
import { BreakdownCard } from "@/components/dashboard/breakdown-card";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { FunnelChart } from "@/components/dashboard/funnel-chart";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { EmptyState } from "@/components/empty-state";
import { ThemeToggle } from "@/components/theme-toggle";
import { formatDateLong } from "@/lib/format";
import { parseFilters } from "@/lib/leads/filters";
import { MOCK_LEADS } from "@/lib/leads/mock";
import { computeDashboard } from "@/lib/leads/stats";
import { fr } from "@/messages/fr";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const filters = parseFilters(await searchParams);
  const data = computeDashboard(MOCK_LEADS, filters);
  const { kpis } = data;
  const previousYear = filters.year - 1;

  return (
    <>
      <header className="border-b">
        <div className="page-width mx-auto flex h-14 w-full items-center justify-between px-4 sm:px-6 lg:px-10">
          <span className="font-semibold">{fr.app.name}</span>
          <ThemeToggle />
        </div>
      </header>
      <main className="page-width mx-auto w-full flex-1 space-y-6 px-4 py-8 sm:px-6 lg:px-10">
        <div className="space-y-1">
          <h1 id="dashboard-title" className="text-2xl font-semibold">
            {fr.dashboard.title}
          </h1>
          <p id="dashboard-intro" className="text-muted-foreground text-sm">
            {fr.dashboard.intro} {fr.dashboard.mockNotice}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <FilterBar filters={filters} />
          <p id="dashboard-until" className="text-muted-foreground text-xs">
            {fr.dashboard.until(formatDateLong(data.until))}
          </p>
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
                previousYear={previousYear}
              />
              <KpiCard
                id="interviews"
                label={fr.dashboard.kpis.interviews}
                kpi={kpis.interviews}
                previousYear={previousYear}
              />
              <KpiCard
                id="enrolled"
                label={fr.dashboard.kpis.enrolled}
                kpi={kpis.enrolled}
                previousYear={previousYear}
              />
              <KpiCard
                id="rate"
                label={fr.dashboard.kpis.rate}
                kpi={kpis.rate}
                asRate
                previousYear={previousYear}
              />
            </section>
            <section id="dashboard-overview" className="grid gap-4 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <TrendChart
                  trend={data.trend}
                  year={filters.year}
                  hasPrevious={kpis.leads.previous !== null}
                />
              </div>
              <div className="lg:col-span-2">
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
