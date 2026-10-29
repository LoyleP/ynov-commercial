"use client";

import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

/** A table row that opens `href` when clicked; its own link stays the keyboard way in. */
export function ClickableRow({
  href,
  className,
  ...props
}: ComponentProps<typeof TableRow> & { href: string }) {
  const router = useRouter();
  return (
    <TableRow
      className={cn("cursor-pointer", className)}
      onClick={() => router.push(href, { scroll: false })}
      {...props}
    />
  );
}
