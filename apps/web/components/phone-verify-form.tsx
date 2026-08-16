"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { DIAL_CODES, Field } from "@/components/auth-fields";
import { ArrowLeft, ChevronDown } from "@/components/icons";
import { ApiError, api } from "@/lib/api";

export function PhoneVerifyForm() {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [dial, setDial] = useState(DIAL_CODES[0].code);
  const [number, setNumber] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();

  const digits = number.replace(/\D/g, "").length;
  const phoneTooShort = number.length > 0 && digits < 6;
  // The API wants E.164: dial code + national digits, no spaces or punctuation.
  const e164 = `${dial}${number.replace(/\D/g, "")}`;

  async function sendCode(e: FormEvent) {
    e.preventDefault();
    if (digits < 6) return;
    setBusy(true);
    setFormError(null);
    try {
      await api.verify.requestPhone(e164);
      setStep("code");
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Couldn't send the code. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function confirm(e: FormEvent) {
    e.preventDefault();
    if (code.length !== 6) return;
    setBusy(true);
    setFormError(null);
    try {
      await api.verify.confirmPhone(code);
      // Phone verified — the freelancer dashboard shows the next gate (ID).
      router.replace("/dashboard/freelancer");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Couldn't verify the code. Try again.");
      setBusy(false);
    }
  }

  if (step === "code") {
    return (
      <form noValidate onSubmit={confirm}>
        <h1 className="text-2xl font-bold tracking-tight text-navy-800 sm:text-3xl">Enter your code</h1>
        <p className="mt-3 text-base leading-relaxed text-slate-500">
          We sent a 6-digit code to {dial} {number}.
        </p>

        <div className="mt-7">
          <Field label="6-digit code" error={undefined}>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-center text-2xl tracking-[0.4em] text-navy-800 placeholder:tracking-normal placeholder:text-slate-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </Field>
        </div>

        {formError ? (
          <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
            {formError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy || code.length !== 6}
          className={`mt-6 w-full rounded-lg px-6 py-3.5 text-base font-semibold text-white transition ${
            busy || code.length !== 6 ? "cursor-not-allowed bg-slate-300" : "bg-brand-600 hover:bg-brand-700"
          }`}
        >
          {busy ? "Verifying…" : "Verify"}
        </button>

        <button
          type="button"
          onClick={() => { setStep("phone"); setCode(""); setFormError(null); }}
          className="mt-8 inline-flex items-center gap-2 text-base font-semibold text-navy-800 transition hover:text-brand-600"
        >
          <ArrowLeft className="h-5 w-5" />
          Use a different number
        </button>
      </form>
    );
  }

  return (
    <form noValidate onSubmit={sendCode}>
      <h1 className="text-2xl font-bold tracking-tight text-navy-800 sm:text-3xl">
        Verify your phone number
      </h1>
      <p className="mt-3 text-base leading-relaxed text-slate-500">
        Required before you publish your profile or a post. Enter your number and we&apos;ll send you
        a one-time code.
      </p>

      <div className="mt-7">
        <Field label="Phone Number" error={phoneTooShort ? "Enter a valid phone number." : undefined}>
          <div className="flex gap-3">
            <span className="relative">
              <label className="sr-only" htmlFor="dial-code">Country dialling code</label>
              <select
                id="dial-code"
                value={dial}
                onChange={(e) => setDial(e.target.value)}
                className="h-full appearance-none rounded-lg border border-slate-200 bg-white py-3 pl-3.5 pr-9 text-base text-navy-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              >
                {DIAL_CODES.map((d) => (
                  <option key={`${d.label}${d.code}`} value={d.code}>{d.flag} {d.code}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            </span>

            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              aria-invalid={phoneTooShort || undefined}
              placeholder="(555) 123-4567"
              className={`w-full rounded-lg border bg-white px-3.5 py-3 text-base text-navy-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                phoneTooShort
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-200 focus:border-brand-500 focus:ring-brand-100"
              }`}
            />
          </div>
        </Field>
      </div>

      {formError ? (
        <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
          {formError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy || digits < 6}
        className={`mt-6 w-full rounded-lg px-6 py-3.5 text-base font-semibold text-white transition ${
          busy || digits < 6 ? "cursor-not-allowed bg-slate-300" : "bg-brand-600 hover:bg-brand-700"
        }`}
      >
        {busy ? "Sending…" : "Send Code"}
      </button>

      <Link
        href="/dashboard/freelancer"
        className="mt-8 inline-flex items-center gap-2 text-base font-semibold text-navy-800 transition hover:text-brand-600"
      >
        <ArrowLeft className="h-5 w-5" />
        Back
      </Link>
    </form>
  );
}
