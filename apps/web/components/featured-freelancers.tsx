"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Portrait } from "@/components/brand";
import { ArrowRight, Star } from "@/components/icons";
import { api } from "@/lib/api";

interface Row {
  slug: string;
  displayName: string;
  headline?: string | null;
  category: string;
  hourlyRate?: number | string | null;
  skills?: string[];
  photoPath?: string | null;
  rating: number;
  reviewCount: number;
}

const CARD =
  "rounded-xl bg-white shadow-[0_1px_2px_rgba(11,28,56,0.04),0_10px_28px_-16px_rgba(11,28,56,0.18)] ring-1 ring-slate-200/70";

function initials(name: string): string {
  return name.split(/\s+/).map((p) => p[0] ?? "").join("").slice(0, 2).toUpperCase() || "?";
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5 text-amber-400" aria-label={`${rating} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} className={`h-4 w-4 ${i < Math.round(rating) ? "" : "text-slate-200"}`} />
      ))}
    </span>
  );
}

function VerifiedTick() {
  return (
    <span title="Identity verified" className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
      <span className="sr-only">Identity verified</span>
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
        <path d="m5 12.5 4.5 4.5L19 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/**
 * Real verified freelancers for the landing page, from the public
 * /freelancers/featured endpoint. Renders nothing until it has loaded and
 * nothing at all when there are no verified freelancers yet — so the marketing
 * page never shows fabricated people.
 */
export function FeaturedFreelancers() {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    let live = true;
    api.freelancers
      .featured()
      .then((r) => live && setRows(r as Row[]))
      .catch(() => live && setRows([]));
    return () => {
      live = false;
    };
  }, []);

  if (!rows || rows.length === 0) return null;

  return (
    <section className="mx-auto max-w-page px-6 lg:px-10 xl:px-16 py-10">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-navy-800 sm:text-3xl">Featured Freelancers</h2>
        <Link
          href="/freelancers"
          className="group hidden shrink-0 items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 sm:flex"
        >
          View all freelancers
          <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {rows.map((f) => (
          <Link
            key={f.slug}
            href={`/freelancers/${f.slug}`}
            className={`relative flex flex-col p-6 text-center transition hover:shadow-md ${CARD}`}
          >
            {f.photoPath ? (
              <Portrait src={f.photoPath} className="mx-auto h-28 w-28" sizes="112px" />
            ) : (
              <span className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-3xl font-semibold text-white">
                {initials(f.displayName)}
              </span>
            )}
            <div className="mt-4 flex items-center justify-center gap-1.5">
              <h3 className="font-semibold text-navy-800">{f.displayName}</h3>
              <VerifiedTick />
            </div>
            <p className="mt-1 text-xs text-slate-500">{f.headline || f.category}</p>
            <div className="mt-2.5 flex items-center justify-center gap-1.5">
              <Stars rating={f.rating} />
              <span className="text-xs text-slate-500">
                {f.rating.toFixed(1)} ({f.reviewCount})
              </span>
            </div>
            <div className="mt-3.5 flex flex-wrap justify-center gap-1.5">
              {(f.skills ?? []).slice(0, 4).map((s) => (
                <span key={s} className="rounded bg-slate-100 px-2 py-1 text-[0.625rem] font-medium text-slate-600">
                  {s}
                </span>
              ))}
            </div>
            {f.hourlyRate != null ? (
              <p className="mt-auto pt-5 text-left text-lg font-bold text-navy-800">
                ${Number(f.hourlyRate)}
                <span className="text-xs font-medium text-slate-400"> /hr</span>
              </p>
            ) : (
              <span className="mt-auto pt-5" />
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
