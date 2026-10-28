"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { THEME_KEY, type Theme } from "@/lib/theme";
import { fr } from "@/messages/fr";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

/** The theme currently on the page: the `dark` class set by the head script or by the switch. */
export function useTheme(): Theme {
  return useSyncExternalStore(
    subscribe,
    () => (document.documentElement.classList.contains("dark") ? "dark" : "light"),
    () => "dark",
  );
}

function setTheme(theme: Theme) {
  const root = document.documentElement;
  // Colors change all at once: no element lingers on the old theme through its own transition.
  root.classList.add("theme-switching");
  root.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Private mode: the choice just lasts until the page is closed.
  }
  requestAnimationFrame(() =>
    requestAnimationFrame(() => root.classList.remove("theme-switching")),
  );
}

export function ThemeToggle({ id = "theme-toggle" }: { id?: string }) {
  const theme = useTheme();
  const next: Theme = theme === "dark" ? "light" : "dark";
  const label = next === "light" ? fr.theme.toLight : fr.theme.toDark;
  return (
    <Button
      id={id}
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={label}
      onClick={() => setTheme(next)}
      // The icon is the theme you would switch to. The server cannot know the saved choice, so
      // its icon may differ from the first client render.
      suppressHydrationWarning
    >
      {theme === "dark" ? <Sun aria-hidden /> : <Moon aria-hidden />}
    </Button>
  );
}
