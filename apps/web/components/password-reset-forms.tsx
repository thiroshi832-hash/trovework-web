"use client";

import Link from "next/link";
import { useState } from "react";
import { Field, PasswordInput, TextInput } from "@/components/auth-fields";
import { ArrowLeft, Check, Lock, Mail, ShieldCheck } from "@/components/icons";
import { ApiError, api } from "@/lib/api";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ---------------------------- request a reset ---------------------------- */

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-600">
          <Mail className="h-9 w-9" />
        </span>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-navy-800">Check your email</h1>
        {/* Deliberately does not confirm whether the address has an account —
            that would let anyone test which emails are registered. */}
        <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-slate-500">
          If <span className="font-medium text-navy-800">{email}</span> has a Trovework account,
          we&apos;ve sent a link to reset the password. It expires in an hour.
        </p>

        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-6 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          Use a different address
        </button>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await api.forgotPassword(email.trim());
      setDone(true);
    } catch (err) {
      // The endpoint never reveals whether the address exists; the only errors
      // here are transport or rate-limit ones, which are safe to surface.
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form noValidate onSubmit={submit}>
      <h1 className="text-2xl font-bold tracking-tight text-navy-800 sm:text-3xl">
        Forgot your password?
      </h1>
      <p className="mt-3 text-base leading-relaxed text-slate-500">
        Enter the email you signed up with and we&apos;ll send you a link to set a new one.
      </p>

      <div className="mt-7">
        <Field label="Email address" error={error ?? undefined}>
          <TextInput
            type="email"
            autoComplete="email"
            icon={<Mail className="h-5 w-5" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            invalid={!!error}
            placeholder="you@example.com"
          />
        </Field>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 w-full rounded-lg bg-brand-600 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Send reset link"}
      </button>

      <Link
        href="/login"
        className="mt-8 inline-flex items-center gap-2 text-base font-semibold text-navy-800 transition hover:text-brand-600"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to login
      </Link>
    </form>
  );
}

/* ----------------------------- set a new one ----------------------------- */

const RULES = [
  { label: "At least 8 characters", ok: (p: string) => p.length >= 8 },
  { label: "A number", ok: (p: string) => /\d/.test(p) },
  { label: "A letter", ok: (p: string) => /[a-zA-Z]/.test(p) },
];

export function ResetPasswordForm({ token }: { token: string | null }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string; form?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  // Set when the server rejects the token itself (invalid/expired/used).
  const [linkDead, setLinkDead] = useState(false);

  const met = RULES.map((r) => r.ok(password));
  const strong = met.every(Boolean);

  if (!token || linkDead) {
    return (
      <div className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-amber-100 text-amber-600">
          <Lock className="h-9 w-9" />
        </span>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-navy-800">
          This link isn&apos;t valid
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-slate-500">
          Reset links expire after an hour and can only be used once. Request a new one and it
          will arrive in a moment.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-block rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
          <Check className="h-9 w-9" />
        </span>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-navy-800">Password updated</h1>
        <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-slate-500">
          You can now log in with your new password.
        </p>

        <Link
          href="/login"
          className="mt-6 inline-block rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Go to login
        </Link>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: { password?: string; confirm?: string } = {};
    if (!strong) next.password = "Your password doesn't meet the requirements yet.";
    if (confirm !== password) next.confirm = "These passwords don't match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await api.resetPassword(token!, password);
      setDone(true);
    } catch (err) {
      // A 401 means the token is invalid/expired/used — send them back to request
      // a fresh link. Anything else is transient and stays on the form.
      if (err instanceof ApiError && err.status === 401) {
        setLinkDead(true);
      } else {
        setErrors({ form: err instanceof ApiError ? err.message : "Something went wrong. Please try again." });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form noValidate onSubmit={submit}>
      <h1 className="text-2xl font-bold tracking-tight text-navy-800 sm:text-3xl">
        Choose a new password
      </h1>
      <p className="mt-3 text-base leading-relaxed text-slate-500">
        Pick something you don&apos;t use anywhere else.
      </p>

      <div className="mt-7 space-y-5">
        <Field label="New password" error={errors.password}>
          <PasswordInput
            autoComplete="new-password"
            icon={<Lock className="h-5 w-5" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            invalid={!!errors.password}
          />
        </Field>

        <ul className="space-y-1.5">
          {RULES.map((r, i) => (
            <li key={r.label} className="flex items-center gap-2 text-sm">
              <span
                className={`grid h-4 w-4 shrink-0 place-items-center rounded-full ${
                  met[i] ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"
                }`}
              >
                <Check className="h-2.5 w-2.5" />
              </span>
              <span className={met[i] ? "text-slate-600" : "text-slate-400"}>{r.label}</span>
            </li>
          ))}
        </ul>

        <Field label="Confirm new password" error={errors.confirm}>
          <PasswordInput
            autoComplete="new-password"
            icon={<Lock className="h-5 w-5" />}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            invalid={!!errors.confirm}
          />
        </Field>
      </div>

      {errors.form && (
        <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{errors.form}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 w-full rounded-lg bg-brand-600 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Updating…" : "Update password"}
      </button>

      <p className="mt-5 flex items-start gap-2 text-sm leading-relaxed text-slate-500">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
        Changing your password signs you out everywhere else.
      </p>
    </form>
  );
}
