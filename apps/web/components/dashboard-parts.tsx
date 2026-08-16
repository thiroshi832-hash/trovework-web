import Link from "next/link";
import type { ReactNode } from "react";
import { Portrait } from "@/components/brand";
import { ArrowRight, Check, ShieldCheck } from "@/components/icons";
import type { Conversation } from "@/lib/conversations";

/* Shared chrome for both dashboards, so they read as one product. */

export const CARD = "rounded-2xl border border-slate-200 bg-white";

export function DashboardHeader({
  name,
  photo,
  role,
  children,
}: {
  name: string;
  photo: string;
  role: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <Portrait src={photo} sizes="64px" className="h-16 w-16" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-800">
            Welcome back, {name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{role}</p>
        </div>
      </div>
      {children ? <div className="flex flex-wrap gap-3">{children}</div> : null}
    </div>
  );
}

export function Section({
  title,
  action,
  href,
  children,
}: {
  title: string;
  action?: string;
  href?: string;
  children: ReactNode;
}) {
  return (
    <section className={`${CARD} p-6 sm:p-7`}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-navy-800">{title}</h2>
        {action && href ? (
          <Link
            href={href}
            className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            {action}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        ) : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className={`${CARD} p-5`}>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1.5 text-2xl font-bold text-navy-800">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}

/**
 * The verification gate, stated plainly. Both roles are blocked by it, but on
 * different things: a freelancer is invisible until verified, a client cannot
 * see contact details or open a chat.
 */
export function VerificationCard({
  phoneVerified,
  idVerified,
  blockedConsequence,
}: {
  phoneVerified: boolean;
  idVerified: boolean;
  blockedConsequence: string;
}) {
  const done = phoneVerified && idVerified;

  return (
    <section
      className={`rounded-2xl border p-6 sm:p-7 ${
        done ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
      }`}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <ShieldCheck className={`h-7 w-7 shrink-0 ${done ? "text-emerald-600" : "text-amber-600"}`} />
          <div>
            <h2 className={`text-lg font-bold ${done ? "text-emerald-900" : "text-amber-900"}`}>
              {done ? "You're verified" : "Verification incomplete"}
            </h2>
            <p className={`mt-1.5 max-w-xl text-sm leading-relaxed ${done ? "text-emerald-800" : "text-amber-800"}`}>
              {done ? "Everything is unlocked on your account." : blockedConsequence}
            </p>

            <ul className="mt-4 space-y-2">
              {[
                { label: "Phone number", ok: phoneVerified, href: "/verify/phone" },
                { label: "Identity document", ok: idVerified, href: "/verify/id" },
              ].map((s) => (
                <li key={s.label} className="flex items-center gap-2.5 text-sm">
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                      s.ok ? "bg-emerald-500 text-white" : "bg-white text-amber-500 ring-1 ring-amber-300"
                    }`}
                  >
                    {s.ok ? <Check className="h-3 w-3" /> : <span className="text-[0.6875rem] font-bold">!</span>}
                  </span>
                  <span className={s.ok ? "text-emerald-800" : "text-amber-900"}>{s.label}</span>
                  <span className={s.ok ? "text-emerald-600" : "text-amber-700"}>
                    {s.ok ? "verified" : "not verified"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {!done ? (
          <Link
            href={phoneVerified ? "/verify/id" : "/verify/phone"}
            className="shrink-0 rounded-lg bg-amber-600 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            {phoneVerified ? "Verify my identity" : "Verify my phone"}
          </Link>
        ) : null}
      </div>
    </section>
  );
}

export function ThreadList({ threads }: { threads: Conversation[] }) {
  if (threads.length === 0) {
    return <p className="text-sm text-slate-500">No conversations yet.</p>;
  }
  return (
    <ul className="divide-y divide-slate-100">
      {threads.map((t) => (
        <li key={t.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
          <Portrait src={t.withPhoto} sizes="40px" className="h-10 w-10" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-navy-800">{t.withName}</p>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[0.625rem] font-medium text-slate-500">
                {t.withRole}
              </span>
            </div>
            <p className="mt-0.5 truncate text-sm text-slate-500">{t.lastMessage}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs text-slate-400">{t.when}</p>
            {t.unread > 0 ? (
              <span className="mt-1 inline-grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1.5 text-[0.6875rem] font-semibold text-white">
                {t.unread}
              </span>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
