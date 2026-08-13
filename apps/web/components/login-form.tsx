"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  Divider,
  Field,
  PasswordInput,
  PendingNotice,
  SocialButtons,
  TextInput,
} from "@/components/auth-fields";
import { Lock, Mail, Phone, ShieldCheck } from "@/components/icons";

export function LoginForm() {
  const [submitted, setSubmitted] = useState(false);

  // Auth arrives in Phase 1; the form validates but cannot sign anyone in yet.
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Email address">
        <TextInput name="email" type="email" required autoComplete="email" placeholder="Enter your email" icon={<Mail className="h-4 w-4" />} />
      </Field>

      <div>
        <Field label="Password">
          <PasswordInput name="password" required autoComplete="current-password" placeholder="Enter your password" icon={<Lock className="h-4 w-4" />} />
        </Field>
        <div className="mt-2 text-right">
          <Link href="/forgot-password" className="text-sm font-medium text-brand-600 hover:underline">
            Forgot password?
          </Link>
        </div>
      </div>

      {submitted ? (
        <PendingNotice>
          Sign-in isn&apos;t live yet — accounts open once identity verification is in place.
        </PendingNotice>
      ) : null}

      <button
        type="submit"
        className="w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
      >
        Sign in
      </button>

      <Divider label="or continue with" />
      <SocialButtons stacked />

      <Divider label="or" />
      <button
        type="button"
        className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-brand-500 bg-white px-4 py-2.5 text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
      >
        <Phone className="h-4 w-4" />
        Sign in with phone
      </button>

      <div className="flex gap-3 rounded-lg bg-slate-50 p-3.5">
        <ShieldCheck className="h-5 w-5 shrink-0 text-brand-600" />
        <div>
          <p className="text-sm font-semibold text-navy-800">Secure sign in</p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
            We use industry-standard encryption to keep your account safe.
          </p>
        </div>
      </div>
    </form>
  );
}
