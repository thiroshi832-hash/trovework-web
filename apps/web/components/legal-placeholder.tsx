import Link from "next/link";
import { ShieldCheck } from "@/components/icons";

export type LegalPoint = { heading: string; body: string };

/**
 * Terms and Privacy are linked from the register consent checkbox, so they must
 * resolve. The documents themselves are not written yet — rather than paste in
 * boilerplate nobody would read, or invent binding text, the page says where
 * things stand and explains in plain words what the document will cover.
 */
export function LegalPlaceholder({
  title,
  lead,
  points,
}: {
  title: string;
  lead: string;
  points: LegalPoint[];
}) {
  return (
    <div className="flex flex-1 flex-col bg-slate-50/60">
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-16 lg:px-10">
          <h1 className="text-3xl font-bold tracking-tight text-navy-800 sm:text-4xl">{title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">{lead}</p>

          <div className="mt-8 flex gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <ShieldCheck className="h-6 w-6 shrink-0 text-amber-600" />
            <div>
              <p className="text-base font-semibold text-amber-900">We&apos;re still writing this one</p>
              <p className="mt-1.5 text-sm leading-relaxed text-amber-800">
                We&apos;d rather give you something worth reading than paste in boilerplate. The full
                text will be here before anyone can sign up for real — and it&apos;ll be the version
                you agree to, not a summary of it.
              </p>
            </div>
          </div>

          <h2 className="mt-12 text-xl font-bold text-navy-800">Here&apos;s what it will cover</h2>
          <dl className="mt-6 space-y-7">
            {points.map((p) => (
              <div key={p.heading}>
                <dt className="text-base font-semibold text-navy-800">{p.heading}</dt>
                <dd className="mt-1.5 text-base leading-relaxed text-slate-600">{p.body}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-12 border-t border-slate-200 pt-8 text-base leading-relaxed text-slate-600">
            Something here worry you, or want to know where we&apos;ve got to?{" "}
            <Link href="/#about" className="font-semibold text-brand-600 hover:underline">
              Ask us
            </Link>{" "}
            — we&apos;d rather hear it now than after you&apos;ve signed up.
          </p>
        </div>
      </main>
    </div>
  );
}
