"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  COUNTRIES,
  DIAL_CODES,
  Divider,
  Field,
  PasswordInput,
  PendingNotice,
  RoleSelect,
  SelectInput,
  SocialButtons,
  TextInput,
  type Role,
} from "@/components/auth-fields";
import { Globe, Lock, Mail, UserIcon } from "@/components/icons";

export function RegisterForm({ defaultRole = "client" }: { defaultRole?: Role }) {
  const [role, setRole] = useState<Role>(defaultRole);
  const [submitted, setSubmitted] = useState(false);

  // The accounts API arrives in Phase 1; until then the form validates but does
  // not create an account.
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <RoleSelect value={role} onChange={setRole} />

      <Field label="Full Name">
        <TextInput name="fullName" required autoComplete="name" placeholder="Enter your full name" icon={<UserIcon className="h-4 w-4" />} />
      </Field>

      <Field label="Email Address">
        <TextInput name="email" type="email" required autoComplete="email" placeholder="Enter your email address" icon={<Mail className="h-4 w-4" />} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Password">
          <PasswordInput name="password" required minLength={8} autoComplete="new-password" placeholder="Create a password" icon={<Lock className="h-4 w-4" />} />
        </Field>
        <Field label="Confirm Password">
          <PasswordInput name="confirmPassword" required minLength={8} autoComplete="new-password" placeholder="Confirm your password" icon={<Lock className="h-4 w-4" />} />
        </Field>
      </div>

      <Field label="Country / Region">
        <SelectInput name="country" required defaultValue="" icon={<Globe className="h-4 w-4" />}>
          <option value="" disabled>
            Select your country or region
          </option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </SelectInput>
      </Field>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-navy-800">Phone Number</span>
        <div className="flex gap-2.5">
          <div className="w-28 shrink-0">
            <SelectInput name="dialCode" defaultValue="+1" aria-label="Country dialling code">
              {DIAL_CODES.map((d) => (
                <option key={`${d.label}${d.code}`} value={d.code}>
                  {d.flag} {d.code}
                </option>
              ))}
            </SelectInput>
          </div>
          <TextInput name="phone" type="tel" required autoComplete="tel" placeholder="Enter your phone number" />
        </div>
      </div>

      <label className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-600">
        <input type="checkbox" name="terms" required className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
        <span>
          I agree to Trovework&apos;s{" "}
          <Link href="/terms" className="font-semibold text-brand-600 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-semibold text-brand-600 hover:underline">
            Privacy Policy
          </Link>
          .
        </span>
      </label>

      {submitted ? (
        <PendingNotice>
          Accounts aren&apos;t open yet — we&apos;re still building the verification system that
          makes Trovework trustworthy. Your details have not been saved.
        </PendingNotice>
      ) : null}

      <button
        type="submit"
        className="w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
      >
        Create Account
      </button>

      <Divider label="or continue with" />
      <SocialButtons />

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
