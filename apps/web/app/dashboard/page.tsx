"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApiError, api, homeFor } from "@/lib/api";

/**
 * Bare /dashboard has no UI of its own — it forwards to the role-specific
 * dashboard. Acts as a safety net for any link (or OAuth redirect) that points
 * at /dashboard instead of /dashboard/client|freelancer.
 */
export default function DashboardIndex() {
  const router = useRouter();

  useEffect(() => {
    api
      .me()
      .then((me) => router.replace(homeFor(me.role)))
      .catch((err) => {
        router.replace(err instanceof ApiError && err.status === 401 ? "/login?next=/dashboard" : "/login");
      });
  }, [router]);

  return (
    <div className="mx-auto max-w-page px-6 py-24 text-center text-sm text-slate-500">
      Loading your dashboard…
    </div>
  );
}
