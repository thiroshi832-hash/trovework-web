import Link from "next/link";
import type { ReactNode } from "react";
import { Portrait } from "@/components/brand";
import { ArrowRight, Check, ShieldCheck } from "@/components/icons";

/* Shared chrome for both dashboards, so they read as one product. */

export const CARD = "rounded-2xl border border-slate-200 bg-white";

export function DashboardHeader({
  name,
  photo,
  role,
  children,
}: {
  name: string;
  photo?: string | null;
  role: string;
  children?: ReactNode;
}) {
  const initials = name.split(/\s+/).map((p) => p[0] ?? "").join("").slice(0, 2).toUpperCase() || "?";
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        {photo ? (
          <Portrait src={photo} sizes="64px" className="h-16 w-16" />
        ) : (
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-lg font-semibold text-white">
            {initials}
          </span>
        )}
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
            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
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
  phoneRequired = true,
}: {
  phoneVerified: boolean;
  idVerified: boolean;
  blockedConsequence: string;
  /** When false (no SMS provider linked), the phone step is hidden and not gating. */
  phoneRequired?: boolean;
}) {
  const steps = [
    ...(phoneRequired ? [{ label: "Phone number", ok: phoneVerified, href: "/verify/phone" }] : []),
    { label: "Identity document", ok: idVerified, href: "/verify/id" },
  ];
  const done = steps.every((s) => s.ok);
  const nextHref = steps.find((s) => !s.ok)?.href ?? "/verify/id";
  const phoneStepPending = phoneRequired && !phoneVerified;

  return (
    <section
      className={`rounded-2xl border p-6 sm:p-7 ${
        done ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
      }`}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <ShieldCheck className={`h-9 w-9 shrink-0 ${done ? "text-emerald-600" : "text-amber-600"}`} />
          <div>
            <h2 className={`text-lg font-bold ${done ? "text-emerald-900" : "text-amber-900"}`}>
              {done ? "You're verified" : "Verification incomplete"}
            </h2>
            <p className={`mt-1.5 max-w-xl text-sm leading-relaxed ${done ? "text-emerald-800" : "text-amber-800"}`}>
              {done ? "Everything is unlocked on your account." : blockedConsequence}
            </p>

            <ul className="mt-4 space-y-2">
              {steps.map((s) => (
                <li key={s.label} className="flex items-center gap-2.5 text-sm">
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                      s.ok ? "bg-emerald-500 text-white" : "bg-white text-amber-500 ring-1 ring-amber-300"
                    }`}
                  >
                    {s.ok ? <Check className="h-4 w-4" /> : <span className="text-[0.6875rem] font-bold">!</span>}
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
            href={nextHref}
            className="shrink-0 rounded-lg bg-amber-600 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            {phoneStepPending ? "Verify my phone" : "Verify my identity"}
          </Link>
        ) : null}
      </div>
    </section>
  );
}

