"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Portrait } from "@/components/brand";
import { ChevronDown, Search, Star } from "@/components/icons";
import { AVAILABILITY, CATEGORIES, CATEGORIES_COLLAPSED } from "@/lib/categories";
import { VISIBLE_FREELANCERS as FREELANCERS } from "@/lib/freelancers";

const ALL = "All Categories";
const ANY_AVAILABILITY = "Anytime";

const RATINGS = [
  { label: "5.0", min: 5 },
  { label: "4.0 & up", min: 4 },
  { label: "3.0 & up", min: 3 },
  { label: "2.0 & up", min: 2 },
];

const SORTS = ["Newest", "Top rated", "Lowest price", "Highest price"] as const;
type Sort = (typeof SORTS)[number];

type Filters = {
  category: string;
  skill: string;
  min: string;
  max: string;
  rating: number;
  availability: string;
};

const EMPTY: Filters = {
  category: ALL,
  skill: "",
  min: "",
  max: "",
  rating: 0,
  availability: ANY_AVAILABILITY,
};

const selectBase =
  "w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-3.5 pr-9 text-sm text-navy-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const numberBase =
  "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-navy-800 placeholder:text-slate-400 focus:outline-none focus:ring-2";

function SelectShell({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative block">
      {children}
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </span>
  );
}

export function BrowseFreelancers({ initialCategory }: { initialCategory?: string }) {
  // Every control filters as you change it. An explicit "apply" step made the
  // sidebar look broken: clicking a category did nothing until you found the button.
  const [filters, setFilters] = useState<Filters>({
    ...EMPTY,
    category:
      initialCategory && (CATEGORIES as readonly string[]).includes(initialCategory)
        ? initialCategory
        : ALL,
  });
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<Sort>("Newest");
  const resultsRef = useRef<HTMLDivElement>(null);

  const set = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));

  const skills = useMemo(() => [...new Set(FREELANCERS.flatMap((f) => f.allSkills))].sort(), []);

  /** Per-category totals, so empty categories are visibly empty before you click. */
  const counts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const f of FREELANCERS) out[f.category] = (out[f.category] ?? 0) + 1;
    return out;
  }, []);

  // A blank field means "no bound" — 0 is a real bound, so `||` would be wrong here.
  const min = filters.min.trim() === "" ? 0 : Number(filters.min);
  const max = filters.max.trim() === "" ? Infinity : Number(filters.max);
  const rangeInverted = Number.isFinite(max) && min > max;

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    const lo = Number.isNaN(min) ? 0 : min;
    const hi = Number.isNaN(max) ? Infinity : max;

    const matched = FREELANCERS.filter((f) => {
      if (filters.category !== ALL && f.category !== filters.category) return false;
      if (filters.skill && !f.allSkills.includes(filters.skill)) return false;
      if (f.rate < lo || f.rate > hi) return false;
      if (f.rating < filters.rating) return false;
      if (filters.availability !== ANY_AVAILABILITY && f.availability !== filters.availability) {
        return false;
      }
      if (q) {
        const haystack = [f.name, f.title, f.blurb, f.category, ...f.allSkills].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    const ordered = [...matched];
    if (sort === "Newest") ordered.sort((a, b) => b.joined.localeCompare(a.joined));
    if (sort === "Top rated") ordered.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    if (sort === "Lowest price") ordered.sort((a, b) => a.rate - b.rate);
    if (sort === "Highest price") ordered.sort((a, b) => b.rate - a.rate);
    return ordered;
  }, [filters, search, sort, min, max]);

  const activeCount =
    (filters.category !== ALL ? 1 : 0) +
    (filters.skill ? 1 : 0) +
    (filters.min.trim() !== "" || filters.max.trim() !== "" ? 1 : 0) +
    (filters.rating ? 1 : 0) +
    (filters.availability !== ANY_AVAILABILITY ? 1 : 0);

  const shownCategories = showAllCategories ? CATEGORIES : CATEGORIES.slice(0, CATEGORIES_COLLAPSED);

  return (
    <div className="mx-auto max-w-page px-6 lg:px-10 xl:px-16 py-8">
      {/* ----------------------------- search bar ---------------------------- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <form className="flex flex-1 gap-3" onSubmit={(e) => e.preventDefault()} role="search">
          <label className="sr-only" htmlFor="browse-search">
            Search by keyword, skill or service
          </label>
          <input
            id="browse-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by keyword, skill or service..."
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-navy-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-brand-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Search
          </button>
        </form>

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
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* ------------------------------ filters ---------------------------- */}
        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-navy-800">Filters</h2>
            <button
              type="button"
              onClick={() => setFilters(EMPTY)}
              disabled={activeCount === 0}
              className="text-xs text-brand-600 transition hover:text-brand-700 disabled:text-slate-300"
            >
              Clear all{activeCount ? ` (${activeCount})` : ""}
            </button>
          </div>

          <div className="mt-5">
            <h3 className="text-sm font-semibold text-navy-800">Category</h3>
            <ul className="mt-3 space-y-1">
              {[ALL, ...shownCategories].map((c) => {
                const on = filters.category === c;
                const count = c === ALL ? FREELANCERS.length : counts[c] ?? 0;
                return (
                  <li key={c}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => set({ category: c })}
                      className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition ${
                        on ? "bg-slate-100 font-medium text-navy-800" : "text-slate-500 hover:text-navy-800"
                      }`}
                    >
                      <span className={`h-3.5 w-1 shrink-0 rounded-full ${on ? "bg-brand-600" : "bg-transparent"}`} />
                      <span className="flex-1">{c}</span>
                      <span className={count === 0 ? "text-slate-300" : "text-slate-400"}>{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {CATEGORIES.length > CATEGORIES_COLLAPSED ? (
              <button
                type="button"
                aria-expanded={showAllCategories}
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="mt-2 px-2.5 text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                {showAllCategories ? "Show fewer" : `More (${CATEGORIES.length - CATEGORIES_COLLAPSED})`}
              </button>
            ) : null}
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-navy-800">Skills</h3>
            <SelectShell>
              <select
                aria-label="Skills"
                value={filters.skill}
                onChange={(e) => set({ skill: e.target.value })}
                className={`${selectBase} mt-3`}
              >
                <option value="">All skills</option>
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
                aria-invalid={rangeInverted || undefined}
                placeholder="Min"
                value={filters.min}
                onChange={(e) => set({ min: e.target.value })}
                className={`${numberBase} ${
                  rangeInverted
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-slate-200 focus:border-brand-500 focus:ring-brand-100"
                }`}
              />
              <input
                type="number"
                min={0}
                inputMode="numeric"
                aria-label="Maximum hourly rate"
                aria-invalid={rangeInverted || undefined}
                placeholder="Max"
                value={filters.max}
                onChange={(e) => set({ max: e.target.value })}
                className={`${numberBase} ${
                  rangeInverted
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-slate-200 focus:border-brand-500 focus:ring-brand-100"
                }`}
              />
            </div>
            {rangeInverted ? (
              <p role="alert" className="mt-2 text-xs text-red-600">
                Min is above max, so nothing can match.
              </p>
            ) : null}
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-navy-800">Availability</h3>
            <SelectShell>
              <select
                aria-label="Availability"
                value={filters.availability}
                onChange={(e) => set({ availability: e.target.value })}
                className={`${selectBase} mt-3`}
              >
                {AVAILABILITY.map((a) => (
                  <option key={a}>{a}</option>
                ))}
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
                    checked={filters.rating === r.min}
                    onChange={() => set({ rating: r.min })}
                    className="h-4 w-4 accent-brand-600"
                  />
                  {r.label}
                </label>
              ))}
              {filters.rating ? (
                <button
                  type="button"
                  onClick={() => set({ rating: 0 })}
                  className="text-xs text-brand-600 hover:text-brand-700"
                >
                  Any rating
                </button>
              ) : null}
            </div>
          </fieldset>

          {/* Filters are already live; on narrow screens the sidebar sits above
              the list, so this jumps down to the results it just changed. */}
          <button
            type="button"
            onClick={() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="mt-6 w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Show {results.length} {results.length === 1 ? "result" : "results"}
          </button>
        </aside>

        {/* ------------------------------ results ---------------------------- */}
        <div ref={resultsRef} className="scroll-mt-24">
          <p role="status" className="mb-4 text-sm text-slate-500">
            <span className="font-semibold text-navy-800">{results.length}</span>{" "}
            {results.length === 1 ? "freelancer" : "freelancers"}
            {filters.category !== ALL ? ` in ${filters.category}` : ""}
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
                          {f.idVerified ? (
                            <span
                              title="Identity verified"
                              className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-600 text-white"
                            >
                              <span className="sr-only">Identity verified</span>
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
                          ) : null}
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
                <p className="mt-1 text-sm text-slate-500">
                  Try widening the price range or clearing a filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFilters(EMPTY);
                    setSearch("");
                  }}
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
              <span
                aria-current="page"
                className="grid h-9 w-9 place-items-center rounded-md bg-brand-600 text-sm font-semibold text-white"
              >
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
