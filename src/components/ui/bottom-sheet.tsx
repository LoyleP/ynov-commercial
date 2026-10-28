"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Button } from "@/components/ui/button";
import { fr } from "@/messages/fr";

/**
 * A panel that slides up from the bottom of a phone screen (menus and filters are far easier to hit
 * there than in a small dropdown): a grip, a title with its close cross, a scrolling body and an
 * optional footer for the main button. It is a Radix dialog, so focus, Escape and the click on the
 * dimmed page behave as for every other dialog of the app.
 */
export function BottomSheet({
  id,
  open,
  onOpenChange,
  title,
  headerAction,
  footer,
  children,
}: {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Beside the title, before the cross (a "Réinitialiser" link). */
  headerAction?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          id={`${id}-overlay`}
          className="data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 fixed inset-0 z-50 bg-black/40 duration-200"
        />
        <DialogPrimitive.Content
          id={id}
          aria-describedby={undefined}
          // Focus the sheet itself, not its close button, so no ring shows on opening.
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            (event.currentTarget as HTMLElement).focus();
          }}
          className="bg-background data-open:animate-in data-open:slide-in-from-bottom data-closed:animate-out data-closed:slide-out-to-bottom fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-2xl border-t shadow-2xl duration-200 outline-none"
        >
          <div
            id={`${id}-grip`}
            aria-hidden
            className="bg-muted-foreground/30 mx-auto mt-2 h-1 w-10 shrink-0 rounded-full"
          />
          <div id={`${id}-header`} className="flex shrink-0 items-center gap-2 px-4 pt-2 pb-1">
            <DialogPrimitive.Title id={`${id}-title`} className="flex-1 text-base font-semibold">
              {title}
            </DialogPrimitive.Title>
            {headerAction}
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
          <div id={`${id}-body`} className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
            {children}
          </div>
          {footer ? (
            <div
              id={`${id}-footer`}
              className="shrink-0 border-t px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
            >
              {footer}
            </div>
          ) : (
            <div className="h-[env(safe-area-inset-bottom)] shrink-0" />
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
