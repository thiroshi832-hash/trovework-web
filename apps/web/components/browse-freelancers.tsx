"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Portrait } from "@/components/brand";
import { ChevronDown, Search, Star } from "@/components/icons";
import { CATEGORIES, FREELANCERS } from "@/lib/freelancers";

const ALL = "All Categories";
const RATINGS = [
  { label: "5.0", min: 5 },
  { label: "4.0 & up", min: 4 },
  { label: "3.0 & up", min: 3 },
  { label: "2.0 & up", min: 2 },
];
const SORTS = ["Newest", "Top rated", "Lowest price", "Highest price"] as const;
type Sort = (typeof SORTS)[number];

const selectBase =
  "w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-3.5 pr-9 text-sm text-navy-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

function SelectShell({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative block">
      {children}
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </span>
  );
}

export function BrowseFreelancers() {
  // `applied` is what the list actually uses; the sidebar edits a draft until
  // "Apply Filters" is pressed, matching the comp's explicit apply step.
  const [draft, setDraft] = useState({ category: ALL, skill: "", min: "", max: "", rating: 0 });
  const [applied, setApplied] = useState(draft);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<Sort>("Newest");

  const skills = useMemo(
    () => [...new Set(FREELANCERS.flatMap((f) => f.allSkills))].sort(),
    [],
  );

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    const min = Number(applied.min) || 0;
    const max = Number(applied.max) || Infinity;

    const matched = FREELANCERS.filter((f) => {
      if (applied.category !== ALL && f.category !== applied.category) return false;
      if (applied.skill && !f.allSkills.includes(applied.skill)) return false;
      if (f.rate < min || f.rate > max) return false;
      if (f.rating < applied.rating) return false;
      if (q) {
        const haystack = [f.name, f.title, f.blurb, ...f.allSkills].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    const ordered = [...matched];
    if (sort === "Top rated") ordered.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    if (sort === "Lowest price") ordered.sort((a, b) => a.rate - b.rate);
    if (sort === "Highest price") ordered.sort((a, b) => b.rate - a.rate);
    return ordered;
  }, [applied, search, sort]);

  function clearAll() {
    const empty = { category: ALL, skill: "", min: "", max: "", rating: 0 };
    setDraft(empty);
    setApplied(empty);
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* ----------------------------- search bar ---------------------------- */}
      <form
        className="flex flex-col gap-4 sm:flex-row sm:items-center"
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(query);
        }}
      >
        <div className="flex flex-1 gap-3">
          <label className="sr-only" htmlFor="browse-search">
            Search by keyword, skill or service
          </label>
          <input
            id="browse-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by keyword, skill or service..."
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-navy-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-brand-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Search
          </button>
        </div>

        <div className="flex items-center gap-3 sm:shrink-0">
          <span className="text-sm text-slate-500">Sort by</span>
          <SelectShell>
            <select
              aria-label="Sort by"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className={`${selectBase} sm:w-44`}
            >
              {SORTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </SelectShell>
        </div>
      </form>

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* ------------------------------ filters ---------------------------- */}
        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-navy-800">Filters</h2>
            <button type="button" onClick={clearAll} className="text-xs text-brand-600 hover:text-brand-700">
              Clear all
            </button>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-navy-800">Category</h3>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
            <ul className="mt-3 space-y-1">
              {[ALL, ...CATEGORIES].map((c) => {
                const active = draft.category === c;
                return (
                  <li key={c}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => setDraft({ ...draft, category: c })}
                      className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition ${
                        active ? "bg-slate-100 font-medium text-navy-800" : "text-slate-500 hover:text-navy-800"
                      }`}
                    >
                      <span className={`h-3.5 w-1 rounded-full ${active ? "bg-brand-600" : "bg-transparent"}`} />
                      {c}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-navy-800">Skills</h3>
            <SelectShell>
              <select
                aria-label="Skills"
                value={draft.skill}
                onChange={(e) => setDraft({ ...draft, skill: e.target.value })}
                className={`${selectBase} mt-3`}
              >
                <option value="">Select skills</option>
                {skills.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </SelectShell>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-navy-800">Price Range (USD)</h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <input
                type="number"
                min={0}
                inputMode="numeric"
                aria-label="Minimum hourly rate"
                placeholder="Min"
                value={draft.min}
                onChange={(e) => setDraft({ ...draft, min: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-navy-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <input
                type="number"
                min={0}
                inputMode="numeric"
                aria-label="Maximum hourly rate"
                placeholder="Max"
                value={draft.max}
                onChange={(e) => setDraft({ ...draft, max: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-navy-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-navy-800">Availability</h3>
            <SelectShell>
              <select aria-label="Availability" className={`${selectBase} mt-3`} defaultValue="Anytime">
                <option>Anytime</option>
                <option>Within 24 hours</option>
                <option>This week</option>
              </select>
            </SelectShell>
          </div>

          <fieldset className="mt-6">
            <legend className="text-sm font-semibold text-navy-800">Rating</legend>
            <div className="mt-3 space-y-2.5">
              {RATINGS.map((r) => (
                <label key={r.label} className="flex items-center gap-2.5 text-sm text-slate-600">
                  <input
                    type="radio"
                    name="rating"
                    checked={draft.rating === r.min}
                    onChange={() => setDraft({ ...draft, rating: r.min })}
                    className="h-4 w-4 accent-brand-600"
                  />
                  {r.label}
                </label>
              ))}
            </div>
          </fieldset>

          <button
            type="button"
            onClick={() => setApplied(draft)}
            className="mt-6 w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Apply Filters
          </button>
        </aside>

        {/* ------------------------------ results ---------------------------- */}
        <div>
          <p className="sr-only" role="status">
            {results.length} freelancers found
          </p>

          <div className="space-y-5">
            {results.map((f) => (
              <article key={f.slug} className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="flex flex-col gap-5 sm:flex-row">
                  <Portrait src={f.photo} sizes="96px" className="h-24 w-24" />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-navy-800">{f.name}</h3>
                          <span className="grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
                            <svg viewBox="0 0 24 24" className="h-3 w-3" aria-hidden>
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
                        <p className="mt-1 text-sm text-slate-500">{f.title}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-bold text-navy-800">
                          ${f.rate}
                          <span className="text-xs font-medium text-slate-400"> /hr</span>
                        </p>
                        <p className="mt-1 flex items-center justify-end gap-1.5 text-sm">
                          <Star className="h-4 w-4 text-amber-400" />
                          <span className="font-semibold text-navy-800">{f.rating.toFixed(1)}</span>
                          <span className="text-slate-400">({f.reviews})</span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {f.skills.map((s) => (
                        <span key={s} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                      <p className="max-w-lg text-sm leading-relaxed text-slate-500">{f.blurb}</p>
                      <Link
                        href={`/freelancers/${f.slug}`}
                        className="shrink-0 rounded-lg border border-brand-200 px-5 py-2.5 text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}

            {results.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <Search className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 font-semibold text-navy-800">No freelancers match those filters</p>
                <p className="mt-1 text-sm text-slate-500">Try widening the price range or clearing a filter.</p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-5 rounded-lg border border-brand-200 px-5 py-2.5 text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
                >
                  Clear all filters
                </button>
              </div>
            ) : null}
          </div>

          {/* Pagination is presentational until the search API can page results. */}
          {results.length > 0 ? (
            <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-md text-slate-300">‹</span>
              <span aria-current="page" className="grid h-9 w-9 place-items-center rounded-md bg-brand-600 text-sm font-semibold text-white">
                1
              </span>
              {[2, 3, 4].map((n) => (
                <span key={n} className="grid h-9 w-9 place-items-center rounded-md text-sm text-slate-400">
                  {n}
                </span>
              ))}
              <span className="px-1 text-slate-400">…</span>
              <span className="grid h-9 w-9 place-items-center rounded-md text-sm text-slate-400">20</span>
              <span className="grid h-9 w-9 place-items-center rounded-md text-slate-300">›</span>
            </nav>
          ) : null}
        </div>
      </div>
    </div>
  );
}
