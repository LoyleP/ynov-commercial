import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { domId } from "@/lib/dom-id";

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  // Several can share a page (Settings has two): the title tells them apart.
  const id = domId("empty-state", title);
  return (
    <div
      id={id}
      className="bg-card flex flex-col items-start gap-2 rounded-xl border border-dashed p-8 sm:items-center sm:text-center"
    >
      <Icon aria-hidden className="text-muted-foreground size-6" />
      <h2 id={domId(id, "title")} className="font-semibold">
        {title}
      </h2>
      <p id={domId(id, "body")} className="text-muted-foreground max-w-md text-sm">
        {body}
      </p>
      {action ? (
        <div id={domId(id, "action")} className="mt-2">
          {action}
        </div>
      ) : null}
    </div>
  );
}
