import Link from "next/link";
import { ShieldCheck } from "@/components/icons";

/**
 * Terms and Privacy are linked from the register consent checkbox, so they must
 * resolve. The documents themselves are not written yet, and inventing legal
 * text would be worse than saying so plainly.
 */
export function LegalPlaceholder({ title, summary }: { title: string; summary: string }) {
  return (
    <div className="flex flex-1 flex-col bg-slate-50/60">
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-16 lg:px-10">
          <h1 className="text-3xl font-bold tracking-tight text-navy-800 sm:text-4xl">{title}</h1>
          <p className="mt-4 text-base leading-relaxed text-slate-500">{summary}</p>

          <div className="mt-8 flex gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <ShieldCheck className="h-6 w-6 shrink-0 text-amber-600" />
            <div>
              <p className="text-base font-semibold text-amber-900">Not published yet</p>
              <p className="mt-1.5 text-sm leading-relaxed text-amber-800">
                This document is still being prepared. It will be published here before Trovework
                accepts real sign-ups, and the wording will be the version you agree to.
              </p>
            </div>
          </div>

          <p className="mt-8 text-sm text-slate-500">
            Questions in the meantime?{" "}
            <Link href="/#about" className="font-semibold text-brand-600 hover:underline">
              Get in touch
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
