"use client";

import { useEffect } from "react";
import { api } from "@/lib/api";

/**
 * Counts one visit per browser per day. The server dedupes by (visitor, day)
 * too, but a localStorage guard means we only send the ping once a day. Renders
 * nothing; fire-and-forget so it never affects the page.
 */
export function VisitTracker() {
  useEffect(() => {
    const key = "trovework_visited";
    const today = new Date().toISOString().slice(0, 10);
    try {
      if (localStorage.getItem(key) === today) return;
    } catch {
      // localStorage unavailable (private mode / disabled) — just ping.
    }
    api
      .recordVisit()
      .then(() => {
        try {
          localStorage.setItem(key, today);
        } catch {
          /* ignore */
        }
      })
      .catch(() => undefined);
  }, []);

  return null;
}
