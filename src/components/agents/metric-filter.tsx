"use client";

import { Check } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { FilterShell } from "@/components/dashboard/filter-bar";
import { domId } from "@/lib/dom-id";
import { METRICS, type Metric } from "@/lib/leads/agents";
import { fr } from "@/messages/fr";

/** Chooses which figure the evolution curves of the table show; kept in the URL (`?metrique=`). */
export function MetricFilter({ metric }: { metric: Metric }) {
  const router = useRouter();
  const pathname = usePathname();
  const current = useSearchParams();
  const [, startTransition] = useTransition();

  function change(next: Metric) {
    const params = new URLSearchParams(current.toString());
    if (next === "leads") params.delete("metrique");
    else params.set("metrique", next);
    startTransition(() => router.replace(`${pathname}?${params}`, { scroll: false }));
  }

  return (
    <FilterShell
      id="filter-bar-metric"
      label={fr.agents.metricFilter}
      summary={fr.agents.metrics[metric]}
    >
      {(close) => (
        <ul id="filter-bar-metric-options" className="space-y-0.5">
          {METRICS.map((value) => (
            <li key={value}>
              <button
                id={domId("filter-bar-metric-option", value)}
                type="button"
                onClick={() => {
                  change(value);
                  close();
                }}
                className="hover:bg-accent flex w-full items-center justify-between gap-2 rounded-md px-1.5 py-1.5 text-left text-sm"
              >
                {fr.agents.metrics[value]}
                {value === metric ? <Check aria-hidden className="size-4" /> : null}
              </button>
            </li>
          ))}
        </ul>
      )}
    </FilterShell>
  );
}
