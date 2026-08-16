import type { ReactNode } from "react";

/**
 * The split card both verification steps share: a navy panel on the left
 * carrying the pitch, the step's form on the right.
 *
 * The comps put a Trovework logo at the top of the navy panel; here the site
 * header above already carries one, so it would be a second logo on screen.
 */
export function VerifyShell({
  panel,
  children,
}: {
  panel: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col bg-slate-50/60">
      <main className="flex-1">
        <div className="mx-auto max-w-page px-6 py-8">
          <div className="grid overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 lg:grid-cols-[4.5fr_5.5fr]">
            <div className="relative flex items-center overflow-hidden bg-navy-900 px-10 py-12 sm:px-12 sm:py-14 lg:px-14 lg:py-16">
              <div
                aria-hidden
                className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-brand-600/20 blur-3xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl"
              />
              <div className="relative w-full">{panel}</div>
            </div>

            <div className="flex items-center bg-white p-6 sm:p-10 lg:p-12">
              <div className="w-full">{children}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
