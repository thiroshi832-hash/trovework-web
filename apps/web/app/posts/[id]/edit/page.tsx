import type { Metadata } from "next";
import { EditPostLoader } from "@/components/edit-post-loader";

export const metadata: Metadata = {
  title: "Edit post — Trovework",
  robots: { index: false, follow: false },
};

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex flex-1 flex-col bg-slate-50/60">
      <main className="flex-1">
        <div className="mx-auto max-w-page px-6 lg:px-10 xl:px-16 py-8">
          <h1 className="text-2xl font-bold tracking-tight text-navy-800 sm:text-3xl">Edit post</h1>
          <p className="mt-2 text-base text-slate-500">
            Changes are re-checked for contact details before they go live.
          </p>
          <div className="mt-8">
            {/* Fetched client-side (owner-gated), then handed to the shared editor. */}
            <EditPostLoader id={id} />
          </div>
        </div>
      </main>
    </div>
  );
}
