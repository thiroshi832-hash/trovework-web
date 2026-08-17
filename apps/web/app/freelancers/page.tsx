import type { Metadata } from "next";
import { BrowseFreelancers } from "@/components/browse-freelancers";

export const metadata: Metadata = {
  title: "Browse Freelancers — Trovework",
  description:
    "Search verified freelancers by skill, category, price and rating. Every profile on Trovework is ID-verified.",
};

/**
 * The category filter takes several values, so accept both shapes a link can
 * produce: repeated `?category=a&category=b` params, and a single comma-joined
 * one. The landing page's tiles still send exactly one.
 */
function readCategories(raw: string | string[] | undefined): string[] {
  if (!raw) return [];
  const parts = (Array.isArray(raw) ? raw : [raw]).flatMap((v) => v.split(","));
  return [...new Set(parts.map((p) => p.trim()).filter(Boolean))];
}

export default async function FreelancersPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const { category } = await searchParams;

  return (
    <div className="flex flex-1 flex-col bg-slate-50/60">
      <main className="flex-1">
        <BrowseFreelancers initialCategories={readCategories(category)} />
      </main>
    </div>
  );
}
