"use client";

import { ArrowRight, ChevronDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { usePhoneScreen } from "@/hooks/use-phone-screen";
import { domId } from "@/lib/dom-id";
import { PeriodPicker } from "@/components/dashboard/period-picker";
import { formatDateNumeric, formatMonth } from "@/lib/format";
import type { Filters } from "@/lib/leads/filters";
import {
  currentMonth,
  rangeKind,
  resolveCompare,
  resolvePeriod,
  sameRange,
  type Range,
} from "@/lib/leads/ranges";
import { PROGRAMMES, SOURCES } from "@/lib/leads/types";
import { cn } from "@/lib/utils";
import { fr } from "@/messages/fr";

/** "01/10/26 → 28/10/26". */
function DateSpan({ range }: { range: Range }) {
  return (
    <>
      {formatDateNumeric(range.from)}
      <ArrowRight aria-hidden className="text-muted-foreground size-3.5 shrink-0" />
      {formatDateNumeric(range.to)}
    </>
  );
}

/** The title of a filter, then a vertical rule, then its value: shared by every trigger of the bar. */
function FilterLabel({ children }: { children: string }) {
  return (
    <>
      <span className="text-muted-foreground">{children}</span>
      <Separator orientation="vertical" />
    </>
  );
}

/**
 * One pill of the bar. Its panel is a popover on desktop and a bottom sheet on phones; `children`
 * receives `close` so a choice can dismiss it.
 */
export function FilterShell({
  id,
  label,
  summary,
  headerAction,
  width = "w-64",
  children,
}: {
  id: string;
  label: string;
  summary: ReactNode;
  headerAction?: ReactNode;
  width?: string;
  children: (close: () => void) => ReactNode;
}) {
  const phone = usePhoneScreen();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const trigger = (
    <Button
      id={domId(id, "trigger")}
      type="button"
      variant="outline"
      className="border-input justify-between gap-2"
      onClick={phone ? () => setOpen(true) : undefined}
    >
      <FilterLabel>{label}</FilterLabel>
      <span className="flex max-w-56 items-center gap-1.5 truncate">{summary}</span>
      <ChevronDown aria-hidden className="text-muted-foreground size-4" />
    </Button>
  );

  const panel = phone ? (
    <>
      {trigger}
      <BottomSheet
        id={domId(id, "sheet")}
        open={open}
        onOpenChange={setOpen}
        title={label}
        headerAction={headerAction}
      >
        {children(close)}
      </BottomSheet>
    </>
  ) : (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent id={domId(id, "popover")} align="start" className={cn(width, "p-1")}>
        {children(close)}
      </PopoverContent>
    </Popover>
  );
  return panel;
}

/** "octobre 2026" or "2025" when the stretch is exactly that, else "01/10/26 → 28/10/26". */
function RangeSummary({ range }: { range: Range }) {
  const kind = rangeKind(range);
  if (kind?.kind === "month") {
    return (
      <span className="first-letter:capitalize">
        {formatMonth(`${kind.year}-${String(kind.month).padStart(2, "0")}`)}
      </span>
    );
  }
  if (kind?.kind === "year") return <>{kind.year}</>;
  return <DateSpan range={range} />;
}

type Update = (changes: Record<string, string | null>) => void;

function PeriodFilter({ filters, update }: { filters: Filters; update: Update }) {
  const range = resolvePeriod(filters.period);
  return (
    <FilterShell
      id="filter-bar-period"
      label={fr.dashboard.filters.period}
      summary={<RangeSummary range={range} />}
      width="w-auto"
    >
      {(close) => (
        <PeriodPicker
          id="filter-bar-period-panel"
          current={range}
          onPick={(next) => {
            // This month is the default: it needs no trace in the address.
            const isDefault = sameRange(next, currentMonth());
            update({ du: isDefault ? null : next.from, au: isDefault ? null : next.to });
            close();
          }}
        />
      )}
    </FilterShell>
  );
}

function CompareFilter({ filters, update }: { filters: Filters; update: Update }) {
  const range = resolveCompare(filters.compare, resolvePeriod(filters.period));
  return (
    <FilterShell
      id="filter-bar-compare"
      label={fr.dashboard.filters.compare}
      summary={range ? <RangeSummary range={range} /> : fr.dashboard.filters.noComparison}
      width="w-auto"
    >
      {(close) => (
        <PeriodPicker
          id="filter-bar-compare-panel"
          current={range}
          onPick={(next) => {
            update({ comparer: "perso", cdu: next.from, cau: next.to });
            close();
          }}
        />
      )}
    </FilterShell>
  );
}

function MultiFilter({
  id,
  label,
  options,
  selected,
  onChange,
}: {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (value: string) =>
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  const summary =
    selected.length === 0
      ? fr.dashboard.filters.all
      : selected.length === 1
        ? (options.find((option) => option.value === selected[0])?.label ?? "")
        : `${selected.length}`;
  return (
    <FilterShell
      id={id}
      label={label}
      summary={summary}
      headerAction={
        selected.length ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange([])}>
            {fr.dashboard.filters.reset}
          </Button>
        ) : null
      }
    >
      {() => (
        <ul id={domId(id, "options")} className="space-y-0.5">
          {options.map((option) => {
            const optionId = domId(id, "options", option.value);
            return (
              <li key={option.value}>
                <label
                  htmlFor={optionId}
                  className="hover:bg-accent flex items-center gap-2 rounded-md px-1.5 py-1.5 text-sm"
                >
                  <Checkbox
                    id={optionId}
                    checked={selected.includes(option.value)}
                    onCheckedChange={() => toggle(option.value)}
                  />
                  {option.label}
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </FilterShell>
  );
}

/** `children` are more pills, for the pages that have a filter of their own (the agents' figure). */
export function FilterBar({ filters, children }: { filters: Filters; children?: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const current = useSearchParams();
  const [pending, startTransition] = useTransition();

  const update: Update = (changes) => {
    const params = new URLSearchParams(current.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    startTransition(() => router.replace(`${pathname}?${params}`, { scroll: false }));
  };
  const hasFilters =
    filters.period.custom !== null ||
    filters.compare.mode !== "an" ||
    filters.programmes.length > 0 ||
    filters.sources.length > 0;
  const setList = (key: string) => (values: string[]) =>
    update({ [key]: values.length ? values.join(",") : null });

  return (
    <div id="filter-bar" aria-busy={pending} className="flex flex-wrap items-center gap-2">
      <PeriodFilter filters={filters} update={update} />
      <CompareFilter filters={filters} update={update} />
      <MultiFilter
        id="filter-bar-programme"
        label={fr.dashboard.filters.programme}
        options={PROGRAMMES.map((value) => ({ value, label: fr.dashboard.programmes[value] }))}
        selected={filters.programmes}
        onChange={setList("programme")}
      />
      <MultiFilter
        id="filter-bar-source"
        label={fr.dashboard.filters.source}
        options={SOURCES.map((value) => ({ value, label: fr.dashboard.sources[value] }))}
        selected={filters.sources}
        onChange={setList("source")}
      />
      {children}
      {hasFilters ? (
        <Button
          id="filter-bar-reset"
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            update({
              du: null,
              au: null,
              comparer: null,
              cdu: null,
              cau: null,
              programme: null,
              source: null,
            })
          }
        >
          {fr.dashboard.filters.reset}
        </Button>
      ) : null}
    </div>
  );
}
