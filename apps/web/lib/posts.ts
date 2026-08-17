/**
 * Freelancer service listings — the `posts` table in the data model.
 *
 * Placeholder data until the posts API exists (BUILD_PLAN phase 2). Statuses
 * mirror the schema: a post is `blocked` when the contact-info scanner finds a
 * leak, and the user is shown the text that triggered it (FR-M-5).
 */

import type { Category } from "@/lib/categories";

export type PostStatus = "active" | "blocked" | "draft";

export type Post = {
  id: string;
  title: string;
  description: string;
  category: Category;
  /** Optional starting price in USD. */
  priceFrom: number | null;
  status: PostStatus;
  updated: string;
  views: number;
  /** Set only when status is "blocked" — the substring the scanner matched. */
  blockedText?: string;
};

export const POSTS: Post[] = [
  {
    id: "p-1",
    title: "I will build a production-ready Next.js web app",
    description:
      "A complete front end in Next.js and TypeScript, wired to your API, with responsive layouts, accessible components and a deploy pipeline. Typical turnaround is two to three weeks.",
    category: "Home & Cleaning",
    priceFrom: 600,
    status: "active",
    updated: "2026-08-09",
    views: 214,
  },
  {
    id: "p-2",
    title: "I will audit and speed up your React application",
    description:
      "A written report on what is slowing your app down, plus the fixes applied: bundle size, render waterfalls, image handling and caching. Message me on telegram @alexmorgan to discuss scope.",
    category: "Repairs & Trades",
    priceFrom: 350,
    status: "blocked",
    updated: "2026-08-11",
    views: 0,
    blockedText: "telegram @alexmorgan",
  },
  {
    id: "p-3",
    title: "I will design and build your SaaS dashboard",
    description:
      "Charts, tables and settings screens that stay fast with real data volumes. Includes a component library your team can carry forward.",
    category: "Web & Software",
    priceFrom: 900,
    status: "draft",
    updated: "2026-08-12",
    views: 0,
  },
];

export function postById(id: string): Post | undefined {
  return POSTS.find((p) => p.id === id);
}

export const POST_STATUS_LABEL: Record<PostStatus, string> = {
  active: "Active",
  blocked: "Blocked",
  draft: "Draft",
};

export const POST_STATUS_STYLE: Record<PostStatus, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  blocked: "bg-red-50 text-red-700 ring-red-200",
  draft: "bg-slate-100 text-slate-500 ring-slate-200",
};
