"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PostEditor, type EditablePost } from "@/components/post-editor";
import { ApiError, api } from "@/lib/api";
import type { Post } from "@/lib/posts";

interface ApiPost {
  id: string;
  title: string;
  description: string;
  category: string;
  priceFrom: number | string | null;
  status: "active" | "blocked" | "draft";
  blockedReason: string | null;
}

/** Fetches the freelancer's own post and hands it to the shared editor. */
export function EditPostLoader({ id }: { id: string }) {
  const [post, setPost] = useState<EditablePost | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "notfound" | "error">("loading");

  useEffect(() => {
    let live = true;
    api.posts
      .get(id)
      .then((row) => {
        if (!live) return;
        const p = row as ApiPost;
        setPost({
          id: p.id,
          title: p.title,
          description: p.description,
          category: p.category as Post["category"],
          priceFrom: p.priceFrom != null ? Number(p.priceFrom) : null,
          status: p.status,
          blockedText: p.blockedReason ?? undefined,
        });
        setState("ready");
      })
      .catch((err) => {
        if (!live) return;
        // 404 covers both "no such post" and "not yours" — same as the API.
        setState(err instanceof ApiError && err.status === 404 ? "notfound" : "error");
      });
    return () => {
      live = false;
    };
  }, [id]);

  if (state === "loading") {
    return <div className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />;
  }

  if (state === "notfound") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <p className="font-semibold text-navy-800">Post not found</p>
        <p className="mt-1 text-sm text-slate-500">
          It may have been deleted, or it isn&apos;t one of yours.
        </p>
        <Link
          href="/dashboard/freelancer"
          className="mt-6 inline-block rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (state === "error" || !post) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        We couldn&apos;t load this post. Refresh to try again.
      </div>
    );
  }

  return <PostEditor post={post} />;
}
