import {
  COMPARE_MODES,
  DATA_START,
  TODAY,
  type CompareFilter,
  type PeriodFilter,
  type Range,
} from "./ranges";
import { PROGRAMMES, SOURCES, type Programme, type Source } from "./types";

export type Filters = {
  period: PeriodFilter;
  compare: CompareFilter;
  programmes: Programme[];
  sources: Source[];
};

type Params = Record<string, string | string[] | undefined>;

const one = (params: Params, key: string) => {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
};

function list<T extends string>(raw: string | undefined, allowed: readonly T[]): T[] {
  return (raw?.split(",") ?? []).filter((item): item is T => allowed.includes(item as T));
}

const isDate = (value: string | undefined): value is string =>
  !!value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));

/** A valid range inside the data, or null. Dates are cut at the first day and today. */
function range(from: string | undefined, to: string | undefined): Range | null {
  if (!isDate(from) || !isDate(to) || from > to) return null;
  const start = from < DATA_START ? DATA_START : from;
  const end = to > TODAY ? TODAY : to;
  return start <= end ? { from: start, to: end } : null;
}

/** Filters live in the URL (`?du=2026-01-01&au=2026-03-31&programme=info`) so a view can be shared. */
export function parseFilters(params: Params): Filters {
  return {
    period: { custom: range(one(params, "du"), one(params, "au")) },
    compare: {
      mode: list(one(params, "comparer"), COMPARE_MODES)[0] ?? "an",
      custom: range(one(params, "cdu"), one(params, "cau")),
    },
    programmes: list(one(params, "programme"), PROGRAMMES),
    sources: list(one(params, "source"), SOURCES),
  };
}
