import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { formatChange, formatPoints } from "@/lib/format";
import { cn } from "@/lib/utils";
import { fr } from "@/messages/fr";

/** The change of a figure against the compared stretch; nothing when there is no comparison. */
export function DeltaPill({
  id,
  value,
  previous,
  asRate = false,
}: {
  id?: string;
  value: number;
  previous: number | null;
  /** The figures are ratios: the change is in percentage points. */
  asRate?: boolean;
}) {
  if (previous === null) return null;
  // A percentage change from zero is undefined: show a dash rather than a misleading "0 %".
  const noBase = !asRate && previous === 0 && value > 0;
  const direction = noBase ? 0 : Math.sign(Number((value - previous).toFixed(6)));
  const Icon = direction > 0 ? ArrowUp : direction < 0 ? ArrowDown : Minus;
  const text = noBase
    ? fr.dashboard.kpis.noBase
    : asRate
      ? formatPoints(value, previous, fr.dashboard.kpis.points)
      : formatChange(value, previous);
  return (
    <span
      id={id}
      className={cn(
        "inline-flex h-5 items-center gap-0.5 rounded-full px-1.5 text-xs font-medium whitespace-nowrap",
        direction > 0 && "bg-success text-success-foreground",
        direction < 0 && "bg-destructive/10 text-destructive",
        direction === 0 && "bg-muted text-muted-foreground",
      )}
    >
      <Icon aria-hidden className="size-3" />
      {text}
    </span>
  );
}
