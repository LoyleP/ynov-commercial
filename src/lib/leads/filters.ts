import { YEARS } from "./mock";
import { PROGRAMMES, SOURCES, type Programme, type Source } from "./types";

export type Filters = {
  year: number;
  programmes: Programme[];
  sources: Source[];
};

type Params = Record<string, string | string[] | undefined>;

function list<T extends string>(raw: string | string[] | undefined, allowed: readonly T[]): T[] {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return (value?.split(",") ?? []).filter((item): item is T => allowed.includes(item as T));
}

/** Filters live in the URL (`?annee=2026&programme=info,cyber`) so a view can be shared. */
export function parseFilters(params: Params): Filters {
  const raw = Array.isArray(params.annee) ? params.annee[0] : params.annee;
  const year = YEARS.find((candidate) => String(candidate) === raw) ?? YEARS[YEARS.length - 1]!;
  return {
    year,
    programmes: list(params.programme, PROGRAMMES),
    sources: list(params.source, SOURCES),
  };
}
