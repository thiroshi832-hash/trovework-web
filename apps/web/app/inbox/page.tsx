import type { Metadata } from "next";
import { Suspense } from "react";
import { Inbox } from "@/components/inbox";

export const metadata: Metadata = {
  title: "Inbox — Trovework",
  description: "Your conversations with verified clients.",
  robots: { index: false, follow: false },
};

export default function InboxPage() {
  return (
    <div className="flex flex-1 flex-col bg-slate-50/60">
      <main className="flex-1">
        <div className="mx-auto max-w-page px-6 lg:px-10 xl:px-16 py-8">
          <h1 className="text-2xl font-bold tracking-tight text-navy-800 sm:text-3xl">Inbox</h1>
          <p className="mt-2 text-base text-slate-500">
            Every person here has passed identity verification.
          </p>
          <div className="mt-8">
            {/* useSearchParams (the ?c= deep link) needs a Suspense boundary. */}
            <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />}>
              <Inbox />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
