import type { Metadata } from "next";
import { PostEditor } from "@/components/post-editor";

export const metadata: Metadata = {
  title: "New post — Trovework",
  robots: { index: false, follow: false },
};

export default function NewPostPage() {
  return (
    <div className="flex flex-1 flex-col bg-slate-50/60">
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <h1 className="text-2xl font-bold tracking-tight text-navy-800 sm:text-3xl">
            Create a post
          </h1>
          <p className="mt-2 text-base text-slate-500">
            Describe a service you offer. Clients find these through search.
          </p>
          <div className="mt-8">
            <PostEditor />
          </div>
        </div>
      </main>
    </div>
  );
}
