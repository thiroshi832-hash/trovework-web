import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Safety & Trust — Trovework",
  description:
    "How Trovework keeps the marketplace safe: mandatory ID verification, private contact details, in-platform chat, and encrypted document storage.",
};

/** Each pillar describes a control the platform actually enforces today. */
const PILLARS: { title: string; body: string }[] = [
  {
    title: "Every member is ID-verified",
    body: "Before anyone can publish a profile, post a service, or message you, they verify their identity with a government-issued ID and a live selfie. Our engine matches the two, and a human reviews anything it can't decide with confidence — so everyone you deal with is a real, verified person.",
  },
  {
    title: "Your contact details stay private",
    body: "Phone numbers, emails and messaging handles are never shown on your public profile. They're released only to a client who has completed identity verification — and that rule is enforced on our servers, not just hidden in the page, so it can't be worked around.",
  },
  {
    title: "Talk safely in Trovework chat",
    body: "Every conversation happens in our built-in chat, so you never have to hand out personal contact information just to start working together. Only a verified client can open a conversation with a freelancer.",
  },
  {
    title: "No off-platform contact sharing",
    body: "To protect the community, service posts can't contain phone numbers, emails, links or messaging-app names. We detect attempts and show you exactly what tripped the check; repeated attempts lead to a suspension after three strikes.",
  },
  {
    title: "Your documents are encrypted",
    body: "ID images and selfies are encrypted and stored outside the public web root — they're never served on your profile or anywhere public. They're used only to verify who you are.",
  },
  {
    title: "Ratings you can trust",
    body: "A review can only be left by someone you've actually had a conversation with, and you can't review yourself. So a freelancer's rating reflects real interactions, not anonymous noise.",
  },
];

export default function SafetyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Safety &amp; Trust</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy-800 sm:text-4xl">
        Everyone here is a verified, real person
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-slate-500">
        Trovework is built so you can hire — or get hired — with confidence. Here is exactly how we keep it safe.
      </p>

      <div className="mt-12 space-y-10">
        {PILLARS.map((p) => (
          <section key={p.title}>
            <h2 className="text-xl font-bold text-navy-800">{p.title}</h2>
            <p className="mt-2 leading-relaxed text-slate-600">{p.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-14 rounded-2xl bg-brand-50 p-8 text-center">
        <h2 className="text-xl font-bold text-navy-800">Ready to get started?</h2>
        <p className="mt-2 text-slate-600">Create an account and verify once — then everything unlocks.</p>
        <Link
          href="/register"
          className="mt-5 inline-block rounded-lg bg-brand-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Get verified
        </Link>
      </div>
    </div>
  );
}
