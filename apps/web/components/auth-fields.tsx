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

// Every country, alphabetical. Ones without a subdivision list in
// lib/subdivisions.ts fall back to a free-text state/province field.
export const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina",
  "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados",
  "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana",
  "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon",
  "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
  "Congo (Democratic Republic)", "Congo (Republic)", "Costa Rica", "Côte d'Ivoire", "Croatia", "Cuba",
  "Cyprus", "Czechia", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland",
  "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala",
  "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia",
  "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya",
  "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia",
  "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives",
  "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova",
  "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal",
  "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia",
  "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru",
  "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis",
  "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
  "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
  "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka",
  "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand",
  "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
];

/**
 * Dial codes for the phone-verification picker — a country name for each so it's
 * navigable and type-to-search works. This is UX only: whether a number can
 * actually be texted is decided by the API (apps/api/src/verification/
 * sms-pricing.ts), so a destination it refuses answers with a clear message
 * rather than sending. Sorted by country name.
 */
export const DIAL_CODES = [
  { flag: "🇦🇫", code: "+93", label: "Afghanistan" },
  { flag: "🇦🇱", code: "+355", label: "Albania" },
  { flag: "🇩🇿", code: "+213", label: "Algeria" },
  { flag: "🇦🇩", code: "+376", label: "Andorra" },
  { flag: "🇦🇴", code: "+244", label: "Angola" },
  { flag: "🇦🇷", code: "+54", label: "Argentina" },
  { flag: "🇦🇲", code: "+374", label: "Armenia" },
  { flag: "🇦🇺", code: "+61", label: "Australia" },
  { flag: "🇦🇹", code: "+43", label: "Austria" },
  { flag: "🇦🇿", code: "+994", label: "Azerbaijan" },
  { flag: "🇧🇭", code: "+973", label: "Bahrain" },
  { flag: "🇧🇩", code: "+880", label: "Bangladesh" },
  { flag: "🇧🇾", code: "+375", label: "Belarus" },
  { flag: "🇧🇪", code: "+32", label: "Belgium" },
  { flag: "🇧🇴", code: "+591", label: "Bolivia" },
  { flag: "🇧🇦", code: "+387", label: "Bosnia and Herzegovina" },
  { flag: "🇧🇼", code: "+267", label: "Botswana" },
  { flag: "🇧🇷", code: "+55", label: "Brazil" },
  { flag: "🇧🇬", code: "+359", label: "Bulgaria" },
  { flag: "🇰🇭", code: "+855", label: "Cambodia" },
  { flag: "🇨🇲", code: "+237", label: "Cameroon" },
  { flag: "🇨🇦", code: "+1", label: "Canada" },
  { flag: "🇨🇱", code: "+56", label: "Chile" },
  { flag: "🇨🇳", code: "+86", label: "China" },
  { flag: "🇨🇴", code: "+57", label: "Colombia" },
  { flag: "🇨🇷", code: "+506", label: "Costa Rica" },
  { flag: "🇭🇷", code: "+385", label: "Croatia" },
  { flag: "🇨🇾", code: "+357", label: "Cyprus" },
  { flag: "🇨🇿", code: "+420", label: "Czechia" },
  { flag: "🇩🇰", code: "+45", label: "Denmark" },
  { flag: "🇩🇴", code: "+1", label: "Dominican Republic" },
  { flag: "🇪🇨", code: "+593", label: "Ecuador" },
  { flag: "🇪🇬", code: "+20", label: "Egypt" },
  { flag: "🇸🇻", code: "+503", label: "El Salvador" },
  { flag: "🇪🇪", code: "+372", label: "Estonia" },
  { flag: "🇪🇹", code: "+251", label: "Ethiopia" },
  { flag: "🇫🇮", code: "+358", label: "Finland" },
  { flag: "🇫🇷", code: "+33", label: "France" },
  { flag: "🇬🇪", code: "+995", label: "Georgia" },
  { flag: "🇩🇪", code: "+49", label: "Germany" },
  { flag: "🇬🇭", code: "+233", label: "Ghana" },
  { flag: "🇬🇷", code: "+30", label: "Greece" },
  { flag: "🇬🇹", code: "+502", label: "Guatemala" },
  { flag: "🇭🇳", code: "+504", label: "Honduras" },
  { flag: "🇭🇰", code: "+852", label: "Hong Kong" },
  { flag: "🇭🇺", code: "+36", label: "Hungary" },
  { flag: "🇮🇸", code: "+354", label: "Iceland" },
  { flag: "🇮🇳", code: "+91", label: "India" },
  { flag: "🇮🇩", code: "+62", label: "Indonesia" },
  { flag: "🇮🇷", code: "+98", label: "Iran" },
  { flag: "🇮🇶", code: "+964", label: "Iraq" },
  { flag: "🇮🇪", code: "+353", label: "Ireland" },
  { flag: "🇮🇱", code: "+972", label: "Israel" },
  { flag: "🇮🇹", code: "+39", label: "Italy" },
  { flag: "🇯🇲", code: "+1", label: "Jamaica" },
  { flag: "🇯🇵", code: "+81", label: "Japan" },
  { flag: "🇯🇴", code: "+962", label: "Jordan" },
  { flag: "🇰🇿", code: "+7", label: "Kazakhstan" },
  { flag: "🇰🇪", code: "+254", label: "Kenya" },
  { flag: "🇰🇼", code: "+965", label: "Kuwait" },
  { flag: "🇰🇬", code: "+996", label: "Kyrgyzstan" },
  { flag: "🇱🇻", code: "+371", label: "Latvia" },
  { flag: "🇱🇧", code: "+961", label: "Lebanon" },
  { flag: "🇱🇹", code: "+370", label: "Lithuania" },
  { flag: "🇱🇺", code: "+352", label: "Luxembourg" },
  { flag: "🇲🇴", code: "+853", label: "Macao" },
  { flag: "🇲🇾", code: "+60", label: "Malaysia" },
  { flag: "🇲🇹", code: "+356", label: "Malta" },
  { flag: "🇲🇽", code: "+52", label: "Mexico" },
  { flag: "🇲🇩", code: "+373", label: "Moldova" },
  { flag: "🇲🇨", code: "+377", label: "Monaco" },
  { flag: "🇲🇳", code: "+976", label: "Mongolia" },
  { flag: "🇲🇦", code: "+212", label: "Morocco" },
  { flag: "🇲🇲", code: "+95", label: "Myanmar" },
  { flag: "🇳🇵", code: "+977", label: "Nepal" },
  { flag: "🇳🇱", code: "+31", label: "Netherlands" },
  { flag: "🇳🇿", code: "+64", label: "New Zealand" },
  { flag: "🇳🇬", code: "+234", label: "Nigeria" },
  { flag: "🇲🇰", code: "+389", label: "North Macedonia" },
  { flag: "🇳🇴", code: "+47", label: "Norway" },
  { flag: "🇴🇲", code: "+968", label: "Oman" },
  { flag: "🇵🇰", code: "+92", label: "Pakistan" },
  { flag: "🇵🇸", code: "+970", label: "Palestine" },
  { flag: "🇵🇦", code: "+507", label: "Panama" },
  { flag: "🇵🇾", code: "+595", label: "Paraguay" },
  { flag: "🇵🇪", code: "+51", label: "Peru" },
  { flag: "🇵🇭", code: "+63", label: "Philippines" },
  { flag: "🇵🇱", code: "+48", label: "Poland" },
  { flag: "🇵🇹", code: "+351", label: "Portugal" },
  { flag: "🇵🇷", code: "+1", label: "Puerto Rico" },
  { flag: "🇶🇦", code: "+974", label: "Qatar" },
  { flag: "🇷🇴", code: "+40", label: "Romania" },
  { flag: "🇷🇺", code: "+7", label: "Russia" },
  { flag: "🇸🇦", code: "+966", label: "Saudi Arabia" },
  { flag: "🇷🇸", code: "+381", label: "Serbia" },
  { flag: "🇸🇬", code: "+65", label: "Singapore" },
  { flag: "🇸🇰", code: "+421", label: "Slovakia" },
  { flag: "🇸🇮", code: "+386", label: "Slovenia" },
  { flag: "🇿🇦", code: "+27", label: "South Africa" },
  { flag: "🇰🇷", code: "+82", label: "South Korea" },
  { flag: "🇪🇸", code: "+34", label: "Spain" },
  { flag: "🇱🇰", code: "+94", label: "Sri Lanka" },
  { flag: "🇸🇪", code: "+46", label: "Sweden" },
  { flag: "🇨🇭", code: "+41", label: "Switzerland" },
  { flag: "🇹🇼", code: "+886", label: "Taiwan" },
  { flag: "🇹🇿", code: "+255", label: "Tanzania" },
  { flag: "🇹🇭", code: "+66", label: "Thailand" },
  { flag: "🇹🇳", code: "+216", label: "Tunisia" },
  { flag: "🇹🇷", code: "+90", label: "Turkey" },
  { flag: "🇺🇬", code: "+256", label: "Uganda" },
  { flag: "🇺🇦", code: "+380", label: "Ukraine" },
  { flag: "🇦🇪", code: "+971", label: "United Arab Emirates" },
  { flag: "🇬🇧", code: "+44", label: "United Kingdom" },
  { flag: "🇺🇸", code: "+1", label: "United States" },
  { flag: "🇺🇾", code: "+598", label: "Uruguay" },
  { flag: "🇺🇿", code: "+998", label: "Uzbekistan" },
  { flag: "🇻🇪", code: "+58", label: "Venezuela" },
  { flag: "🇻🇳", code: "+84", label: "Vietnam" },
  { flag: "🇾🇪", code: "+967", label: "Yemen" },
  { flag: "🇿🇲", code: "+260", label: "Zambia" },
  { flag: "🇿🇼", code: "+263", label: "Zimbabwe" },
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
