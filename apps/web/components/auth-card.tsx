import type { ReactNode } from "react";

/** A single centred card, for the short auth steps that don't need the split panel. */
export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-slate-50/60">
      <main className="flex-1">
        <div className="mx-auto flex max-w-lg flex-col justify-center px-6 py-16">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
