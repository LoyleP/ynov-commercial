"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { domId } from "@/lib/dom-id";
import { cn } from "@/lib/utils";
import { fr } from "@/messages/fr";

const LINKS = [
  { id: "dashboard", href: "/", label: fr.nav.dashboard },
  { id: "agents", href: "/agents", label: fr.nav.agents },
] as const;

export function AppHeader() {
  const pathname = usePathname();
  return (
    <header id="app-header" className="border-b">
      <div className="page-width mx-auto flex h-14 w-full items-center gap-6 px-6 sm:px-12 lg:px-24">
        <span id="app-header-name" className="font-semibold">
          {fr.app.name}
        </span>
        <nav
          id="app-header-nav"
          aria-label={fr.nav.label}
          className="flex flex-1 items-center gap-1"
        >
          {LINKS.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.id}
                id={domId("app-header-link", link.id)}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg px-2.5 py-1 text-sm font-medium transition-colors",
                  active && "bg-accent text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
