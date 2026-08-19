"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Portrait, Stars } from "@/components/brand";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Clock,
  Lock,
  ChatBubble,
  Star,
} from "@/components/icons";
import { ApiError, api } from "@/lib/api";

/* ------------------------------- data shapes ------------------------------ */

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  from?: { id: string; fullName: string };
}

interface ServicePost {
  id: string;
  title: string;
  description: string;
  category: string;
  priceFrom: number | null;
}

interface PublicProfileData {
  userId: string;
  displayName: string;
  headline: string | null;
  bio: string | null;
  category: string;
  skills: string[];
  hourlyRate: number | null;
  availability: string | null;
  photoPath: string | null;
  createdAt: string;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  posts: ServicePost[];
  // Present only when the API decides the viewer is a verified client.
  contactTelegram?: string | null;
  contactDiscord?: string | null;
  contactWhatsapp?: string | null;
  contactLinkedin?: string | null;
}

function initialsOf(name: string): string {
  return name.split(/\s+/).map((p) => p[0] ?? "").join("").slice(0, 2).toUpperCase() || "?";
}

function InitialsAvatar({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 font-semibold text-white ${className}`}
    >
      {initialsOf(name)}
    </span>
  );
}

function monthYear(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(+d) ? "" : d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/* --------------------------------- view ---------------------------------- */

export function PublicProfile({ slug }: { slug: string }) {
  const router = useRouter();
  const [data, setData] = useState<PublicProfileData | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "notfound" | "error">("loading");
  const [chatBusy, setChatBusy] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    api.freelancers
      .getBySlug(slug)
      .then((res) => {
        if (!live) return;
        setData(res as PublicProfileData);
        setState("ready");
      })
      .catch((err) => {
        if (!live) return;
        if (err instanceof ApiError && (err.status === 401 || err.status === 0)) {
          router.replace(`/login?next=/freelancers/${slug}`);
          return;
        }
        setState(err instanceof ApiError && err.status === 404 ? "notfound" : "error");
      });
    return () => {
      live = false;
    };
  }, [slug, router]);

  async function requestChat() {
    if (!data) return;
    setChatBusy(true);
    setChatError(null);
    try {
      const convo = await api.chat.start(data.userId);
      router.push(`/inbox?c=${convo.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push(`/login?next=/freelancers/${slug}`);
      } else if (err instanceof ApiError && err.status === 403) {
        setChatError("Verify your identity to start a conversation.");
      } else {
        setChatError(err instanceof ApiError ? err.message : "Couldn't start the chat. Try again.");
      }
    } finally {
      setChatBusy(false);
    }
  }

  if (state === "loading") {
    return (
      <div className="mx-auto max-w-page px-6 lg:px-10 xl:px-16 py-8">
        <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />
      </div>
    );
  }

  if (state === "notfound") {
    return (
      <div className="mx-auto max-w-page px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-navy-800">Freelancer not found</h1>
        <p className="mt-3 text-slate-500">
          This profile may have been removed, or the person isn&apos;t verified yet.
        </p>
        <Link
          href="/freelancers"
          className="mt-6 inline-block rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Browse freelancers
        </Link>
      </div>
    );
  }

  if (state === "error" || !data) {
    return (
      <div className="mx-auto max-w-page px-6 py-24 text-center">
        <h1 className="text-xl font-bold text-navy-800">We couldn&apos;t load this profile</h1>
        <p className="mt-3 text-slate-500">Please refresh to try again.</p>
      </div>
    );
  }

  const contacts = [
    { label: "Telegram", value: data.contactTelegram },
    { label: "Discord", value: data.contactDiscord },
    { label: "WhatsApp", value: data.contactWhatsapp },
    { label: "LinkedIn", value: data.contactLinkedin },
  ].filter((c) => c.value);
  // The API only attaches contact handles for a verified client, so their mere
  // presence is the signal that this viewer is allowed to see them.
  const canSeeContacts =
    "contactTelegram" in data ||
    "contactDiscord" in data ||
    "contactWhatsapp" in data ||
    "contactLinkedin" in data;

  return (
    <div className="flex flex-1 flex-col bg-slate-50/60">
      <main className="flex-1">
        <div className="mx-auto max-w-page px-6 lg:px-10 xl:px-16 py-8">
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            {/* ------------------------------ hero ---------------------------- */}
            <div className="relative overflow-hidden bg-navy-900 px-8 py-8 sm:px-10 sm:py-10">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-600/20 blur-3xl"
              />
              <div className="relative">
                <Link
                  href="/freelancers"
                  className="inline-flex items-center gap-1.5 text-sm text-brand-100 transition hover:text-white"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Back to search
                </Link>

                <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    {data.photoPath ? (
                      <Portrait src={data.photoPath} sizes="112px" className="h-28 w-28 ring-4 ring-white/20" />
                    ) : (
                      <InitialsAvatar name={data.displayName} className="h-28 w-28 text-3xl ring-4 ring-white/20" />
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-white sm:text-3xl">{data.displayName}</h1>
                        <span
                          title="Identity verified"
                          className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-600 text-white"
                        >
                          <span className="sr-only">Identity verified</span>
                          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" aria-hidden>
                            <path
                              d="m5 12.5 4.5 4.5L19 7"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </div>
                      {data.headline ? (
                        <p className="mt-1.5 text-base text-brand-100">{data.headline}</p>
                      ) : null}
                      <p className="mt-2.5 text-sm text-brand-100">{data.category}</p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col gap-3 lg:w-56">
                    <button
                      type="button"
                      onClick={requestChat}
                      disabled={chatBusy}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <ChatBubble className="h-5 w-5" />
                      {chatBusy ? "Starting…" : "Request to Chat"}
                    </button>
                    {chatError ? (
                      <p className="text-xs text-amber-200">
                        {chatError}{" "}
                        <Link href="/verify/id" className="underline">
                          Verify now
                        </Link>
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/10 pt-5 text-sm text-white">
                  {data.hourlyRate != null ? (
                    <span className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-brand-200" />${data.hourlyRate} /hr
                    </span>
                  ) : null}
                  <span className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-400" />
                    {data.rating.toFixed(1)} ({data.reviewCount}{" "}
                    {data.reviewCount === 1 ? "review" : "reviews"})
                  </span>
                  {data.availability ? (
                    <span className="flex items-center gap-2">
                      <CalendarCheck className="h-5 w-5 text-brand-200" />
                      {data.availability}
                    </span>
                  ) : null}
                  <span className="flex items-center gap-2">
                    <CalendarCheck className="h-5 w-5 text-brand-200" />
                    Member since {monthYear(data.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* ------------------------------ body ---------------------------- */}
            <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
              {/* left column */}
              <div>
                {data.bio ? (
                  <>
                    <h2 className="text-base font-bold text-navy-800">About</h2>
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-500">{data.bio}</p>
                  </>
                ) : null}

                {data.skills.length > 0 ? (
                  <>
                    <h2 className="mt-8 text-base font-bold text-navy-800">Skills</h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {data.skills.map((s) => (
                        <span key={s} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                          {s}
                        </span>
                      ))}
                    </div>
                  </>
                ) : null}

                <h2 className="mt-8 text-base font-bold text-navy-800">Category</h2>
                <p className="mt-3 text-sm text-slate-500">{data.category}</p>

                {data.hourlyRate != null ? (
                  <>
                    <h2 className="mt-8 text-base font-bold text-navy-800">Hourly Rate</h2>
                    <p className="mt-3 text-sm text-slate-500">${data.hourlyRate} /hr</p>
                  </>
                ) : null}
              </div>

              {/* right column */}
              <div className="space-y-6">
                <section className="rounded-xl border border-slate-200 bg-white p-6">
                  <h2 className="text-base font-bold text-navy-800">Services</h2>
                  {data.posts.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-500">No published services yet.</p>
                  ) : (
                    <ul className="mt-4 space-y-4">
                      {data.posts.map((p) => (
                        <li key={p.id} className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="font-semibold text-navy-800">{p.title}</h3>
                            {p.priceFrom != null ? (
                              <span className="shrink-0 text-sm font-semibold text-brand-600">
                                from ${p.priceFrom}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-slate-500">
                            {p.description}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-6">
                  <h2 className="text-base font-bold text-navy-800">
                    Reviews ({data.reviewCount})
                  </h2>

                  {data.reviews.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-500">No reviews yet.</p>
                  ) : (
                    <>
                      <div className="mt-4 flex items-end gap-3">
                        <span className="text-4xl font-bold leading-none text-navy-800">
                          {data.rating.toFixed(1)}
                        </span>
                        <Stars rating={data.rating} className="pb-1" />
                      </div>

                      <ul className="mt-5 space-y-5">
                        {data.reviews.slice(0, 5).map((r) => (
                          <li key={r.id} className="border-t border-slate-100 pt-4 first:border-0 first:pt-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <InitialsAvatar
                                  name={r.from?.fullName ?? "?"}
                                  className="h-10 w-10 text-sm"
                                />
                                <div>
                                  <p className="text-sm font-semibold text-navy-800">
                                    {r.from?.fullName ?? "Someone"}
                                  </p>
                                  <Stars rating={r.rating} className="mt-1.5" />
                                </div>
                              </div>
                              <span className="shrink-0 text-xs text-slate-400">{monthYear(r.createdAt)}</span>
                            </div>
                            {r.comment ? (
                              <blockquote className="mt-3 text-sm leading-relaxed text-slate-500">
                                {r.comment}
                              </blockquote>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </section>
              </div>
            </div>

            {/* Contact handles are released by the API only to verified clients. */}
            {canSeeContacts ? (
              <div className="border-t border-slate-200 bg-slate-50 px-6 py-5">
                <h2 className="text-sm font-bold text-navy-800">Contact</h2>
                {contacts.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-500">
                    This freelancer hasn&apos;t added contact details yet — start a chat instead.
                  </p>
                ) : (
                  <dl className="mt-3 grid gap-2 sm:grid-cols-3">
                    {contacts.map((c) => (
                      <div key={c.label} className="rounded-lg bg-white px-3.5 py-2.5 ring-1 ring-slate-200">
                        <dt className="text-xs text-slate-400">{c.label}</dt>
                        <dd className="text-sm font-medium text-navy-800">{c.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            ) : (
              <Link
                href="/verify/id"
                className="flex items-center justify-center gap-2.5 border-t border-slate-200 bg-slate-50 px-6 py-4 text-sm font-medium text-brand-600 transition hover:bg-slate-100"
              >
                <Lock className="h-5 w-5" />
                Contact information is available after ID verification.
                <ArrowRight className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
