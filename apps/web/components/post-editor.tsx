"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Field, SelectInput, TextInput } from "@/components/auth-fields";
import { Lock, ShieldCheck } from "@/components/icons";
import { CATEGORIES } from "@/lib/categories";
import { LEAK_LABEL, scanForContact, segment } from "@/lib/contact-scan";
import type { Post } from "@/lib/posts";
import { ApiError, api, type PostWriteResult } from "@/lib/api";

const TITLE_MAX = 90;
const BODY_MAX = 1200;

/** Only the fields the editor reads — display-only ones (updated, views) aren't needed. */
export type EditablePost = Pick<
  Post,
  "id" | "title" | "description" | "category" | "priceFrom" | "status" | "blockedText"
>;

export function PostEditor({ post }: { post?: EditablePost }) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [description, setDescription] = useState(post?.description ?? "");
  const [category, setCategory] = useState<string>(post?.category ?? CATEGORIES[0]);
  const [priceFrom, setPriceFrom] = useState(post?.priceFrom ? String(post.priceFrom) : "");
  const [errors, setErrors] = useState<Partial<Record<"title" | "description", string>>>({});
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  // The server's verdict — authoritative, may block even if the client preview passed.
  const [blocked, setBlocked] = useState<PostWriteResult["blocked"] | null>(null);
  const router = useRouter();

  // Scan title and body together — the server scans the whole post.
  const leaks = useMemo(() => scanForContact(description), [description]);
  const titleLeaks = useMemo(() => scanForContact(title), [title]);
  const allLeaks = [...titleLeaks, ...leaks];
  const wouldBlock = allLeaks.length > 0;

  function validate() {
    const next: Partial<Record<"title" | "description", string>> = {};
    if (!title.trim()) next.title = "Give your post a title.";
    else if (title.length > TITLE_MAX) next.title = `Keep the title under ${TITLE_MAX} characters.`;
    if (!description.trim()) next.description = "Describe what you're offering.";
    else if (description.length > BODY_MAX) next.description = `Keep this under ${BODY_MAX} characters.`;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(as: "draft" | "published") {
    if (!validate()) return;
    if (as === "published" && wouldBlock) return;

    setBusy(true);
    setFormError(null);
    setBlocked(null);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      category,
      priceFrom: priceFrom.trim() ? Number(priceFrom) : undefined,
      status: as === "published" ? "active" : "draft",
    };
    try {
      const result = post?.id
        ? await api.posts.update(post.id, payload)
        : await api.posts.create(payload);

      if (result.blocked) {
        // The server caught contact info the client preview missed. Surface its
        // message (including the strike count) rather than silently succeeding.
        setBlocked(result.blocked);
        setBusy(false);
        return;
      }
      router.replace("/dashboard/freelancer");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Couldn't save your post. Try again.");
      setBusy(false);
    }
  }

  const section = "rounded-2xl border border-slate-200 bg-white p-6 sm:p-8";

  return (
    <form noValidate onSubmit={(e) => e.preventDefault()} className="space-y-6">
      {/* An already-blocked post explains itself the moment the editor opens. */}
      {post?.status === "blocked" && post.blockedText ? (
        <div className="flex gap-4 rounded-2xl border border-red-200 bg-red-50 p-5">
          <Lock className="h-7 w-7 shrink-0 text-red-600" />
          <div>
            <p className="text-sm font-semibold text-red-900">This post was blocked</p>
            <p className="mt-1 text-sm leading-relaxed text-red-800">
              It contained contact details — <span className="font-semibold">“{post.blockedText}”</span>.
              Remove them and save again. Clients reach you through Trovework chat, which is what
              keeps both sides accountable.
            </p>
          </div>
        </div>
      ) : null}

      <section className={section}>
        <h2 className="text-lg font-bold text-navy-800">What are you offering?</h2>
        <p className="mt-1 text-sm text-slate-500">
          This is what clients see in search results.
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <Field label="Title" error={errors.title}>
              <TextInput
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                invalid={!!errors.title}
                placeholder="I will build a production-ready Next.js web app"
              />
            </Field>
            <p className={`mt-1.5 text-right text-xs ${title.length > TITLE_MAX ? "text-red-600" : "text-slate-400"}`}>
              {title.length}/{TITLE_MAX}
            </p>
          </div>

          <div>
            <Field label="Description" error={errors.description}>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
                aria-invalid={!!errors.description || undefined}
                placeholder="What the client gets, how you work, and how long it usually takes."
                className={`w-full rounded-lg border bg-white px-3.5 py-3 text-base leading-relaxed text-navy-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                  errors.description
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-slate-200 focus:border-brand-500 focus:ring-brand-100"
                }`}
              />
            </Field>
            <p className={`mt-1.5 text-right text-xs ${description.length > BODY_MAX ? "text-red-600" : "text-slate-400"}`}>
              {description.length}/{BODY_MAX}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category">
              <SelectInput value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </SelectInput>
            </Field>

            <Field label="Starting price (USD, optional)">
              <span className="relative block">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-slate-400">
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={priceFrom}
                  onChange={(e) => setPriceFrom(e.target.value)}
                  placeholder="600"
                  className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-8 pr-3.5 text-base text-navy-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </span>
            </Field>
          </div>
        </div>
      </section>

      {/* ------------------------- contact-info check ------------------------ */}
      <section className={section}>
        <div className="flex items-start gap-4">
          <ShieldCheck className={`h-7 w-7 shrink-0 ${wouldBlock ? "text-red-600" : "text-emerald-600"}`} />
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-navy-800">Contact details check</h2>
            {wouldBlock ? (
              <>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  This post would be blocked. Posts can&apos;t contain phone numbers, emails, links,
                  @usernames or messaging apps — sharing them outside Trovework is what the
                  verification gate exists to prevent, and a third block bans the account.
                </p>

                <ul className="mt-4 flex flex-wrap gap-2">
                  {allLeaks.map((l, i) => (
                    <li
                      key={`${l.kind}-${l.start}-${i}`}
                      className="rounded-md bg-red-50 px-2.5 py-1 text-xs text-red-800 ring-1 ring-red-200"
                    >
                      {LEAK_LABEL[l.kind]}: <span className="font-semibold">{l.text.trim()}</span>
                    </li>
                  ))}
                </ul>

                {leaks.length > 0 ? (
                  <p className="mt-4 rounded-lg bg-slate-50 px-3.5 py-3 text-sm leading-relaxed text-slate-600">
                    {segment(description, leaks).map((seg, i) =>
                      seg.leak ? (
                        <mark key={i} className="rounded bg-red-200/70 px-0.5 text-red-900">
                          {seg.text}
                        </mark>
                      ) : (
                        <span key={i}>{seg.text}</span>
                      ),
                    )}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                No contact details found. This post can be published.
              </p>
            )}
          </div>
        </div>
      </section>

      {blocked ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-semibold text-red-900">
            {blocked.banned ? "Your account has been suspended" : `Post blocked — strike ${blocked.strikeCount} of 3`}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-red-800">{blocked.message}</p>
          {blocked.detectedText ? (
            <p className="mt-2 text-sm leading-relaxed text-red-800">
              We found: <span className="font-semibold">“{blocked.detectedText}”</span>. Remove it and try again.
            </p>
          ) : null}
        </div>
      ) : null}
      {formError ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Link
          href="/dashboard/freelancer"
          className="rounded-lg border border-slate-200 px-6 py-3 text-sm font-semibold text-navy-800 transition hover:bg-slate-50"
        >
          Cancel
        </Link>
        <button
          type="button"
          onClick={() => submit("draft")}
          disabled={busy}
          className="rounded-lg border border-slate-200 px-6 py-3 text-sm font-semibold text-navy-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Save draft
        </button>
        <button
          type="button"
          onClick={() => submit("published")}
          disabled={wouldBlock || busy}
          title={wouldBlock ? "Remove the contact details first" : undefined}
          className="rounded-lg bg-brand-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          {busy ? "Saving…" : post ? "Save and publish" : "Publish post"}
        </button>
      </div>
    </form>
  );
}
