import Link from "next/link";
import { ShieldCheck } from "@/components/icons";

/** A block is a paragraph (string) or a bulleted list ({ list }). */
export type LegalBlock = string | { list: string[] };
export type LegalSection = { heading: string; blocks: LegalBlock[] };

/**
 * A full legal document (Terms, Privacy). Kept in English regardless of the
 * site's locale — machine-translated legal text is a liability, so these are
 * translated only after human review.
 */
export function LegalDocument({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string[];
  sections: LegalSection[];
}) {
  return (
    <div className="flex flex-1 flex-col bg-slate-50/60">
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-16 lg:px-10">
          <h1 className="text-3xl font-bold tracking-tight text-navy-800 sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-slate-500">Last updated: {updated}</p>

          <div className="mt-6 space-y-4">
            {intro.map((p, i) => (
              <p key={i} className="text-lg leading-relaxed text-slate-600">
                {p}
              </p>
            ))}
          </div>

          {/* Honest disclaimer — this is a working template, not vetted advice. */}
          <div className="mt-8 flex gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <ShieldCheck className="h-6 w-6 shrink-0 text-amber-600" />
            <p className="text-sm leading-relaxed text-amber-800">
              This document is a plain-language template written for how Trovework works. It is not
              legal advice and should be reviewed by a qualified lawyer for your jurisdiction before
              you rely on it. Bracketed items like <span className="font-mono text-xs">[jurisdiction]</span> need
              to be filled in.
            </p>
          </div>

          <div className="mt-12 space-y-10">
            {sections.map((s, i) => (
              <section key={s.heading}>
                <h2 className="text-xl font-bold text-navy-800">
                  <span className="text-slate-400">{i + 1}.</span> {s.heading}
                </h2>
                <div className="mt-3 space-y-3">
                  {s.blocks.map((b, j) =>
                    typeof b === "string" ? (
                      <p key={j} className="text-base leading-relaxed text-slate-600">
                        {b}
                      </p>
                    ) : (
                      <ul key={j} className="ml-5 list-disc space-y-1.5 text-base leading-relaxed text-slate-600">
                        {b.list.map((li, k) => (
                          <li key={k}>{li}</li>
                        ))}
                      </ul>
                    ),
                  )}
                </div>
              </section>
            ))}
          </div>

          <p className="mt-12 border-t border-slate-200 pt-8 text-base leading-relaxed text-slate-600">
            Questions about this document?{" "}
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
