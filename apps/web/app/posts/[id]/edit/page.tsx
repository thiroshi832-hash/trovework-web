import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostEditor } from "@/components/post-editor";
import { POSTS, postById } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Edit post — Trovework",
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return POSTS.map((p) => ({ id: p.id }));
}

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = postById(id);
  if (!post) notFound();

  return (
    <div className="flex flex-1 flex-col bg-slate-50/60">
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <h1 className="text-2xl font-bold tracking-tight text-navy-800 sm:text-3xl">Edit post</h1>
          <p className="mt-2 text-base text-slate-500">
            Changes are re-checked for contact details before they go live.
          </p>
          <div className="mt-8">
            <PostEditor post={post} />
          </div>
        </div>
      </main>
    </div>
  );
}
