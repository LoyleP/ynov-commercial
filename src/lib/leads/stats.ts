import type { Filters } from "./filters";
import { addDays, daysBetween, resolveCompare, resolvePeriod, type Range } from "./ranges";
import { STAGES, type Lead, type Stage } from "./types";

export type Kpi = { value: number; previous: number | null };
export type Breakdown = { key: string; leads: number; enrolled: number; rate: number };
export type Granularity = "day" | "week" | "month";
export type Dashboard = {
  range: Range;
  /** The stretch compared with, or null when comparison is off. */
  compareRange: Range | null;
  /** False when nothing was recorded on the compared stretch (the figures then have no baseline). */
  hasCompareData: boolean;
  kpis: { leads: Kpi; interviews: Kpi; enrolled: Kpi; rate: Kpi };
  funnel: { stage: Stage; count: number }[];
  granularity: Granularity;
  /** One point per day, week or month of the period; `previous` is the same slot of the comparison. */
  trend: { start: string; current: number; previous: number | null }[];
  bySource: Breakdown[];
  byProgramme: Breakdown[];
};

const stageIndex = (lead: Lead) => STAGES.indexOf(lead.stage);

export function matches(lead: Lead, filters: Filters) {
  return (
    (filters.programmes.length === 0 || filters.programmes.includes(lead.programme)) &&
    (filters.sources.length === 0 || filters.sources.includes(lead.source))
  );
}

export const inRange = (lead: Lead, range: Range) =>
  lead.createdAt >= range.from && lead.createdAt <= range.to;

export function count(leads: Lead[]) {
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

const monthIndex = (iso: string) => Number(iso.slice(0, 4)) * 12 + Number(iso.slice(5, 7)) - 1;

export function granularityFor(days: number): Granularity {
  return days <= 31 ? "day" : days <= 120 ? "week" : "month";
}

/** Slot of `date` within a series that starts at `start`. */
export function slot(date: string, start: string, granularity: Granularity) {
  if (granularity === "month") return monthIndex(date) - monthIndex(start);
  const days = daysBetween(start, date);
  return granularity === "day" ? days : Math.floor(days / 7);
}

/** First day of slot `index`, used to label it. */
export function slotStart(start: string, index: number, granularity: Granularity) {
  if (granularity === "month") {
    const total = monthIndex(start) + index;
    return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}-01`;
  }
  return addDays(start, granularity === "day" ? index : index * 7);
}

export function computeDashboard(all: readonly Lead[], filters: Filters): Dashboard {
  const range = resolvePeriod(filters.period);
  const compareRange = resolveCompare(filters.compare, range);
  const scoped = all.filter((lead) => matches(lead, filters));
  const current = scoped.filter((lead) => inRange(lead, range));
  const previous = compareRange ? scoped.filter((lead) => inRange(lead, compareRange)) : [];
  const hasCompareData = compareRange ? all.some((lead) => inRange(lead, compareRange)) : false;
  const comparing = compareRange !== null && hasCompareData;

  const now = count(current);
  const before = count(previous);
  const kpi = (field: keyof typeof now): Kpi => ({
    value: now[field],
    previous: comparing ? before[field] : null,
  });

  const days = daysBetween(range.from, range.to) + 1;
  const granularity = granularityFor(days);
  const slots = slot(range.to, range.from, granularity) + 1;
  const series = (leads: Lead[], start: string) => {
    const counts = Array.from({ length: slots }, () => 0);
    for (const lead of leads) {
      const index = slot(lead.createdAt, start, granularity);
      if (index >= 0 && index < slots) counts[index] = (counts[index] ?? 0) + 1;
    }
    return counts;
  };
  const currentSeries = series(current, range.from);
  const previousSeries = compareRange && comparing ? series(previous, compareRange.from) : null;

  return {
    range,
    compareRange,
    hasCompareData,
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
    granularity,
    trend: currentSeries.map((value, index) => ({
      start: slotStart(range.from, index, granularity),
      current: value,
      previous: previousSeries ? (previousSeries[index] ?? 0) : null,
    })),
    bySource: breakdown(current, (lead) => lead.source),
    byProgramme: breakdown(current, (lead) => lead.programme),
  };
}
