import { MOCK_TODAY, YEARS } from "./mock";

export type Range = { from: string; to: string };

/**
 * `an`: the same month (or the same dates) one year earlier. `precedente`: the stretch of the same length just before.
 * `perso`: a month, a year or a stretch picked by the user.
 */
export const COMPARE_MODES = ["aucune", "an", "precedente", "perso"] as const;
export type CompareMode = (typeof COMPARE_MODES)[number];

/** No custom range means this month. */
export type PeriodFilter = { custom: Range | null };
export type CompareFilter = { mode: CompareMode; custom: Range | null };

/** First day of the mock data: the campaign before the first intake year. */
export const DATA_START = `${YEARS[0] - 1}-10-01`;
export const TODAY = MOCK_TODAY;

const DAY = 86_400_000;

export const addDays = (iso: string, days: number) =>
  new Date(Date.parse(iso) + days * DAY).toISOString().slice(0, 10);
export const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(to) - Date.parse(from)) / DAY);

function shiftYears(iso: string, years: number) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCFullYear(date.getUTCFullYear() + years);
  return date.toISOString().slice(0, 10);
}

/** This month: from the 1st to today. */
export function currentMonth(): Range {
  return { from: `${TODAY.slice(0, 7)}-01`, to: TODAY };
}

export const resolvePeriod = ({ custom }: PeriodFilter): Range => custom ?? currentMonth();

/** The stretch the figures are compared with, or null when comparison is off. */
export function resolveCompare({ mode, custom }: CompareFilter, period: Range): Range | null {
  if (mode === "aucune") return null;
  if (mode === "perso" && custom) return custom;
  if (mode === "precedente") {
    const length = daysBetween(period.from, period.to) + 1;
    return { from: addDays(period.from, -length), to: addDays(period.from, -1) };
  }
  // A month is compared with the same whole month a year earlier, so it reads as a month.
  const kind = rangeKind(period);
  if (kind?.kind === "month") return monthRange(kind.year - 1, kind.month);
  return { from: shiftYears(period.from, -1), to: shiftYears(period.to, -1) };
}

const pad = (value: number) => String(value).padStart(2, "0");
const lastDayOf = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate();
const earlier = (a: string, b: string) => (a < b ? a : b);
const later = (a: string, b: string) => (a > b ? a : b);

/** A whole month (`month` is 1-12), cut at today. */
export const monthRange = (year: number, month: number): Range => ({
  from: `${year}-${pad(month)}-01`,
  to: earlier(`${year}-${pad(month)}-${pad(lastDayOf(year, month))}`, TODAY),
});

/** A whole year, cut to the data's first day and today. */
export const yearRange = (year: number): Range => ({
  from: later(`${year}-01-01`, DATA_START),
  to: earlier(`${year}-12-31`, TODAY),
});

export const sameRange = (a: Range | null, b: Range | null) =>
  a !== null && b !== null && a.from === b.from && a.to === b.to;

/**
 * Whether a stretch is exactly one month or one year, so it can be named ("octobre 2026", "2025")
 * instead of shown as dates. A month still in progress counts up to today.
 */
export function rangeKind(
  range: Range,
): { kind: "month"; year: number; month: number } | { kind: "year"; year: number } | null {
  const [year, month] = range.from.split("-").map(Number) as [number, number];
  if (sameRange(range, monthRange(year, month))) return { kind: "month", year, month };
  if (sameRange(range, yearRange(year))) return { kind: "year", year };
  return null;
}
