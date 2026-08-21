import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS, getPostBySlug } from "@/lib/blog";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Article not found — Trovework" };
  return { title: `${post.title} — Trovework`, description: post.excerpt };
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="flex flex-1 flex-col bg-white">
      <article className="mx-auto w-full max-w-2xl px-6 py-12 lg:py-16">
        <Link href="/blog" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          ← All articles
        </Link>

        <p className="mt-6 text-xs font-bold uppercase tracking-wide text-brand-600">{post.tag}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy-800 sm:text-4xl">{post.title}</h1>
        <p className="mt-3 text-sm text-slate-400">
          {post.date} &nbsp;•&nbsp; {post.read}
        </p>

        <div className="relative mt-8 aspect-[203/102] overflow-hidden rounded-xl">
          <Image src={post.image} alt="" fill sizes="(min-width: 768px) 42rem, 100vw" className="object-cover" priority />
        </div>

        <p className="mt-8 text-lg leading-relaxed text-slate-600">{post.excerpt}</p>

        <div className="mt-8 space-y-10">
          {post.body.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-bold text-navy-800">{section.heading}</h2>
              {section.paragraphs.map((para, i) => (
                <p key={i} className="mt-3 leading-relaxed text-slate-600">
                  {para}
                </p>
              ))}
            </section>
          ))}
        </div>

        <div className="mt-14 rounded-2xl bg-brand-50 p-8 text-center">
          <h2 className="text-xl font-bold text-navy-800">Ready to get started?</h2>
          <p className="mt-2 text-slate-600">Create an account, verify once, and hire — or get hired — with confidence.</p>
          <Link
            href="/register"
            className="mt-5 inline-block rounded-lg bg-brand-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Join Trovework
          </Link>
        </div>
      </article>
    </div>
  );
}
