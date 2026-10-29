"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { SidePeek } from "@/components/side-peek";

/** The side panel of one agent: closing it takes `?agent=` out of the address. */
export function AgentPanel({
  name,
  subtitle,
  children,
}: {
  name: string;
  subtitle: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const current = useSearchParams();

  function close() {
    const params = new URLSearchParams(current.toString());
    params.delete("agent");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <SidePeek id="agent-panel" title={name} subtitle={subtitle} onClose={close}>
      {children}
    </SidePeek>
  );
}
