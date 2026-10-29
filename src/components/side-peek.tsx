"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Button } from "@/components/ui/button";
import { fr } from "@/messages/fr";

/**
 * A panel on the right of the page that shows the details of one record without leaving the list:
 * 2/5 of the screen from 1024px up (30rem at least), nearly the full width on smaller screens. It is
 * a Radix dialog, so focus, Escape and a click on the dimmed page close it like every other dialog.
 */
export function SidePeek({
  id,
  title,
  subtitle,
  onClose,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <DialogPrimitive.Root open onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          id={`${id}-overlay`}
          className="data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 fixed inset-0 z-50 bg-black/10 backdrop-blur-xs duration-100"
        />
        <DialogPrimitive.Content
          id={id}
          aria-describedby={undefined}
          className="bg-background data-open:animate-in data-open:slide-in-from-right data-closed:animate-out data-closed:slide-out-to-right fixed inset-y-0 right-0 z-50 flex w-[min(100vw,46rem)] flex-col border-l shadow-2xl duration-200 outline-none lg:w-2/5 lg:min-w-[30rem]"
        >
          <div id={`${id}-header`} className="flex shrink-0 items-start gap-2 border-b px-6 py-4">
            <div className="min-w-0 flex-1">
              <DialogPrimitive.Title id={`${id}-title`} className="text-lg font-semibold">
                {title}
              </DialogPrimitive.Title>
              {subtitle ? (
                <p id={`${id}-subtitle`} className="text-muted-foreground text-sm">
                  {subtitle}
                </p>
              ) : null}
            </div>
            <DialogPrimitive.Close asChild>
              <Button
                id={`${id}-close`}
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={fr.peek.close}
              >
                <X aria-hidden />
              </Button>
            </DialogPrimitive.Close>
          </div>
          <div id={`${id}-body`} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
            {children}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
