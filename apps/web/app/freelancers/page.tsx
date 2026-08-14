import type { Metadata } from "next";
import { BrowseFreelancers } from "@/components/browse-freelancers";

export const metadata: Metadata = {
  title: "Browse Freelancers — Trovework",
  description:
    "Search verified freelancers by skill, category, price and rating. Every profile on Trovework is ID-verified.",
};

export default function SearchPage() {
  return (
    <div className="flex flex-1 flex-col bg-slate-50/60">
      <main className="flex-1">
        <BrowseFreelancers />
      </main>
    </div>
  );
}
