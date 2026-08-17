"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { COUNTRIES, Field, RoleSelect, SelectInput, TextInput, type Role } from "@/components/auth-fields";
import { Globe, Hash, MapPin } from "@/components/icons";
import { subdivisionsFor } from "@/lib/subdivisions";
import { ApiError, api, homeFor } from "@/lib/api";

type FieldName = "country" | "state" | "postalCode";
type Errors = Partial<Record<FieldName, string>>;

const POSTAL_RE = /^[A-Za-z0-9][A-Za-z0-9 -]{1,11}$/;

/**
 * Shown after a NEW Google user returns from the OAuth callback. Google gave us
 * their name and email; Trovework still needs the role and location that normal
 * registration collects. The pending identity rides in an httpOnly cookie the
 * callback set, so this form only submits the missing pieces.
 */
export function CompleteGoogleForm() {
  const [role, setRole] = useState<Role>("client");
  const [country, setCountry] = useState("");
  const [stateValue, setStateValue] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const stateOptions = subdivisionsFor(country);
  const useStateSelect = !country || stateOptions.length > 0;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const postalCode = String(fd.get("postalCode") ?? "").trim();

    const next: Errors = {};
    if (!country) next.country = "Select your country or region.";
    if (!stateValue.trim()) next.state = "Enter your state or province.";
    if (!postalCode) next.postalCode = "Enter your postal code.";
    else if (!POSTAL_RE.test(postalCode)) next.postalCode = "Enter a valid postal code.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    setFormError(null);
    try {
      await api.completeGoogleSignup({ role, country, state: stateValue.trim(), postalCode });
      router.replace(homeFor(role));
      router.refresh();
    } catch (err) {
      // 401 means the pending session expired — send them back to start Google again.
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/register?error=google_expired");
        return;
      }
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  const canSubmit = agreed && !!country && !!stateValue.trim() && !busy;

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-800">Finish setting up your account</h1>
        <p className="mt-2 text-base leading-relaxed text-slate-500">
          You&apos;re signed in with Google. Just a couple more details and you&apos;re in.
        </p>
      </div>

      <RoleSelect value={role} onChange={setRole} />

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

      {formError ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
          {formError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!canSubmit}
        aria-busy={busy}
        className={`w-full rounded-lg px-4 py-3.5 text-base font-semibold text-white transition ${
          canSubmit ? "bg-brand-600 hover:bg-brand-700" : "cursor-not-allowed bg-slate-300"
        }`}
      >
        {busy ? "Finishing up…" : "Create account"}
      </button>
    </form>
  );
}
