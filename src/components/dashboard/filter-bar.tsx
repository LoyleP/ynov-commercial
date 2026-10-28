"use client";

import { ChevronDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePhoneScreen } from "@/hooks/use-phone-screen";
import { domId } from "@/lib/dom-id";
import type { Filters } from "@/lib/leads/filters";
import { PROGRAMMES, SOURCES } from "@/lib/leads/types";
import { YEARS } from "@/lib/leads/mock";
import { fr } from "@/messages/fr";

function OptionList({
  id,
  options,
  selected,
  onToggle,
}: {
  id: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <ul id={id} className="space-y-0.5">
      {options.map((option) => {
        const optionId = domId(id, option.value);
        return (
          <li key={option.value}>
            <label
              htmlFor={optionId}
              className="hover:bg-accent flex items-center gap-2 rounded-md px-1.5 py-1.5 text-sm"
            >
              <Checkbox
                id={optionId}
                checked={selected.includes(option.value)}
                onCheckedChange={() => onToggle(option.value)}
              />
              {option.label}
            </label>
          </li>
        );
      })}
    </ul>
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
  const phone = usePhoneScreen();
  const [open, setOpen] = useState(false);
  const toggle = (value: string) =>
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  const summary =
    selected.length === 0
      ? fr.dashboard.filters.all
      : selected.length === 1
        ? (options.find((option) => option.value === selected[0])?.label ?? "")
        : `${selected.length}`;
  const list = (
    <OptionList id={domId(id, "options")} options={options} selected={selected} onToggle={toggle} />
  );
  const trigger = (
    <Button
      id={domId(id, "trigger")}
      type="button"
      variant="outline"
      className="border-input justify-between gap-2"
      onClick={phone ? () => setOpen(true) : undefined}
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-40 truncate">{summary}</span>
      <ChevronDown aria-hidden className="text-muted-foreground size-4" />
    </Button>
  );

  if (phone) {
    return (
      <>
        {trigger}
        <BottomSheet
          id={domId(id, "sheet")}
          open={open}
          onOpenChange={setOpen}
          title={label}
          headerAction={
            selected.length ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange([])}>
                {fr.dashboard.filters.reset}
              </Button>
            ) : null
          }
          footer={
            <Button type="button" className="w-full" onClick={() => setOpen(false)}>
              {fr.dashboard.filters.done}
            </Button>
          }
        >
          {list}
        </BottomSheet>
      </>
    );
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent id={domId(id, "popover")} align="start" className="w-64 p-1">
        {list}
      </PopoverContent>
    </Popover>
  );
}

export function FilterBar({ filters }: { filters: Filters }) {
  const router = useRouter();
  const pathname = usePathname();
  const current = useSearchParams();
  const [pending, startTransition] = useTransition();

  function update(key: string, values: string[]) {
    const params = new URLSearchParams(current.toString());
    if (values.length) params.set(key, values.join(","));
    else params.delete(key);
    startTransition(() => router.replace(`${pathname}?${params}`, { scroll: false }));
  }
  const hasFilter = filters.programmes.length > 0 || filters.sources.length > 0;

  return (
    <div id="filter-bar" aria-busy={pending} className="flex flex-wrap items-center gap-2">
      <Select value={String(filters.year)} onValueChange={(value) => update("annee", [value])}>
        <SelectTrigger id="filter-bar-year" aria-label={fr.dashboard.filters.year}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {[...YEARS].reverse().map((year) => (
            <SelectItem key={year} value={String(year)}>
              {fr.dashboard.filters.yearOption(year)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <MultiFilter
        id="filter-bar-programme"
        label={fr.dashboard.filters.programme}
        options={PROGRAMMES.map((value) => ({ value, label: fr.dashboard.programmes[value] }))}
        selected={filters.programmes}
        onChange={(values) => update("programme", values)}
      />
      <MultiFilter
        id="filter-bar-source"
        label={fr.dashboard.filters.source}
        options={SOURCES.map((value) => ({ value, label: fr.dashboard.sources[value] }))}
        selected={filters.sources}
        onChange={(values) => update("source", values)}
      />
      {hasFilter ? (
        <Button
          id="filter-bar-reset"
          type="button"
          variant="ghost"
          onClick={() => {
            const params = new URLSearchParams(current.toString());
            params.delete("programme");
            params.delete("source");
            startTransition(() => router.replace(`${pathname}?${params}`, { scroll: false }));
          }}
        >
          {fr.dashboard.filters.reset}
        </Button>
      ) : null}
    </div>
  );
}
