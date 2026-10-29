import type { Filters } from "./filters";
import { REPS } from "./mock";
import { resolveCompare, resolvePeriod, daysBetween, type Range } from "./ranges";
import {
  count,
  granularityFor,
  inRange,
  matches,
  slot,
  slotStart,
  type Granularity,
  type Kpi,
} from "./stats";
import type { Lead } from "./types";

export const METRICS = ["leads", "enrolled", "rate"] as const;
export type Metric = (typeof METRICS)[number];

type Values = Record<Metric, number>;
export type AgentPoint = {
  start: string;
  current: Values;
  /** The same slot of the compared stretch, or null when comparison is off or empty. */
  previous: Values | null;
};
export type AgentRow = {
  key: string;
  kpis: { leads: Kpi; interviews: Kpi; enrolled: Kpi; rate: Kpi };
  series: AgentPoint[];
};
export type AgentsDashboard = {
  range: Range;
  compareRange: Range | null;
  granularity: Granularity;
  team: AgentRow;
  /** Most leads first. */
  agents: AgentRow[];
};

export function computeAgents(all: readonly Lead[], filters: Filters): AgentsDashboard {
  const range = resolvePeriod(filters.period);
  const compareRange = resolveCompare(filters.compare, range);
  const scoped = all.filter((lead) => matches(lead, filters));
  const current = scoped.filter((lead) => inRange(lead, range));
  const previous = compareRange ? scoped.filter((lead) => inRange(lead, compareRange)) : [];
  const comparing = compareRange !== null && all.some((lead) => inRange(lead, compareRange));

  const granularity = granularityFor(daysBetween(range.from, range.to) + 1);
  const slots = slot(range.to, range.from, granularity) + 1;

  function series(leads: Lead[], start: string): Values[] {
    const total = Array.from({ length: slots }, () => 0);
    const enrolled = Array.from({ length: slots }, () => 0);
    for (const lead of leads) {
      const index = slot(lead.createdAt, start, granularity);
      if (index < 0 || index >= slots) continue;
      total[index] = (total[index] ?? 0) + 1;
      if (lead.status === "enrolled") enrolled[index] = (enrolled[index] ?? 0) + 1;
    }
    return total.map((leads, index) => ({
      leads,
      enrolled: enrolled[index] ?? 0,
      rate: leads ? (enrolled[index] ?? 0) / leads : 0,
    }));
  }

  function row(key: string, now: Lead[], before: Lead[]): AgentRow {
    const a = count(now);
    const b = count(before);
    const kpi = (field: keyof typeof a): Kpi => ({
      value: a[field],
      previous: comparing ? b[field] : null,
    });
    const currentSeries = series(now, range.from);
    const previousSeries = compareRange && comparing ? series(before, compareRange.from) : null;
    return {
      key,
      kpis: {
        leads: kpi("leads"),
        interviews: kpi("interviews"),
        enrolled: kpi("enrolled"),
        rate: kpi("rate"),
      },
      series: currentSeries.map((values, index) => ({
        start: slotStart(range.from, index, granularity),
        current: values,
        previous: previousSeries?.[index] ?? null,
      })),
    };
  }

  return {
    range,
    compareRange,
    granularity,
    team: row("team", current, previous),
    agents: REPS.map((name) =>
      row(
        name,
        current.filter((lead) => lead.rep === name),
        previous.filter((lead) => lead.rep === name),
      ),
    ).sort((x, y) => y.kpis.leads.value - x.kpis.leads.value),
  };
}
