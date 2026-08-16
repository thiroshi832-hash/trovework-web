"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  Divider,
  Field,
  PasswordInput,
  PendingNotice,
  SocialButtons,
  TextInput,
} from "@/components/auth-fields";
import { Lock, Mail, ShieldCheck } from "@/components/icons";

type FieldName = "email" | "password";
type Errors = Partial<Record<FieldName, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(fd: FormData): Errors {
  const e: Errors = {};

  const email = String(fd.get("email") ?? "").trim();
  if (!email) e.email = "Enter your email address.";
  else if (!EMAIL_RE.test(email)) e.email = "Enter a valid email address.";

  const password = String(fd.get("password") ?? "");
  if (!password) e.password = "Enter your password.";

  return e;
}

export function LoginForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  // Auth arrives in Phase 1; the form validates but cannot sign anyone in yet.
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(new FormData(e.currentTarget));
    setErrors(found);
    setSubmitted(Object.keys(found).length === 0);
  }

  function handleChange(e: ChangeEvent<HTMLFormElement>) {
    const name = (e.target as unknown as HTMLInputElement).name as FieldName;
    setSubmitted(false);
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  }

  return (
    <form noValidate onSubmit={handleSubmit} onChange={handleChange} className="space-y-4">
      <Field label="Email address" error={errors.email}>
        <TextInput
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Enter your email"
          invalid={!!errors.email}
          icon={<Mail className="h-5 w-5" />}
        />
      </Field>

      <div>
        <Field label="Password" error={errors.password}>
          <PasswordInput
            name="password"
            required
            autoComplete="current-password"
            placeholder="Enter your password"
            invalid={!!errors.password}
            icon={<Lock className="h-5 w-5" />}
          />
        </Field>
        <div className="mt-2 text-right">
          <Link href="/forgot-password" className="text-base font-medium text-brand-600 hover:underline">
            Forgot password?
          </Link>
        </div>
      </div>

      {submitted ? (
        <PendingNotice>
          Login isn&apos;t live yet — accounts open once identity verification is in place.
        </PendingNotice>
      ) : null}

      <button
        type="submit"
        className="w-full rounded-lg bg-brand-600 px-4 py-3.5 text-base font-semibold text-white transition hover:bg-brand-700"
      >
        Login
      </button>

      <Divider label="or continue with" />
      <SocialButtons />

      <div className="flex gap-3 rounded-lg bg-slate-50 p-3.5">
        <ShieldCheck className="h-6 w-6 shrink-0 text-brand-600" />
        <div>
          <p className="text-base font-semibold text-navy-800">Secure login</p>
          <p className="mt-0.5 text-sm leading-relaxed text-slate-500">
            We use industry-standard encryption to keep your account safe.
          </p>
        </div>
      </div>
    </form>
  );
}
