"use client";

import Link from "next/link";
import { useState } from "react";
import { DIAL_CODES, Field, PendingNotice } from "@/components/auth-fields";
import { ArrowLeft, ChevronDown } from "@/components/icons";

export function PhoneVerifyForm() {
  const [dial, setDial] = useState(DIAL_CODES[0].code);
  const [number, setNumber] = useState("");
  const [sent, setSent] = useState(false);

  const digits = number.replace(/\D/g, "").length;
  const tooShort = number.length > 0 && digits < 6;

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (digits >= 6) setSent(true);
      }}
    >
      <h1 className="text-2xl font-bold tracking-tight text-navy-800 sm:text-3xl">
        Verify your phone number
      </h1>
      <p className="mt-3 text-base leading-relaxed text-slate-500">
        Enter your phone number and we&apos;ll send you a one-time code.
      </p>

      <div className="mt-7">
        <Field label="Phone Number" error={tooShort ? "Enter a valid phone number." : undefined}>
          <div className="flex gap-3">
            <span className="relative">
              <label className="sr-only" htmlFor="dial-code">
                Country dialling code
              </label>
              <select
                id="dial-code"
                value={dial}
                onChange={(e) => setDial(e.target.value)}
                className="h-full appearance-none rounded-lg border border-slate-200 bg-white py-3 pl-3.5 pr-9 text-base text-navy-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              >
                {DIAL_CODES.map((d) => (
                  <option key={`${d.label}${d.code}`} value={d.code}>
                    {d.flag} {d.code}
                  </option>
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
              aria-invalid={tooShort || undefined}
              placeholder="(555) 123-4567"
              className={`w-full rounded-lg border bg-white px-3.5 py-3 text-base text-navy-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                tooShort
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-200 focus:border-brand-500 focus:ring-brand-100"
              }`}
            />
          </div>
        </Field>
      </div>

      <button
        type="submit"
        className="mt-6 w-full rounded-lg bg-brand-600 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-brand-700"
      >
        Send Code
      </button>

      <p className="mt-4 text-sm text-slate-500">
        We&apos;ll send a 6-digit code to verify your number.
      </p>

      {sent ? (
        <div className="mt-5">
          <PendingNotice>
            No code has been sent — phone verification goes live with the accounts API. The number
            entered was {dial} {number}.
          </PendingNotice>
        </div>
      ) : null}

      <Link
        href="/register"
        className="mt-8 inline-flex items-center gap-2 text-base font-semibold text-navy-800 transition hover:text-brand-600"
      >
        <ArrowLeft className="h-5 w-5" />
        Back
      </Link>
    </form>
  );
}
