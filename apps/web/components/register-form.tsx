"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  COUNTRIES,
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
import { Globe, Hash, Lock, Mail, MapPin, UserIcon } from "@/components/icons";
import { subdivisionsFor } from "@/lib/subdivisions";

type FieldName =
  | "fullName"
  | "email"
  | "password"
  | "confirmPassword"
  | "country"
  | "state"
  | "postalCode";

type Errors = Partial<Record<FieldName, string>>;

/** Every field the user must fill before the account can be created. */
const REQUIRED_FIELDS: FieldName[] = [
  "fullName",
  "email",
  "password",
  "confirmPassword",
  "country",
  "state",
  "postalCode",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Loose on purpose: postal formats vary widely across the countries we serve.
const POSTAL_RE = /^[A-Za-z0-9][A-Za-z0-9 -]{1,11}$/;

function validate(fd: FormData): Errors {
  const e: Errors = {};

  const fullName = String(fd.get("fullName") ?? "").trim();
  if (!fullName) e.fullName = "Enter your full name.";
  else if (fullName.length < 2) e.fullName = "Name must be at least 2 characters.";

  const email = String(fd.get("email") ?? "").trim();
  if (!email) e.email = "Enter your email address.";
  else if (!EMAIL_RE.test(email)) e.email = "Enter a valid email address.";

  const password = String(fd.get("password") ?? "");
  if (!password) e.password = "Create a password.";
  else if (password.length < 8) e.password = "Use at least 8 characters.";
  else if (!/[A-Za-z]/.test(password) || !/\d/.test(password))
    e.password = "Include at least one letter and one number.";

  const confirm = String(fd.get("confirmPassword") ?? "");
  if (!confirm) e.confirmPassword = "Re-enter your password.";
  else if (confirm !== password) e.confirmPassword = "Passwords do not match.";

  if (!String(fd.get("country") ?? "")) e.country = "Select your country or region.";

  const state = String(fd.get("state") ?? "").trim();
  if (!state) e.state = "Enter your state or province.";
  else if (state.length < 2) e.state = "Enter a valid state or province.";

  const postalCode = String(fd.get("postalCode") ?? "").trim();
  if (!postalCode) e.postalCode = "Enter your postal code.";
  else if (!POSTAL_RE.test(postalCode)) e.postalCode = "Enter a valid postal code.";

  return e;
}

export function RegisterForm({ defaultRole = "client" }: { defaultRole?: Role }) {
  const [role, setRole] = useState<Role>(defaultRole);
  const [agreed, setAgreed] = useState(false);
  const [complete, setComplete] = useState(false);
  const [country, setCountry] = useState("");
  const [stateValue, setStateValue] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const stateOptions = subdivisionsFor(country);
  // Countries we haven't listed fall back to free text so nobody is blocked.
  const useStateSelect = !country || stateOptions.length > 0;
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  // The accounts API arrives in Phase 1; until then the form validates fully but
  // does not create an account.
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(new FormData(e.currentTarget));
    setErrors(found);
    setSubmitted(Object.keys(found).length === 0);
  }

  // Clear a field's error as soon as the user edits it, so the form stops
  // shouting about something they're already fixing.
  const recomputeComplete = useCallback(() => {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    setComplete(REQUIRED_FIELDS.every((f) => String(fd.get(f) ?? "").trim() !== ""));
  }, []);

  // Controlled fields (country, state) settle after render, so re-check then.
  useEffect(recomputeComplete, [country, stateValue, recomputeComplete]);

  function handleChange(e: ChangeEvent<HTMLFormElement>) {
    recomputeComplete();

    const name = (e.target as unknown as HTMLInputElement).name as FieldName;
    setSubmitted(false);
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  }

  const canSubmit = agreed && complete;

  return (
    <form ref={formRef} noValidate onSubmit={handleSubmit} onChange={handleChange} className="space-y-4">
      <RoleSelect value={role} onChange={setRole} />

      <Field label="Full Name" error={errors.fullName}>
        <TextInput
          name="fullName"
          required
          autoComplete="name"
          placeholder="Enter your full name"
          invalid={!!errors.fullName}
          icon={<UserIcon className="h-5 w-5" />}
        />
      </Field>

      <Field label="Email Address" error={errors.email}>
        <TextInput
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Enter your email address"
          invalid={!!errors.email}
          icon={<Mail className="h-5 w-5" />}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Password" error={errors.password}>
          <PasswordInput
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Create a password"
            invalid={!!errors.password}
            icon={<Lock className="h-5 w-5" />}
          />
        </Field>
        <Field label="Confirm Password" error={errors.confirmPassword}>
          <PasswordInput
            name="confirmPassword"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Confirm your password"
            invalid={!!errors.confirmPassword}
            icon={<Lock className="h-5 w-5" />}
          />
        </Field>
      </div>

      <Field label="Country / Region" error={errors.country}>
        <SelectInput
          name="country"
          required
          value={country}
          onChange={(e) => {
            setCountry(e.target.value);
            setStateValue("");
          }}
          invalid={!!errors.country}
          icon={<Globe className="h-5 w-5" />}
        >
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

      <div className="grid gap-4 sm:grid-cols-[6fr_4fr]">
        <Field label="State / Province" error={errors.state}>
          {useStateSelect ? (
            <SelectInput
              name="state"
              required
              disabled={!country}
              value={stateValue}
              onChange={(e) => setStateValue(e.target.value)}
              invalid={!!errors.state}
              icon={<MapPin className="h-5 w-5" />}
            >
              <option value="" disabled>
                {country ? "Select your state or province" : "Select your country first"}
              </option>
              {stateOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </SelectInput>
          ) : (
            <TextInput
              name="state"
              required
              value={stateValue}
              onChange={(e) => setStateValue(e.target.value)}
              autoComplete="address-level1"
              placeholder="Enter your state or province"
              invalid={!!errors.state}
              icon={<MapPin className="h-5 w-5" />}
            />
          )}
        </Field>
        <Field label="Postal Code" error={errors.postalCode}>
          <TextInput
            name="postalCode"
            required
            autoComplete="postal-code"
            invalid={!!errors.postalCode}
            icon={<Hash className="h-5 w-5" />}
          />
        </Field>
      </div>

      <label className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-600">
        <input
          type="checkbox"
          name="terms"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
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
        disabled={!canSubmit}
        aria-disabled={!canSubmit}
        title={
          complete
            ? agreed
              ? undefined
              : "Accept the Terms of Service and Privacy Policy to continue"
            : "Fill in every field to continue"
        }
        className={`w-full rounded-lg px-4 py-3.5 text-base font-semibold text-white transition ${
          canSubmit ? "bg-brand-600 hover:bg-brand-700" : "cursor-not-allowed bg-slate-300"
        }`}
      >
        Create Account
      </button>

      <Divider label="or continue with" />
      <SocialButtons />

      <p className="text-center text-base text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          Login
        </Link>
      </p>
    </form>
  );
}
