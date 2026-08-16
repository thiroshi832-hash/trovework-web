import type { Metadata } from "next";
import Link from "next/link";
import { Portrait, Stars } from "@/components/brand";
import {
  CARD,
  DashboardHeader,
  Section,
  Stat,
  ThreadList,
  VerificationCard,
} from "@/components/dashboard-parts";
import { Lock, Search } from "@/components/icons";
import { CLIENT_THREADS } from "@/lib/conversations";
import { FREELANCERS } from "@/lib/freelancers";
import { CURRENT_CLIENT } from "@/lib/session";

export const metadata: Metadata = {
  title: "Dashboard — Trovework",
  description: "Your saved freelancers, conversations and verification status.",
  robots: { index: false, follow: false },
};

/* Stand-in for the saved list until the API exists. */
const SAVED = FREELANCERS.filter((f) =>
  ["alex-morgan", "sofia-martinez", "olivia-brown"].includes(f.slug),
);

export default function ClientDashboard() {
  const me = CURRENT_CLIENT;
  const unread = CLIENT_THREADS.reduce((n, t) => n + t.unread, 0);

  return (
    <div className="flex flex-1 flex-col bg-slate-50/60">
      <main className="flex-1">
        <div className="mx-auto max-w-page px-6 lg:px-10 xl:px-16 py-8">
          <DashboardHeader name={me.name} photo={me.photo} role="Client">
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
              <Stat label="Saved freelancers" value={String(SAVED.length)} />
              <Stat label="Unread messages" value={String(unread)} hint={`${CLIENT_THREADS.length} conversations`} />
              <Stat
                label="Contact details"
                value={me.idVerified ? "Unlocked" : "Locked"}
                hint={me.idVerified ? "You can start chats" : "Verify to contact freelancers"}
              />
            </div>

            <Section title="Saved freelancers" action="Browse more" href="/freelancers">
              {SAVED.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center">
                  <Search className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-3 font-semibold text-navy-800">Nothing saved yet</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Save a freelancer from their profile to keep them here.
                  </p>
                </div>
              ) : (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {SAVED.map((f) => (
                    <li key={f.slug} className={`${CARD} p-5 text-center`}>
                      <Portrait src={f.photo} sizes="80px" className="mx-auto h-20 w-20" />
                      <p className="mt-3 font-semibold text-navy-800">{f.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{f.title}</p>
                      <div className="mt-2 flex items-center justify-center gap-1.5">
                        <Stars rating={f.rating} />
                        <span className="text-xs text-slate-500">{f.rating.toFixed(1)}</span>
                      </div>
                      <p className="mt-2.5 text-sm font-bold text-navy-800">
                        ${f.rate}
                        <span className="text-xs font-medium text-slate-400"> /hr</span>
                      </p>
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
              {me.idVerified ? (
                <ThreadList threads={CLIENT_THREADS} />
              ) : (
                <>
                  {/* The gate is the server's, not the UI's — but say why it's shut. */}
                  <div className="flex gap-4 rounded-xl bg-slate-50 p-5">
                    <Lock className="h-7 w-7 shrink-0 text-slate-400" />
                    <div>
                      <p className="text-sm font-semibold text-navy-800">Chat is locked</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-500">
                        Verify your identity to message freelancers and see their contact details.
                        This is what keeps everyone on Trovework accountable.
                      </p>
                      <Link
                        href="/verify/id"
                        className="mt-4 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
                      >
                        Verify my identity
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </Section>
          </div>
        </div>
      </main>
    </div>
  );
}
