import type { Metadata } from "next";
import Link from "next/link";
import {
  DashboardHeader,
  Section,
  Stat,
  ThreadList,
  VerificationCard,
} from "@/components/dashboard-parts";
import { ArrowRight, Lock } from "@/components/icons";
import { FREELANCER_THREADS } from "@/lib/conversations";
import { POSTS, POST_STATUS_LABEL, POST_STATUS_STYLE } from "@/lib/posts";
import { CURRENT_FREELANCER, FREELANCER_VERIFICATION } from "@/lib/session";

export const metadata: Metadata = {
  title: "Dashboard — Trovework",
  description: "Manage your profile, posts, verification and conversations.",
  robots: { index: false, follow: false },
};

export default function FreelancerDashboard() {
  const me = CURRENT_FREELANCER;
  const { phoneVerified, idVerified, strikes } = FREELANCER_VERIFICATION;
  const unread = FREELANCER_THREADS.reduce((n, t) => n + t.unread, 0);
  const active = POSTS.filter((p) => p.status === "active").length;
  const blocked = POSTS.filter((p) => p.status === "blocked");

  return (
    <div className="flex flex-1 flex-col bg-slate-50/60">
      <main className="flex-1">
        <div className="mx-auto max-w-page px-6 py-8">
          <DashboardHeader name={me.name} photo={me.photo} role={me.title}>
            <Link
              href="/profile/edit"
              className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-navy-800 transition hover:bg-slate-50"
            >
              Edit profile
            </Link>
            <Link
              href={`/freelancers/${me.slug}`}
              className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              View public profile
            </Link>
          </DashboardHeader>

          <div className="mt-8 space-y-6">
            <VerificationCard
              phoneVerified={phoneVerified}
              idVerified={idVerified}
              blockedConsequence="Your profile stays out of search results until your identity is verified, so clients cannot find or contact you yet."
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <Stat label="Active posts" value={String(active)} hint={`${POSTS.length} in total`} />
              <Stat label="Unread messages" value={String(unread)} hint={`${FREELANCER_THREADS.length} conversations`} />
              <Stat
                label="Profile visibility"
                value={idVerified ? "Visible" : "Hidden"}
                hint={idVerified ? "Appearing in search" : "Verify to appear in search"}
              />
            </div>

            {/* A strike is worth surfacing: the third one bans the account. */}
            {strikes > 0 ? (
              <div className="flex gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <Lock className="h-6 w-6 shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    {strikes} of 3 strikes for sharing contact details
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-amber-800">
                    Posts must not contain phone numbers, emails, links or messaging handles. A third
                    strike bans the account. Clients reach you through Trovework chat.
                  </p>
                </div>
              </div>
            ) : null}

            <Section title="My posts" action="New post" href="/posts/new">
              <ul className="space-y-4">
                {POSTS.map((p) => (
                  <li key={p.id} className="rounded-xl border border-slate-200 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="font-semibold text-navy-800">{p.title}</h3>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold ring-1 ${POST_STATUS_STYLE[p.status]}`}
                          >
                            {POST_STATUS_LABEL[p.status]}
                          </span>
                        </div>
                        <p className="mt-1.5 line-clamp-2 max-w-2xl text-sm leading-relaxed text-slate-500">
                          {p.description}
                        </p>
                      </div>
                      <Link
                        href={`/posts/${p.id}/edit`}
                        className="shrink-0 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-navy-800 transition hover:bg-slate-50"
                      >
                        Edit
                      </Link>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-400">
                      <span>{p.category}</span>
                      {p.priceFrom ? <span>From ${p.priceFrom}</span> : null}
                      <span>{p.views} views</span>
                      <span>Updated {p.updated}</span>
                    </div>

                    {/* FR-M-5: show what tripped the scanner so honest mistakes are fixable. */}
                    {p.status === "blocked" && p.blockedText ? (
                      <p className="mt-3 rounded-lg bg-red-50 px-3.5 py-3 text-sm leading-relaxed text-red-800">
                        Blocked because it contains contact details:{" "}
                        <span className="font-semibold">“{p.blockedText}”</span>. Remove it and save
                        again to publish.
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Messages" action="Open inbox" href="/inbox">
              <ThreadList threads={FREELANCER_THREADS} />
            </Section>

            <Section title="Profile" action="Edit profile" href="/profile/edit">
              <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {[
                  ["Headline", me.title],
                  ["Category", me.category],
                  ["Hourly rate", `$${me.rate} /hr`],
                  ["Availability", me.availability],
                  ["Country", me.country],
                  ["Skills", `${me.allSkills.length} listed`],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-slate-400">{k}</dt>
                    <dd className="mt-0.5 text-sm text-navy-800">{v}</dd>
                  </div>
                ))}
              </dl>

              {blocked.length > 0 ? (
                <p className="mt-5 flex items-center gap-2 text-sm text-slate-500">
                  <ArrowRight className="h-4 w-4 text-brand-600" />
                  {blocked.length} post needs attention before it can go live.
                </p>
              ) : null}
            </Section>
          </div>
        </div>
      </main>
    </div>
  );
}
