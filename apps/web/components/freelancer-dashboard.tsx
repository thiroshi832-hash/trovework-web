"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardHeader, Section, Stat, VerificationCard } from "@/components/dashboard-parts";
import { ArrowRight, Lock } from "@/components/icons";
import { ApiError, api, type SessionUser } from "@/lib/api";

type Post = {
  id: string;
  title: string;
  description: string;
  status: "active" | "blocked" | "draft";
  category: string;
  priceFrom: string | number | null;
  blockedReason: string | null;
  updatedAt: string;
};

type Profile = {
  slug?: string;
  displayName?: string;
  headline?: string | null;
  category?: string;
  hourlyRate?: string | number | null;
  availability?: string | null;
  photoPath?: string | null;
  skills?: string[];
};

const STATUS_LABEL: Record<Post["status"], string> = { active: "Active", blocked: "Blocked", draft: "Draft" };
const STATUS_STYLE: Record<Post["status"], string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  blocked: "bg-red-50 text-red-700 ring-red-200",
  draft: "bg-slate-100 text-slate-600 ring-slate-200",
};

function relativeDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(+d) ? "" : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function FreelancerDashboard() {
  const [me, setMe] = useState<SessionUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [conversationCount, setConversationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const session = await api.me();
        if (!live) return;
        setMe(session);

        // Profile may not exist yet (404) — that's a normal first-run state.
        const [profileRes, postsRes, convosRes] = await Promise.allSettled([
          api.profile.getMine(),
          api.posts.listMine(),
          api.chat.list(),
        ]);
        if (!live) return;
        if (profileRes.status === "fulfilled") setProfile(profileRes.value as Profile);
        if (postsRes.status === "fulfilled") setPosts(postsRes.value as Post[]);
        if (convosRes.status === "fulfilled") setConversationCount((convosRes.value as unknown[]).length);
      } catch (err) {
        // No session (or it expired) — send them to log in.
        if (err instanceof ApiError && (err.status === 401 || err.status === 0)) router.replace("/login");
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-page px-6 lg:px-10 xl:px-16 py-8">
        <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
        <div className="mt-8 space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }
  if (!me) return null; // redirecting to /login

  const name = profile?.displayName ?? me.fullName;
  const active = posts.filter((p) => p.status === "active").length;
  const blocked = posts.filter((p) => p.status === "blocked").length;
  const strikes = me.strikeCount ?? 0;

  return (
    <div className="mx-auto max-w-page px-6 lg:px-10 xl:px-16 py-8">
      <DashboardHeader name={name} photo={profile?.photoPath} role={profile?.headline ?? "Freelancer"}>
        <Link
          href="/profile/edit"
          className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-navy-800 transition hover:bg-slate-50"
        >
          Edit profile
        </Link>
        {profile?.slug ? (
          <Link
            href={`/freelancers/${profile.slug}`}
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            View public profile
          </Link>
        ) : null}
      </DashboardHeader>

      <div className="mt-8 space-y-6">
        <VerificationCard
          phoneVerified={me.phoneVerified}
          idVerified={me.idVerified}
          blockedConsequence="Your profile stays out of search results until your identity is verified, so clients cannot find or contact you yet."
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Active posts" value={String(active)} hint={`${posts.length} in total`} />
          <Stat label="Conversations" value={String(conversationCount)} hint="Client messages" />
          <Stat
            label="Profile visibility"
            value={me.idVerified ? "Visible" : "Hidden"}
            hint={me.idVerified ? "Appearing in search" : "Verify to appear in search"}
          />
        </div>

        {strikes > 0 ? (
          <div className="flex gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <Lock className="h-7 w-7 shrink-0 text-amber-600" />
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
          {posts.length === 0 ? (
            <p className="text-sm text-slate-500">
              You haven&apos;t posted a service yet.{" "}
              <Link href="/posts/new" className="font-semibold text-brand-600 hover:underline">
                Create your first post
              </Link>
              .
            </p>
          ) : (
            <ul className="space-y-4">
              {posts.map((p) => (
                <li key={p.id} className="rounded-xl border border-slate-200 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="font-semibold text-navy-800">{p.title}</h3>
                        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold ring-1 ${STATUS_STYLE[p.status]}`}>
                          {STATUS_LABEL[p.status]}
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
                    {relativeDate(p.updatedAt) ? <span>Updated {relativeDate(p.updatedAt)}</span> : null}
                  </div>

                  {p.status === "blocked" && p.blockedReason ? (
                    <p className="mt-3 rounded-lg bg-red-50 px-3.5 py-3 text-sm leading-relaxed text-red-800">
                      Blocked because it contains contact details:{" "}
                      <span className="font-semibold">&ldquo;{p.blockedReason}&rdquo;</span>. Remove it
                      and save again to publish.
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Messages" action="Open inbox" href="/inbox">
          <p className="text-sm text-slate-500">
            {conversationCount === 0
              ? "No conversations yet."
              : `${conversationCount} conversation${conversationCount === 1 ? "" : "s"}. `}
            {conversationCount > 0 ? (
              <Link href="/inbox" className="font-semibold text-brand-600 hover:underline">
                Open inbox
              </Link>
            ) : null}
          </p>
        </Section>

        {profile ? (
          <Section title="Profile" action="Edit profile" href="/profile/edit">
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {[
                ["Headline", profile.headline ?? "—"],
                ["Category", profile.category ?? "—"],
                ["Hourly rate", profile.hourlyRate ? `$${profile.hourlyRate} /hr` : "—"],
                ["Availability", profile.availability ?? "—"],
                ["Country", me.country ?? "—"],
                ["Skills", `${profile.skills?.length ?? 0} listed`],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-slate-400">{k}</dt>
                  <dd className="mt-0.5 text-sm text-navy-800">{v}</dd>
                </div>
              ))}
            </dl>
            {blocked > 0 ? (
              <p className="mt-5 flex items-center gap-2 text-sm text-slate-500">
                <ArrowRight className="h-5 w-5 text-brand-600" />
                {blocked} post needs attention before it can go live.
              </p>
            ) : null}
          </Section>
        ) : (
          <Section title="Profile" action="Create profile" href="/profile/edit">
            <p className="text-sm text-slate-500">
              You haven&apos;t set up your profile yet.{" "}
              <Link href="/profile/edit" className="font-semibold text-brand-600 hover:underline">
                Build your profile
              </Link>{" "}
              so clients can find you.
            </p>
          </Section>
        )}
      </div>
    </div>
  );
}
