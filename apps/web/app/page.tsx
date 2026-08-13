import Link from "next/link";
import type { ReactNode } from "react";

/* ---------------------------------- icons --------------------------------- */

type IconProps = { className?: string };

function ShieldCheck({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 2.5 4.5 5.5v5.2c0 4.6 3.2 8.9 7.5 10.3 4.3-1.4 7.5-5.7 7.5-10.3V5.5L12 2.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="m8.8 11.8 2.2 2.2 4.2-4.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Check({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="m5 12.5 4.5 4.5L19 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Lock({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="15.5" r="1.4" fill="currentColor" />
    </svg>
  );
}

function Chat({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 3.5V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Search({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function NoLeak({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="m6.5 6.5 11 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function Star({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17.9 6.8 19.6l1-5.8-4.3-4.1 5.9-.9L12 3.5Z" />
    </svg>
  );
}

/* -------------------------------- primitives ------------------------------- */

function Logo() {
  return (
    <span className="flex items-center gap-2 font-semibold text-slate-900">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
        <ShieldCheck className="h-5 w-5" />
      </span>
      <span className="text-lg tracking-tight">Trovework</span>
    </span>
  );
}

function VerifiedPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
      <Check className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}

/* ---------------------------------- page ---------------------------------- */

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-white text-slate-900">
      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#how" className="hover:text-slate-900">How it works</a>
            <a href="#features" className="hover:text-slate-900">Features</a>
            <a href="#trust" className="hover:text-slate-900">Trust &amp; safety</a>
            <a href="#faq" className="hover:text-slate-900">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 sm:block">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              Sign up
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 via-white to-white" />
          <div
            className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[420px] w-[820px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
            style={{ background: "radial-gradient(closest-side, #c7d2fe, transparent)" }}
          />
          <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-brand-700 ring-1 ring-brand-200">
                <ShieldCheck className="h-4 w-4 text-brand-600" />
                Every user is ID-verified
              </span>
              <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Hire freelancers you can{" "}
                <span className="bg-gradient-to-r from-brand-600 to-brand-500 bg-clip-text text-transparent">
                  actually trust
                </span>
                .
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
                Trovework is the freelance marketplace where everyone who can contact you is
                identity-verified — face matched to a real ID. No bots, no scammers, no
                time-wasters. Just verified people doing real work.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup?role=freelancer"
                  className="rounded-lg bg-brand-600 px-6 py-3 text-center text-base font-semibold text-white shadow-sm transition hover:bg-brand-700"
                >
                  Join as a freelancer
                </Link>
                <Link
                  href="/search"
                  className="rounded-lg bg-white px-6 py-3 text-center text-base font-semibold text-slate-800 ring-1 ring-slate-300 transition hover:bg-slate-50"
                >
                  Browse freelancers
                </Link>
              </div>
              <p className="mt-4 text-sm text-slate-500">
                Free to join · Browse without signing up · You arrange work directly.
              </p>
            </div>

            {/* Verified profile mock */}
            <div className="relative">
              <div className="mx-auto w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
                <div className="flex items-center gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
                    AK
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">Aiko K.</span>
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-white">
                        <Check className="h-3 w-3" />
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">Brand &amp; UI Designer</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-amber-400">
                  <Star className="h-4 w-4" />
                  <Star className="h-4 w-4" />
                  <Star className="h-4 w-4" />
                  <Star className="h-4 w-4" />
                  <Star className="h-4 w-4" />
                  <span className="ml-1 text-sm text-slate-500">4.9 · 37 reviews</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Figma", "Branding", "Webflow"].map((s) => (
                    <span key={s} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="mt-5 rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-100">
                  <VerifiedPill>ID verified · face + document match</VerifiedPill>
                </div>
                <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-3">
                  <p className="flex items-center gap-2 text-sm text-slate-400">
                    <Lock className="h-4 w-4" />
                    Contact info unlocks after you verify
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section id="trust" className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 py-12 sm:grid-cols-3">
            {[
              {
                icon: <ShieldCheck className="h-6 w-6" />,
                title: "Real identity, verified",
                body: "Our own engine matches every user's selfie to their government ID — and the details on it.",
              },
              {
                icon: <Lock className="h-6 w-6" />,
                title: "Private by default",
                body: "Contact details are released only to verified clients — never scraped, never public.",
              },
              {
                icon: <Check className="h-6 w-6" />,
                title: "Free in v1",
                body: "No fees and no payment handling. You agree terms and pay directly, off-platform.",
              },
            ].map((c) => (
              <div key={c.title} className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-brand-600 ring-1 ring-slate-200">
                  {c.icon}
                </span>
                <div>
                  <h3 className="font-semibold text-slate-900">{c.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Verification only when it matters
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Browse the whole marketplace freely. You only verify at the moment of real interaction —
              minimal friction, maximum trust.
            </p>
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-8">
              <h3 className="text-xl font-semibold text-slate-900">For freelancers</h3>
              <ol className="mt-6 space-y-5">
                {[
                  ["Build your profile", "Add your headline, skills, rate, resume and portfolio."],
                  ["Verify your ID", "Upload your ID and a selfie — our engine confirms it's really you."],
                  ["Get discovered & hired", "You become visible in search and verified clients reach out to you."],
                ].map(([t, b], i) => (
                  <li key={t} className="flex gap-4">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-slate-900">{t}</p>
                      <p className="text-sm text-slate-600">{b}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl border border-slate-200 p-8">
              <h3 className="text-xl font-semibold text-slate-900">For clients</h3>
              <ol className="mt-6 space-y-5">
                {[
                  ["Browse freely", "Search verified freelancers and read posts without signing up."],
                  ["Verify to connect", "Confirm your identity once — it unlocks contact info and chat."],
                  ["Chat & hire directly", "Message the freelancer, agree the work, and pay privately."],
                ].map(([t, b], i) => (
                  <li key={t} className="flex gap-4">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-500 text-sm font-semibold text-white">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-slate-900">{t}</p>
                      <p className="text-sm text-slate-600">{b}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Built so trust isn&apos;t optional
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Every safeguard is enforced on our servers — not just hidden in the interface.
              </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <ShieldCheck className="h-6 w-6" />,
                  title: "In-house ID verification",
                  body: "Face match plus document OCR and liveness checks — both must pass before you're verified.",
                },
                {
                  icon: <Lock className="h-6 w-6" />,
                  title: "Gated contact info",
                  body: "Telegram, Discord and WhatsApp handles are shown only to verified clients.",
                },
                {
                  icon: <NoLeak className="h-6 w-6" />,
                  title: "Anti-leak protection",
                  body: "Posts are scanned for contact details on every save. Three violations bans the account.",
                },
                {
                  icon: <Chat className="h-6 w-6" />,
                  title: "Real-time chat",
                  body: "Verified clients message freelancers live — freelancers can't be spammed by strangers.",
                },
                {
                  icon: <Search className="h-6 w-6" />,
                  title: "Search & filters",
                  body: "Filter by category, skill, price and rating. Only verified freelancers ever appear.",
                },
                {
                  icon: <Star className="h-6 w-6" />,
                  title: "Reviews & ratings",
                  body: "Leave ratings after working together — real feedback that sharpens search over time.",
                },
              ].map((f) => (
                <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:shadow-md">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                    {f.icon}
                  </span>
                  <h3 className="mt-4 font-semibold text-slate-900">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Questions, answered
          </h2>
          <div className="mt-10 divide-y divide-slate-200 rounded-2xl border border-slate-200">
            {[
              [
                "Does Trovework handle payments?",
                "Not in this version. Trovework verifies identity and connects you — you agree the work and pay the freelancer directly. We don't process or guarantee payment.",
              ],
              [
                "Do I have to verify just to look around?",
                "No. Anyone can browse freelancers and read posts freely. You only verify your ID when you decide to contact someone.",
              ],
              [
                "How does ID verification work?",
                "You upload a photo of your ID and a selfie. Our engine checks that your face matches the ID and that the details you entered match the document. Both must match.",
              ],
              [
                "Is my ID data safe?",
                "Yes. ID images and selfies are encrypted, stored outside the public web, and access-restricted. They're never shown on your profile.",
              ],
            ].map(([q, a]) => (
              <details key={q} className="group px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-slate-900">
                  {q}
                  <span className="ml-4 text-slate-400 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="overflow-hidden rounded-3xl bg-brand-900 px-8 py-14 text-center sm:px-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Join a marketplace where everyone is real
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-brand-100">
              Create your profile or start hiring today. Verification takes minutes — trust lasts.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/signup?role=freelancer"
                className="rounded-lg bg-white px-6 py-3 text-base font-semibold text-brand-700 transition hover:bg-brand-50"
              >
                Join as a freelancer
              </Link>
              <Link
                href="/signup?role=client"
                className="rounded-lg bg-brand-600 px-6 py-3 text-base font-semibold text-white ring-1 ring-brand-500 transition hover:bg-brand-500"
              >
                Start hiring
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-slate-500">
              A trust-first global freelance marketplace. Every user is ID-verified.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-slate-500">
            <a href="#how" className="hover:text-slate-900">How it works</a>
            <a href="#features" className="hover:text-slate-900">Features</a>
            <a href="#faq" className="hover:text-slate-900">FAQ</a>
            <Link href="/privacy" className="hover:text-slate-900">Privacy</Link>
          </div>
        </div>
        <div className="border-t border-slate-100 py-4">
          <p className="mx-auto max-w-6xl px-6 text-xs text-slate-400">
            © 2026 Trovework · trovework.com — Trovework verifies identity; it does not handle or guarantee payment.
          </p>
        </div>
      </footer>
    </div>
  );
}
