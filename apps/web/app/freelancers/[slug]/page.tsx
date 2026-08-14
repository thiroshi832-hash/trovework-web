import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Portrait, Stars } from "@/components/brand";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Clock,
  Lock,
  MapPin,
  Star,
} from "@/components/icons";
import { FREELANCERS, freelancerBySlug } from "@/lib/freelancers";

export function generateStaticParams() {
  return FREELANCERS.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const f = freelancerBySlug(slug);
  if (!f) return { title: "Freelancer not found — Trovework" };
  return {
    title: `${f.name} — ${f.title} | Trovework`,
    description: f.blurb,
  };
}

/* A stand-in for portfolio artwork: a small browser-window mock, so the shape
   of the section is right until real project images exist. */
function PortfolioThumb({ tint }: { tint: string }) {
  return (
    <div className="aspect-[4/3] overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
      <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <span className="ml-1.5 h-1.5 flex-1 rounded bg-slate-200/80" />
      </div>
      <div className="flex h-full gap-2 p-2.5">
        <div className={`w-1/4 space-y-1.5 rounded ${tint} p-1.5`}>
          <span className="block h-1.5 w-full rounded bg-white/70" />
          <span className="block h-1.5 w-4/5 rounded bg-white/60" />
          <span className="block h-1.5 w-3/5 rounded bg-white/50" />
        </div>
        <div className="flex-1 space-y-1.5">
          <span className="block h-1.5 w-full rounded bg-slate-200/80" />
          <span className="block h-1.5 w-5/6 rounded bg-slate-200/70" />
          <span className="block h-1.5 w-2/3 rounded bg-slate-200/60" />
          <span className="block h-1.5 w-4/5 rounded bg-slate-200/60" />
          <span className="block h-1.5 w-1/2 rounded bg-slate-200/50" />
        </div>
      </div>
    </div>
  );
}

const TINTS = ["bg-slate-300/60", "bg-brand-400/70", "bg-brand-300/60"];

export default async function FreelancerProfile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const f = freelancerBySlug(slug);
  if (!f) notFound();

  return (
    <div className="flex flex-1 flex-col bg-slate-50/60">
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            {/* ------------------------------ hero ---------------------------- */}
            <div className="relative overflow-hidden bg-navy-900 px-8 py-8 sm:px-10 sm:py-10">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-600/20 blur-3xl"
              />
              <div className="relative">
                <Link
                  href="/search"
                  className="inline-flex items-center gap-1.5 text-sm text-brand-100 transition hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to search
                </Link>

                <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <Portrait src={f.photo} sizes="128px" className="h-28 w-28 ring-4 ring-white/20" />

                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-white sm:text-3xl">{f.name}</h1>
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
                            <path
                              d="m5 12.5 4.5 4.5L19 7"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </div>
                      <p className="mt-1.5 text-base text-brand-100">{f.title}</p>
                      <p className="mt-2.5 flex items-center gap-1.5 text-sm text-brand-100">
                        <MapPin className="h-4 w-4" />
                        {f.country}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col lg:w-56">
                    <button
                      type="button"
                      className="rounded-lg bg-brand-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
                    >
                      Request to Chat
                    </button>
                    <button
                      type="button"
                      className="rounded-lg bg-white px-7 py-3 text-sm font-semibold text-navy-800 transition hover:bg-slate-100"
                    >
                      Save
                    </button>
                  </div>
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/10 pt-5 text-sm text-white">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-brand-200" />${f.rate} /hr
                  </span>
                  <span className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-400" />
                    {f.rating.toFixed(1)} ({f.reviews} reviews)
                  </span>
                  <span className="flex items-center gap-2">
                    <CalendarCheck className="h-4 w-4 text-brand-200" />
                    Member since {f.memberSince}
                  </span>
                </div>
              </div>
            </div>

            {/* ------------------------------ body ---------------------------- */}
            <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
              {/* left column */}
              <div>
                <h2 className="text-base font-bold text-navy-800">About Me</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">{f.about}</p>

                <h2 className="mt-8 text-base font-bold text-navy-800">Skills</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {f.allSkills.map((s) => (
                    <span key={s} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                      {s}
                    </span>
                  ))}
                </div>

                <h2 className="mt-8 text-base font-bold text-navy-800">Work Categories</h2>
                <p className="mt-3 text-sm text-slate-500">{f.workCategories.join(", ")}</p>

                <h2 className="mt-8 text-base font-bold text-navy-800">Hourly Rate</h2>
                <p className="mt-3 text-sm text-slate-500">${f.rate} /hr</p>
              </div>

              {/* right column */}
              <div className="space-y-6">
                <section className="rounded-xl border border-slate-200 bg-white p-6">
                  <h2 className="text-base font-bold text-navy-800">Portfolio</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    {f.portfolio.map((p, i) => (
                      <figure key={p}>
                        <PortfolioThumb tint={TINTS[i % TINTS.length]} />
                        <figcaption className="mt-2.5 text-center text-sm font-medium text-navy-800">
                          {p}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                  <p className="mt-4 text-right">
                    <Link
                      href="#"
                      className="group inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
                    >
                      View more projects
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </Link>
                  </p>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-6">
                  <h2 className="text-base font-bold text-navy-800">Reviews ({f.reviews})</h2>

                  <div className="mt-4 grid gap-6 sm:grid-cols-[200px_1fr]">
                    <div>
                      <div className="flex items-end gap-3">
                        <span className="text-4xl font-bold leading-none text-navy-800">
                          {f.rating.toFixed(1)}
                        </span>
                        <Stars rating={f.rating} className="pb-1" />
                      </div>
                      <dl className="mt-4 space-y-1.5">
                        {f.ratingBreakdown.map((pct, i) => (
                          <div key={i} className="flex items-center gap-2.5 text-xs text-slate-500">
                            <dt className="flex w-7 shrink-0 items-center gap-0.5">
                              {5 - i}
                              <Star className="h-3 w-3 text-slate-400" />
                            </dt>
                            <dd className="flex flex-1 items-center gap-2.5">
                              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                                <span className="block h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                              </span>
                              <span className="w-9 shrink-0 text-right">{pct}%</span>
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>

                    <figure className="border-slate-200 sm:border-l sm:pl-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Portrait src="/avatars/community-1.jpg" sizes="40px" className="h-10 w-10" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-navy-800">{f.latestReview.author}</p>
                              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-600">
                                {f.latestReview.role}
                              </span>
                            </div>
                            <Stars rating={f.latestReview.rating} className="mt-1.5" />
                          </div>
                        </div>
                        <span className="shrink-0 text-xs text-slate-400">{f.latestReview.when}</span>
                      </div>
                      <blockquote className="mt-3.5 text-sm leading-relaxed text-slate-500">
                        {f.latestReview.body}
                      </blockquote>
                    </figure>
                  </div>

                  <p className="mt-5 text-right">
                    <Link
                      href="#"
                      className="group inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
                    >
                      View all reviews
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </Link>
                  </p>
                </section>
              </div>
            </div>

            {/* Contact details are released by the API only to verified clients —
                the page never receives them, so this is the whole story here. */}
            <Link
              href="/verify/id"
              className="flex items-center justify-center gap-2.5 border-t border-slate-200 bg-slate-50 px-6 py-4 text-sm font-medium text-brand-600 transition hover:bg-slate-100"
            >
              <Lock className="h-4 w-4" />
              Contact information is available after ID verification.
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
