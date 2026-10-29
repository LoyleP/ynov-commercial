"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { domId } from "@/lib/dom-id";
import {
  DATA_START,
  TODAY,
  monthRange,
  rangeKind,
  sameRange,
  yearRange,
  type Range,
} from "@/lib/leads/ranges";
import { fr } from "@/messages/fr";

type Tab = "month" | "year" | "custom";

const FIRST_YEAR = Number(DATA_START.slice(0, 4));
const LAST_YEAR = Number(TODAY.slice(0, 4));
const FIRST_MONTH = DATA_START.slice(0, 7);
const LAST_MONTH = TODAY.slice(0, 7);
const YEARS = Array.from({ length: LAST_YEAR - FIRST_YEAR + 1 }, (_, index) => FIRST_YEAR + index);

/**
 * Picks a stretch of the data the way people think of it: a whole month, a whole year, or two
 * dates. Choosing a month or a year applies at once; the two dates apply as soon as both are set.
 */
export function PeriodPicker({
  id,
  current,
  onPick,
}: {
  id: string;
  /** What the filter covers now: it opens on the matching tab, with that month or year in view. */
  current: Range | null;
  onPick: (range: Range) => void;
}) {
  const kind = current ? rangeKind(current) : null;
  // Opens on the month grid for anything inside one month (a partial month included), on the
  // years for a whole year, and on the two dates for a stretch across several months.
  const withinMonth = !current || current.from.slice(0, 7) === current.to.slice(0, 7);
  const [tab, setTab] = useState<Tab>(
    kind?.kind === "year" ? "year" : withinMonth ? "month" : "custom",
  );
  const [shownYear, setShownYear] = useState(
    kind?.year ?? (current ? Number(current.to.slice(0, 4)) : LAST_YEAR),
  );

  return (
    <div id={id} className="w-72 space-y-3 p-2">
      <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)}>
        <TabsList className="w-full">
          {(["month", "year", "custom"] as const).map((value) => (
            <TabsTrigger key={value} id={domId(id, "tab", value)} value={value} className="flex-1">
              {fr.dashboard.filters.tabs[value]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {tab === "month" ? (
        <div id={domId(id, "months")} className="space-y-2">
          <div className="flex items-center justify-between">
            <Button
              id={domId(id, "previous-year")}
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={fr.dashboard.filters.previousYear}
              disabled={shownYear <= FIRST_YEAR}
              onClick={() => setShownYear(shownYear - 1)}
            >
              <ChevronLeft aria-hidden />
            </Button>
            <span id={domId(id, "year")} className="text-sm font-medium tabular-nums">
              {shownYear}
            </span>
            <Button
              id={domId(id, "next-year")}
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={fr.dashboard.filters.nextYear}
              disabled={shownYear >= LAST_YEAR}
              onClick={() => setShownYear(shownYear + 1)}
            >
              <ChevronRight aria-hidden />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {fr.dashboard.filters.months.map((name, index) => {
              const month = index + 1;
              const key = `${shownYear}-${String(month).padStart(2, "0")}`;
              const range = monthRange(shownYear, month);
              return (
                <Button
                  key={key}
                  id={domId(id, "month", key)}
                  type="button"
                  variant={sameRange(current, range) ? "default" : "ghost"}
                  disabled={key < FIRST_MONTH || key > LAST_MONTH}
                  onClick={() => onPick(range)}
                >
                  {name}
                </Button>
              );
            })}
          </div>
        </div>
      ) : null}

      {tab === "year" ? (
        <div id={domId(id, "years")} className="grid grid-cols-3 gap-1">
          {YEARS.map((year) => {
            const range = yearRange(year);
            return (
              <Button
                key={year}
                id={domId(id, "year", year)}
                type="button"
                variant={sameRange(current, range) ? "default" : "ghost"}
                className="tabular-nums"
                onClick={() => onPick(range)}
              >
                {year}
              </Button>
            );
          })}
        </div>
      ) : null}

      {tab === "custom" ? <CustomDates id={id} current={current} onPick={onPick} /> : null}
    </div>
  );
}

/** Two native date fields: they bring their own calendar and keyboard entry. */
function CustomDates({
  id,
  current,
  onPick,
}: {
  id: string;
  current: Range | null;
  onPick: (range: Range) => void;
}) {
  const [from, setFrom] = useState(current?.from ?? "");
  const [to, setTo] = useState(current?.to ?? "");

  function change(nextFrom: string, nextTo: string) {
    setFrom(nextFrom);
    setTo(nextTo);
    if (nextFrom && nextTo && nextFrom <= nextTo) onPick({ from: nextFrom, to: nextTo });
  }

  return (
    <div id={domId(id, "custom")} className="grid grid-cols-2 gap-2">
      {(
        [
          { key: "from", label: fr.dashboard.filters.customFrom, value: from },
          { key: "to", label: fr.dashboard.filters.customTo, value: to },
        ] as const
      ).map((field) => (
        <label key={field.key} className="space-y-1 text-xs">
          <span className="text-muted-foreground">{field.label}</span>
          <Input
            id={domId(id, "custom", field.key)}
            type="date"
            value={field.value}
            min={DATA_START}
            max={TODAY}
            aria-invalid={!!from && !!to && from > to}
            onChange={(event) =>
              field.key === "from"
                ? change(event.target.value, to)
                : change(from, event.target.value)
            }
          />
        </label>
      ))}
    </div>
  );
}
