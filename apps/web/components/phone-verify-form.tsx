"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { DIAL_CODES, Field } from "@/components/auth-fields";
import { Select } from "@/components/select";
import { ArrowLeft } from "@/components/icons";
import { ApiError, api } from "@/lib/api";
import { useSession } from "@/lib/use-session";

export function PhoneVerifyForm() {
  const { user, ready } = useSession();
  const [step, setStep] = useState<"phone" | "code">("phone");
  // Track the chosen country (unique) and derive its dial code — several
  // countries share a code (+1), so keying on the code alone can't tell them
  // apart. Defaults to the United States.
  const [dialCountry, setDialCountry] = useState("United States");
  const dial = DIAL_CODES.find((d) => d.label === dialCountry)?.code ?? "+1";
  const [number, setNumber] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  /** Seconds until "Resend" is allowed. Counted down by the effect below. */
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();

  // Every SMS costs money, so the server enforces a gap between sends and tells
  // us how long it is; this only mirrors that, so the button can't be leaned on.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const digits = number.replace(/\D/g, "").length;
  const phoneTooShort = number.length > 0 && digits < 6;
  // The API wants E.164: dial code + national digits, no spaces or punctuation.
  const e164 = `${dial}${number.replace(/\D/g, "")}`;

  /** Shared by the first send and the resend. */
  async function requestCode(): Promise<boolean> {
    setBusy(true);
    setFormError(null);
    setNotice(null);
    try {
      const { resendAfterSeconds } = await api.verify.requestPhone(e164);
      setCooldown(resendAfterSeconds);
      return true;
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Couldn't send the code. Try again.");
      // A 429 means we asked too soon — adopt the server's wait so the button
      // stays disabled for exactly as long as it will keep refusing.
      if (err instanceof ApiError && err.retryAfterSeconds) setCooldown(err.retryAfterSeconds);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function sendCode(e: FormEvent) {
    e.preventDefault();
    if (digits < 6) return;
    if (await requestCode()) setStep("code");
  }

  async function resend() {
    if (cooldown > 0 || busy) return;
    if (await requestCode()) {
      setCode("");
      setNotice("We've sent you a new code.");
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

  // With no SMS provider linked, phone verification is switched off — sending a
  // code would only 503. Rather than a dead-end form, tell the user it isn't
  // needed and point them at the step that still is (identity).
  if (ready && user && user.phoneVerificationRequired === false) {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-800 sm:text-3xl">
          Phone verification isn&apos;t required
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-500">
          You don&apos;t need to verify a phone number right now. Verify your identity to publish
          your profile and posts.
        </p>
        <Link
          href="/verify/id"
          className="mt-7 inline-block rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Verify my identity
        </Link>
        <Link
          href="/dashboard/freelancer"
          className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-navy-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
      </div>
    );
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

        {notice ? (
          <p role="status" className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800">
            {notice}
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

        <p className="mt-5 text-center text-sm text-slate-500">
          Didn&apos;t get it?{" "}
          <button
            type="button"
            onClick={resend}
            disabled={cooldown > 0 || busy}
            // aria-live so a screen reader hears the timer tick down to enabled,
            // rather than being left with a button that silently does nothing.
            aria-live="polite"
            className={
              cooldown > 0 || busy
                ? "cursor-not-allowed font-semibold text-slate-400"
                : "font-semibold text-brand-600 transition hover:text-brand-700"
            }
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
          </button>
        </p>

        <button
          type="button"
          onClick={() => { setStep("phone"); setCode(""); setFormError(null); setNotice(null); }}
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
            <Select
              ariaLabel="Country dialling code"
              searchable
              value={dialCountry}
              onChange={setDialCountry}
              options={DIAL_CODES.map((d) => ({ value: d.label, label: `${d.flag} ${d.label} (${d.code})` }))}
              className="w-44 shrink-0"
            />

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
