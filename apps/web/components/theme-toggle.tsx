"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "@/components/icons";
import { THEME_KEY, type Theme } from "@/lib/theme";

/**
 * The class on <html> is the source of truth — the pre-paint script sets it
 * before React exists — so it is read as an external store rather than mirrored
 * into state. That also means the toggle reflects the theme however it changed:
 * by this button, by the OS, or by another tab.
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const isDarkNow = () => document.documentElement.classList.contains("dark");

/** On the server there is no class yet; hydration re-reads the real value. */
const isDarkOnServer = () => false;

function storedChoice(): string | null {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    // Locked-down browser: treat it as "no choice stored".
    return null;
  }
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const isDark = useSyncExternalStore(subscribe, isDarkNow, isDarkOnServer);

  // While no explicit choice is stored, keep following the OS. Someone who has
  // never touched the toggle expects the site to darken when their system does.
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    function onChange(e: MediaQueryListEvent) {
      const stored = storedChoice();
      if (stored === "light" || stored === "dark") return;
      document.documentElement.classList.toggle("dark", e.matches);
    }
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  function toggle() {
    const next: Theme = isDarkNow() ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Private mode: the theme still applies, it just won't survive a reload.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light and dark theme"
      aria-pressed={isDark}
      title="Toggle light and dark theme"
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-navy-800 ${className}`}
    >
      {/* Which glyph shows is a CSS decision, so it is right on the first frame
          rather than after hydration. */}
      <Sun className="hidden h-5 w-5 dark:block" />
      <Moon className="h-5 w-5 dark:hidden" />
    </button>
  );
}
