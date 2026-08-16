import type { Metadata } from "next";
import { PhoneVerifyForm } from "@/components/phone-verify-form";
import { VerifyShell } from "@/components/verify-shell";

export const metadata: Metadata = {
  title: "Verify your phone to publish — Trovework",
  description: "Confirm your phone number with a one-time code before publishing your profile or a post.",
};

/* The panel artwork: a phone outline with a verified shield, as in the comp. */
function PhoneArt() {
  return (
    <div aria-hidden className="relative mx-auto mt-10 h-52 w-40">
      <div className="absolute inset-0 rounded-[1.75rem] border-2 border-white/25" />
      <div className="absolute left-1/2 top-3 h-1 w-10 -translate-x-1/2 rounded-full bg-white/25" />
      <div className="absolute left-5 top-12 space-y-2">
        <span className="block h-1.5 w-16 rounded-full bg-white/25" />
        <span className="block h-1.5 w-12 rounded-full bg-white/20" />
      </div>
      <svg viewBox="0 0 24 24" className="absolute -right-4 bottom-10 h-20 w-20 drop-shadow-lg">
        <defs>
          <linearGradient id="phone-shield" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6aa8ff" />
            <stop offset="100%" stopColor="#1a63f0" />
          </linearGradient>
        </defs>
        <path d="M12 2.4 4.2 5.2v6.1c0 5 3.3 9.4 7.8 10.8 4.5-1.4 7.8-5.8 7.8-10.8V5.2L12 2.4Z" fill="url(#phone-shield)" />
        <path
          d="m8.6 11.9 2.4 2.4 4.6-4.8"
          fill="none"
          stroke="#fff"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {[
        "left-2 top-4 h-1.5 w-1.5",
        "right-2 top-24 h-2 w-2",
        "left-1 bottom-8 h-1.5 w-1.5",
        "right-6 bottom-2 h-1.5 w-1.5",
      ].map((c) => (
        <span key={c} className={`absolute rounded-full bg-white/40 ${c}`} />
      ))}
    </div>
  );
}

export default function PhoneVerificationPage() {
  return (
    <VerifyShell
      panel={
        <>
          <h2 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
            One more step before you go live.
          </h2>
          <p className="mt-5 max-w-sm text-base leading-relaxed text-brand-100">
            Phone and identity checks both run before anything you write goes live, so
            everyone browsing Trovework is a real, verified person. We will send a one-time
            code.
          </p>
          <PhoneArt />
        </>
      }
    >
      <PhoneVerifyForm />
    </VerifyShell>
  );
}
