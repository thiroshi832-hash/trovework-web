import type { Metadata } from "next";
import Image from "next/image";
import { BLOG_POSTS } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — Trovework",
  description: "Guides on hiring, verification and working well with freelancers.",
};

export default function BlogPage() {
  return (
    <div className="flex flex-1 flex-col bg-slate-50/60">
      <main className="flex-1">
        <div className="mx-auto max-w-page px-6 lg:px-10 xl:px-16 py-12">
          <h1 className="text-3xl font-bold tracking-tight text-navy-800 sm:text-4xl">Blog</h1>
          <p className="mt-3 text-base text-slate-500">
            Guides on hiring, verification and working well with freelancers.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {BLOG_POSTS.map((p) => (
              <article
                key={p.slug}
                className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgba(11,28,56,0.04),0_10px_28px_-16px_rgba(11,28,56,0.18)] ring-1 ring-slate-200/70"
              >
                <div className="relative aspect-[203/102]">
                  <Image src={p.image} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                  <span className="absolute bottom-3 left-3 rounded bg-brand-600 px-2 py-1 text-[0.625rem] font-bold tracking-wide text-white">
                    {p.tag}
                  </span>
                </div>
                <div className="flex flex-1 flex-col px-6 py-7">
                  <h2 className="text-lg font-semibold leading-snug text-navy-800 group-hover:text-brand-600">
                    {p.title}
                  </h2>
                  <div className="mt-auto pt-3">
                    <p className="line-clamp-2 min-h-[3.25em] text-sm leading-relaxed text-slate-500">
                      {p.excerpt}
                    </p>
                    <p className="mt-8 text-xs text-slate-400">
                      {p.date} &nbsp;•&nbsp; {p.read}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
