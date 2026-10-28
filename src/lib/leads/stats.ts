import { MOCK_TODAY } from "./mock";
import type { Filters } from "./filters";
import { STAGES, type Lead, type Stage } from "./types";

export type Kpi = { value: number; previous: number | null };
export type Breakdown = { key: string; leads: number; enrolled: number; rate: number };
export type Dashboard = {
  /** Last day counted: today for the campaign in progress, 30 September for a finished one. */
  until: string;
  kpis: { leads: Kpi; interviews: Kpi; enrolled: Kpi; rate: Kpi };
  funnel: { stage: Stage; count: number }[];
  /** Leads per month of the campaign, October to September. */
  trend: { month: number; current: number; previous: number | null }[];
  bySource: Breakdown[];
  byProgramme: Breakdown[];
};

const stageIndex = (lead: Lead) => STAGES.indexOf(lead.stage);

function matches(lead: Lead, filters: Filters) {
  return (
    (filters.programmes.length === 0 || filters.programmes.includes(lead.programme)) &&
    (filters.sources.length === 0 || filters.sources.includes(lead.source))
  );
}

function shiftYear(iso: string, years: number) {
  return `${Number(iso.slice(0, 4)) + years}${iso.slice(4)}`;
}

function count(leads: Lead[]) {
  const enrolled = leads.filter((lead) => lead.status === "enrolled").length;
  return {
    leads: leads.length,
    interviews: leads.filter((lead) => stageIndex(lead) >= 2).length,
    enrolled,
    rate: leads.length ? enrolled / leads.length : 0,
  };
}

function breakdown(leads: Lead[], key: (lead: Lead) => string): Breakdown[] {
  const groups = new Map<string, Lead[]>();
  for (const lead of leads) groups.set(key(lead), [...(groups.get(key(lead)) ?? []), lead]);
  return [...groups.entries()]
    .map(([name, group]) => {
      const { leads: total, enrolled, rate } = count(group);
      return { key: name, leads: total, enrolled, rate };
    })
    .sort((a, b) => b.leads - a.leads);
}

export function computeDashboard(all: readonly Lead[], filters: Filters): Dashboard {
  const scoped = all.filter((lead) => matches(lead, filters));
  const until = MOCK_TODAY < `${filters.year}-09-30` ? MOCK_TODAY : `${filters.year}-09-30`;
  const current = scoped.filter((lead) => lead.year === filters.year);
  const previousAll = scoped.filter((lead) => lead.year === filters.year - 1);
  const hasPrevious = all.some((lead) => lead.year === filters.year - 1);
  // The same stretch of the previous campaign, so a campaign in progress is not compared to a full one.
  const previousUntil = shiftYear(until, -1);
  const previous = previousAll.filter((lead) => lead.createdAt <= previousUntil);

  const now = count(current);
  const before = count(previous);
  const kpi = (field: keyof typeof now): Kpi => ({
    value: now[field],
    previous: hasPrevious ? before[field] : null,
  });

  const monthOf = (lead: Lead) => (Number(lead.createdAt.slice(5, 7)) + 2) % 12;
  const perMonth = (leads: Lead[]) => {
    const months = Array.from({ length: 12 }, () => 0);
    for (const lead of leads) months[monthOf(lead)] = (months[monthOf(lead)] ?? 0) + 1;
    return months;
  };
  const currentMonths = perMonth(current);
  const previousMonths = perMonth(previousAll);

  return {
    until,
    kpis: {
      leads: kpi("leads"),
      interviews: kpi("interviews"),
      enrolled: kpi("enrolled"),
      rate: kpi("rate"),
    },
    funnel: STAGES.map((stage, index) => ({
      stage,
      count: current.filter((lead) => stageIndex(lead) >= index).length,
    })),
    trend: currentMonths.map((value, month) => ({
      month,
      current: value,
      previous: hasPrevious ? (previousMonths[month] ?? 0) : null,
    })),
    bySource: breakdown(current, (lead) => lead.source),
    byProgramme: breakdown(current, (lead) => lead.programme),
  };
}
