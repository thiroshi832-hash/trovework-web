"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { api, type SessionUser } from "@/lib/api";

/**
 * The signed-in user, for client components in the header.
 *
 * The result is memoised per pathname so the two consumers that both need it —
 * the auth menu and the mobile drawer — share a single /api/auth/me instead of
 * racing two identical requests on every page load. Keying on the pathname
 * keeps the original behaviour of re-checking after a navigation, which is what
 * makes a login or logout redirect show the right chrome.
 */
let cache: { key: string; promise: Promise<SessionUser | null> } | null = null;

function load(key: string): Promise<SessionUser | null> {
  if (cache?.key === key) return cache.promise;
  const promise = api.me().catch(() => null);
  cache = { key, promise };
  return promise;
}

export function useSession() {
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let live = true;
    load(pathname).then((u) => {
      if (!live) return;
      setUser(u);
      setReady(true);
    });
    return () => {
      live = false;
    };
  }, [pathname]);

  /** Called after logout: drops the memo so the next route re-asks the API. */
  function clearSession() {
    cache = null;
    setUser(null);
  }

  return { user, ready, clearSession };
}
