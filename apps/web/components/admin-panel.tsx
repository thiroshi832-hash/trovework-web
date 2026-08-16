"use client";

import { useState } from "react";
import { Portrait } from "@/components/brand";
import { PendingNotice } from "@/components/auth-fields";
import { Check, Lock, ShieldCheck } from "@/components/icons";
import { BANNED, REVIEW_QUEUE, VIOLATIONS } from "@/lib/moderation";
import { POSTS } from "@/lib/posts";

const TABS = ["Violations", "ID review", "Blocked posts", "Banned users"] as const;
type Tab = (typeof TABS)[number];

const CARD = "rounded-2xl border border-slate-200 bg-white";

export function AdminPanel() {
  const [tab, setTab] = useState<Tab>("Violations");
  const [action, setAction] = useState<string | null>(null);

  const blockedPosts = POSTS.filter((p) => p.status === "blocked");
  const counts: Record<Tab, number> = {
    Violations: VIOLATIONS.length,
    "ID review": REVIEW_QUEUE.length,
    "Blocked posts": blockedPosts.length,
    "Banned users": BANNED.length,
  };

  const act = (what: string) => setAction(what);

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTab(t);
              setAction(null);
            }}
            aria-current={tab === t ? "page" : undefined}
            className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
              tab === t
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-slate-500 hover:text-navy-800"
            }`}
          >
            {t}
            <span
              className={`rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold ${
                tab === t ? "bg-brand-50 text-brand-700" : "bg-slate-100 text-slate-500"
              }`}
            >
              {counts[t]}
            </span>
          </button>
        ))}
      </div>

      {action ? (
        <div className="mt-6">
          <PendingNotice>
            Nothing changed — the moderation API does not exist yet. This would have {action}.
          </PendingNotice>
        </div>
      ) : null}

      {/* ----------------------------- violations ---------------------------- */}
      {tab === "Violations" ? (
        <ul className="mt-6 space-y-4">
          {VIOLATIONS.map((v) => (
            <li key={v.id} className={`${CARD} p-5`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 gap-4">
                  <Portrait src={v.photo} sizes="40px" className="h-10 w-10" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-navy-800">{v.user}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold ring-1 ${
                          v.strike >= 2
                            ? "bg-red-50 text-red-700 ring-red-200"
                            : "bg-amber-50 text-amber-700 ring-amber-200"
                        }`}
                      >
                        Strike {v.strike} of 3
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-slate-500">{v.postTitle}</p>
                    <p className="mt-2.5 text-sm text-slate-600">
                      <span className="text-slate-400">{v.kind}:</span>{" "}
                      <mark className="rounded bg-red-100 px-1 text-red-900">{v.detectedText}</mark>
                    </p>
                    <p className="mt-2 text-xs text-slate-400">{v.at}</p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => act(`dismissed the violation against ${v.user} and restored the post`)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-navy-800 transition hover:bg-slate-50"
                  >
                    Dismiss
                  </button>
                  <button
                    type="button"
                    onClick={() => act(`upheld the strike against ${v.user}`)}
                    className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
                  >
                    Uphold strike
                  </button>
                </div>
              </div>

              {/* The doc is explicit that false positives are expected here. */}
              {v.strike >= 2 ? (
                <p className="mt-4 rounded-lg bg-red-50 px-3.5 py-3 text-sm leading-relaxed text-red-800">
                  Upholding this is the account&apos;s third strike and will ban it. Check the text is
                  really contact intent, not a price or a portfolio link.
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {/* ----------------------------- ID review ----------------------------- */}
      {tab === "ID review" ? (
        <ul className="mt-6 space-y-4">
          {REVIEW_QUEUE.map((c) => (
            <li key={c.id} className={`${CARD} p-5`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 gap-4">
                  <Portrait src={c.photo} sizes="40px" className="h-10 w-10" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-navy-800">{c.user}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {c.document} · {c.country} · submitted {c.submitted}
                    </p>
                    <p className="mt-2.5 text-sm text-slate-600">{c.reason}</p>

                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-xs text-slate-400">Match score</span>
                      <span className="h-1.5 w-40 overflow-hidden rounded-full bg-slate-100">
                        <span
                          className={`block h-full rounded-full ${c.score >= 0.7 ? "bg-amber-400" : "bg-red-400"}`}
                          style={{ width: `${Math.round(c.score * 100)}%` }}
                        />
                      </span>
                      <span className="text-xs font-semibold text-navy-800">{c.score.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => act(`rejected ${c.user}'s verification and asked them to resubmit`)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-navy-800 transition hover:bg-slate-50"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => act(`approved ${c.user} and made their profile visible`)}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </button>
                </div>
              </div>

              <p className="mt-4 flex items-start gap-2 rounded-lg bg-slate-50 px-3.5 py-3 text-sm leading-relaxed text-slate-600">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                The ID image and selfie are held in secured storage outside the web root. Open them
                through the review tool, which logs the access, rather than downloading copies.
              </p>
            </li>
          ))}
        </ul>
      ) : null}

      {/* --------------------------- blocked posts --------------------------- */}
      {tab === "Blocked posts" ? (
        <ul className="mt-6 space-y-4">
          {blockedPosts.map((p) => (
            <li key={p.id} className={`${CARD} p-5`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-navy-800">{p.title}</p>
                  <p className="mt-1.5 line-clamp-2 max-w-2xl text-sm leading-relaxed text-slate-500">
                    {p.description}
                  </p>
                  {p.blockedText ? (
                    <p className="mt-2.5 text-sm text-slate-600">
                      <span className="text-slate-400">Detected:</span>{" "}
                      <mark className="rounded bg-red-100 px-1 text-red-900">{p.blockedText}</mark>
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => act(`kept "${p.title}" blocked`)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-navy-800 transition hover:bg-slate-50"
                  >
                    Keep blocked
                  </button>
                  <button
                    type="button"
                    onClick={() => act(`restored "${p.title}"`)}
                    className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
                  >
                    Restore
                  </button>
                </div>
              </div>
            </li>
          ))}
          {blockedPosts.length === 0 ? (
            <li className={`${CARD} p-10 text-center text-sm text-slate-500`}>Nothing blocked.</li>
          ) : null}
        </ul>
      ) : null}

      {/* --------------------------- banned users ---------------------------- */}
      {tab === "Banned users" ? (
        <ul className="mt-6 space-y-4">
          {BANNED.map((b) => (
            <li key={b.id} className={`${CARD} p-5`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  <Portrait src={b.photo} sizes="40px" className="h-10 w-10 grayscale" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-navy-800">{b.user}</p>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.625rem] font-medium text-slate-500">
                        {b.role}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {b.reason} · {b.bannedAt}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => act(`reinstated ${b.user} and reset their strike count`)}
                  className="shrink-0 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-navy-800 transition hover:bg-slate-50"
                >
                  Reinstate
                </button>
              </div>
            </li>
          ))}
          {BANNED.length === 0 ? (
            <li className={`${CARD} p-10 text-center text-sm text-slate-500`}>Nobody is banned.</li>
          ) : null}
        </ul>
      ) : null}

      <p className="mt-8 flex items-start gap-2 text-sm leading-relaxed text-slate-500">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        Every action here is enforced server-side. This screen only asks — it cannot itself change
        anyone&apos;s verification state, and it is not a substitute for the permission checks in the API.
      </p>
    </div>
  );
}
