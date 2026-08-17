"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Stars } from "@/components/brand";
import { CARD, DashboardHeader, Section, Stat, VerificationCard } from "@/components/dashboard-parts";
import { Lock, Search } from "@/components/icons";
import { ApiError, api, homeFor, type SessionUser } from "@/lib/api";

interface ApiConversation {
  id: string;
  clientId: string;
  freelancerId: string;
  client?: { id: string; fullName: string };
  freelancer?: { id: string; fullName: string };
  unreadCount: number;
}

interface Recommended {
  slug: string;
  name: string;
  title: string;
  rating: number;
  rate: number;
  photo: string | null;
}

function initialsOf(name: string): string {
  return name.split(/\s+/).map((p) => p[0] ?? "").join("").slice(0, 2).toUpperCase() || "?";
}
function Avatar({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 font-semibold text-white ${className}`}
    >
      {initialsOf(name)}
    </span>
  );
}

function adaptRecommended(r: Record<string, unknown>): Recommended {
  return {
    slug: String(r.slug ?? ""),
    name: String(r.displayName ?? ""),
    title: (r.headline as string | null) ?? String(r.category ?? ""),
    rating: Number(r.rating ?? 0),
    rate: Number(r.hourlyRate ?? 0),
    photo: (r.photoPath as string | null) ?? null,
  };
}

export function ClientDashboard() {
  const router = useRouter();
  const [me, setMe] = useState<SessionUser | null>(null);
  const [convos, setConvos] = useState<ApiConversation[]>([]);
  const [recommended, setRecommended] = useState<Recommended[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const session = await api.me();
        if (!live) return;
        // Freelancers/admins that land here go to their own home.
        if (session.role !== "client") {
          router.replace(homeFor(session.role));
          return;
        }
        setMe(session);

        const [convosRes, recRes] = await Promise.allSettled([
          api.chat.list(),
          api.freelancers.search({ take: 3 }),
        ]);
        if (!live) return;
        if (convosRes.status === "fulfilled") setConvos(convosRes.value as ApiConversation[]);
        if (recRes.status === "fulfilled") {
          setRecommended((recRes.value as Record<string, unknown>[]).map(adaptRecommended));
        }
      } catch (err) {
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

  const unread = convos.reduce((n, c) => n + (c.unreadCount ?? 0), 0);

  return (
    <div className="mx-auto max-w-page px-6 lg:px-10 xl:px-16 py-8">
      <DashboardHeader name={me.fullName} role="Client">
        <Link
          href="/freelancers"
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Browse freelancers
        </Link>
      </DashboardHeader>

      <div className="mt-8 space-y-6">
        <VerificationCard
          phoneVerified={me.phoneVerified}
          idVerified={me.idVerified}
          blockedConsequence="You can browse freely, but seeing a freelancer's contact details or starting a chat needs identity verification."
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Conversations" value={String(convos.length)} hint={`${unread} unread`} />
          <Stat label="Unread messages" value={String(unread)} />
          <Stat
            label="Contact details"
            value={me.idVerified ? "Unlocked" : "Locked"}
            hint={me.idVerified ? "You can start chats" : "Verify to contact freelancers"}
          />
        </div>

        <Section title="Recommended freelancers" action="Browse all" href="/freelancers">
          {recommended.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center">
              <Search className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 font-semibold text-navy-800">No freelancers to show yet</p>
              <p className="mt-1 text-sm text-slate-500">Check back as more people get verified.</p>
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommended.map((f) => (
                <li key={f.slug} className={`${CARD} p-5 text-center`}>
                  <Avatar name={f.name} className="mx-auto h-20 w-20 text-2xl" />
                  <p className="mt-3 font-semibold text-navy-800">{f.name}</p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{f.title}</p>
                  <div className="mt-2 flex items-center justify-center gap-1.5">
                    <Stars rating={f.rating} />
                    <span className="text-xs text-slate-500">{f.rating.toFixed(1)}</span>
                  </div>
                  {f.rate > 0 ? (
                    <p className="mt-2.5 text-sm font-bold text-navy-800">
                      ${f.rate}
                      <span className="text-xs font-medium text-slate-400"> /hr</span>
                    </p>
                  ) : null}
                  <Link
                    href={`/freelancers/${f.slug}`}
                    className="mt-4 block rounded-lg border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
                  >
                    View profile
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Messages" action="Open inbox" href="/inbox">
          {!me.idVerified ? (
            <div className="flex gap-4 rounded-xl bg-slate-50 p-5">
              <Lock className="h-7 w-7 shrink-0 text-slate-400" />
              <div>
                <p className="text-sm font-semibold text-navy-800">Chat is locked</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  Verify your identity to message freelancers and see their contact details. This is
                  what keeps everyone on Trovework accountable.
                </p>
                <Link
                  href="/verify/id"
                  className="mt-4 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                  Verify my identity
                </Link>
              </div>
            </div>
          ) : convos.length === 0 ? (
            <p className="text-sm text-slate-500">
              No conversations yet. Find a freelancer and start a chat from their profile.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {convos.map((c) => {
                const other = c.freelancer ?? { fullName: "Freelancer" };
                return (
                  <li key={c.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                    <Avatar name={other.fullName} className="h-10 w-10 text-sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-navy-800">{other.fullName}</p>
                      <p className="mt-0.5 text-xs text-slate-500">Freelancer</p>
                    </div>
                    <div className="shrink-0 text-right">
                      {c.unreadCount > 0 ? (
                        <span className="inline-grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1.5 text-[0.6875rem] font-semibold text-white">
                          {c.unreadCount}
                        </span>
                      ) : null}
                      <Link
                        href={`/inbox?c=${c.id}`}
                        className="ml-3 text-sm font-semibold text-brand-600 hover:underline"
                      >
                        Open
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}
