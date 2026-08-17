"use client";

import { useId, useState, type ReactNode } from "react";
import { Eye, EyeOff, GoogleMark } from "@/components/icons";

/* ------------------------------- primitives ------------------------------ */

export function Field({
  label,
  error,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-base font-medium text-navy-800">{label}</span>
      {children}
      {error ? <span className="mt-1.5 block text-sm text-red-600">{error}</span> : null}
    </label>
  );
}

const inputBase =
  "w-full rounded-lg border bg-white py-3 text-base text-navy-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

const inputValid = "border-slate-200 focus:border-brand-500 focus:ring-brand-100";
const inputInvalid = "border-red-400 focus:border-red-500 focus:ring-red-100";

export function TextInput({
  icon,
  invalid,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon?: ReactNode; invalid?: boolean }) {
  return (
    <span className="relative block">
      {icon ? (
        <span className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
          {icon}
        </span>
      ) : null}
      <input
        {...props}
        aria-invalid={invalid || undefined}
        className={`${inputBase} ${invalid ? inputInvalid : inputValid} ${icon ? "pl-10" : "pl-3.5"} pr-3.5 ${className}`}
      />
    </span>
  );
}

export function PasswordInput({
  icon,
  invalid,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon?: ReactNode; invalid?: boolean }) {
  const [shown, setShown] = useState(false);
  return (
    <span className="relative block">
      {icon ? (
        <span className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
          {icon}
        </span>
      ) : null}
      <input
        {...props}
        type={shown ? "text" : "password"}
        aria-invalid={invalid || undefined}
        className={`${inputBase} ${invalid ? inputInvalid : inputValid} ${icon ? "pl-10" : "pl-3.5"} pr-10`}
      />
      <button
        type="button"
        onClick={() => setShown((v) => !v)}
        aria-label={shown ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
      >
        {shown ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </span>
  );
}

export function SelectInput({
  icon,
  invalid,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { icon?: ReactNode; invalid?: boolean }) {
  return (
    <span className="relative block">
      {icon ? (
        <span className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
          {icon}
        </span>
      ) : null}
      <select
        {...props}
        aria-invalid={invalid || undefined}
        className={`${inputBase} ${invalid ? inputInvalid : inputValid} appearance-none ${icon ? "pl-10" : "pl-3.5"} pr-9`}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />
        </svg>
      </span>
    </span>
  );
}

/* ------------------------------ role selector ----------------------------- */

export type Role = "client" | "freelancer";

export function RoleSelect({
  value,
  onChange,
}: {
  value: Role;
  onChange: (r: Role) => void;
}) {
  const name = useId();
  const options: { role: Role; title: string; body: string; icon: ReactNode; tone: string }[] = [
    {
      role: "client",
      title: "I'm a Client",
      body: "Hire talent and get work done",
      tone: "bg-brand-600",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="8.4" r="3.4" />
          <path d="M5 19.4a7 7 0 0 1 14 0" />
        </svg>
      ),
    },
    {
      role: "freelancer",
      title: "I'm a Freelancer",
      body: "Find work and grow your career",
      tone: "bg-emerald-500",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="3.5" y="5.5" width="17" height="11" rx="1.8" />
          <path d="M2.5 19.5h19" />
        </svg>
      ),
    },
  ];

  return (
    <fieldset>
      <legend className="mb-2 text-base font-medium text-navy-800">I want to join as</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((o) => {
          const selected = value === o.role;
          return (
            <label
              key={o.role}
              className={`relative flex cursor-pointer gap-3 rounded-xl border p-3.5 transition ${
                selected
                  ? "border-brand-500 bg-brand-50/50 ring-1 ring-brand-200"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={o.role}
                checked={selected}
                onChange={() => onChange(o.role)}
                className="sr-only"
              />
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-white ${o.tone}`}>
                {o.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-base font-semibold text-navy-800">{o.title}</span>
                <span className="mt-0.5 block text-sm leading-snug text-slate-500">{o.body}</span>
              </span>
              {selected ? (
                <span className="absolute bottom-3 right-3 h-2.5 w-2.5 rounded-full bg-brand-600" />
              ) : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/* ------------------------------ social buttons ---------------------------- */

export function SocialButtons() {
  return (
    // A full-page navigation (not fetch): this kicks off the server-side OAuth
    // redirect, and Google sends the browser back to /api/auth/google/callback.
    <a
      href="/api/auth/google"
      className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-slate-200 bg-white px-4 py-3 text-base font-medium text-navy-800 transition hover:bg-slate-50"
    >
      <GoogleMark className="h-5.5 w-5.5" />
      Continue with Google
    </a>
  );
}

export function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-slate-200" />
      <span className="text-sm text-slate-400">{label}</span>
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

/* --------------------------- shared option lists -------------------------- */

export const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Ireland", "New Zealand",
  "Germany", "France", "Spain", "Italy", "Netherlands", "Portugal", "Poland", "Sweden",
  "Japan", "South Korea", "Singapore", "India", "Philippines", "Indonesia", "Vietnam",
  "United Arab Emirates", "Saudi Arabia", "Turkey", "Egypt", "Nigeria", "Kenya",
  "South Africa", "Brazil", "Mexico", "Argentina", "Colombia", "Chile",
];

export const DIAL_CODES = [
  { flag: "🇺🇸", code: "+1", label: "US" },
  { flag: "🇬🇧", code: "+44", label: "UK" },
  { flag: "🇨🇦", code: "+1", label: "CA" },
  { flag: "🇦🇺", code: "+61", label: "AU" },
  { flag: "🇩🇪", code: "+49", label: "DE" },
  { flag: "🇫🇷", code: "+33", label: "FR" },
  { flag: "🇪🇸", code: "+34", label: "ES" },
  { flag: "🇯🇵", code: "+81", label: "JP" },
  { flag: "🇮🇳", code: "+91", label: "IN" },
  { flag: "🇵🇭", code: "+63", label: "PH" },
  { flag: "🇦🇪", code: "+971", label: "AE" },
  { flag: "🇳🇬", code: "+234", label: "NG" },
  { flag: "🇧🇷", code: "+55", label: "BR" },
  { flag: "🇲🇽", code: "+52", label: "MX" },
];

/** Shown on submit until the accounts API exists (Phase 1). */
export function PendingNotice({ children }: { children: ReactNode }) {
  return (
    <p
      role="status"
      className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm leading-relaxed text-amber-800"
    >
      {children}
    </p>
  );
}
