import type { Metadata } from "next";
import { Portrait } from "@/components/brand";
import { PEOPLE } from "@/lib/people";
import { RegisterForm } from "@/components/register-form";
import {
  ChatBubbleSolid,
  GiftSolid,
  Quote,
  ShieldCheckSolid,
} from "@/components/icons";
import type { Role } from "@/components/auth-fields";

export const metadata: Metadata = {
  title: "Create your account — Trovework",
  description:
    "Join Trovework, the trust-first freelance marketplace where every user is ID-verified. Free to join, for work of every kind.",
};

const BENEFITS = [
  {
    icon: <ShieldCheckSolid className="h-7 w-7" />,
    title: "Verified community",
    body: "Every user is verified to build a safer, more trustworthy marketplace.",
  },
  {
    icon: <ChatBubbleSolid className="h-7 w-7" />,
    title: "Safe communication",
    body: "Message, share files and collaborate securely within Trovework.",
  },
  {
    icon: <GiftSolid className="h-7 w-7" />,
    title: "Free to use",
    body: "Create your account and explore opportunities at no cost.",
  },
];

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const defaultRole: Role = role === "freelancer" ? "freelancer" : "client";

  return (
    <div className="flex flex-1 flex-col bg-slate-50/60">
      <main className="flex-1">
        <div className="mx-auto max-w-page px-6 lg:px-10 xl:px-16 py-8">
          {/* ------------------------- split card ------------------------- */}
          <div className="grid overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 lg:grid-cols-[4.5fr_5.5fr]">
            {/* left — value proposition */}
            <div className="relative flex items-center overflow-hidden bg-navy-900 px-12 py-14 sm:px-14 sm:py-16 lg:px-16 lg:py-20 xl:px-20 xl:py-24">
              {/* Background artwork. Served as a CSS background rather than next/image so the
                  container has no runtime image-optimisation dependency. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-cover bg-right"
                style={{ backgroundImage: "url('/register-panel.webp')" }}
              />
              {/* Readability scrim: the artwork's bright glow sits directly behind the copy, so
                  weight it left where the text is and let the right-hand icons show through. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-navy-900/70 via-navy-900/45 to-navy-900/10"
              />

              <div className="relative w-full">
                <h1 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
                  Join a trusted global freelance marketplace
                </h1>
                <p className="mt-5 max-w-md text-base leading-relaxed text-brand-100 lg:text-lg">
                  Trovework connects verified clients and freelancers to get work done — safely,
                  smoothly, and successfully.
                </p>

                <ul className="mt-8 space-y-5">
                  {BENEFITS.map((b) => (
                    <li key={b.title} className="flex gap-4">
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-badge-from to-badge-to text-white shadow-[0_10px_22px_-6px_rgba(10,85,238,0.75)]">
                        {b.icon}
                      </span>
                      <div>
                        <h2 className="text-base font-semibold text-white">{b.title}</h2>
                        <p className="mt-1 max-w-sm text-sm leading-relaxed text-brand-100">{b.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <figure className="mt-8 rounded-xl bg-white/10 p-5 ring-1 ring-white/15">
                  <Quote className="h-5 w-5 text-white/40" />
                  <blockquote className="mt-2 text-base leading-relaxed text-white/90">
                    Trovework helped me find amazing clients and grow my business with confidence.
                  </blockquote>
                  <figcaption className="mt-4 flex items-center gap-3">
                    <Portrait src={PEOPLE.ahmed.photo} sizes="36px" className="h-9 w-9 ring-2 ring-white/20" />
                    <div>
                      <p className="text-base font-semibold text-white">{PEOPLE.ahmed.name}</p>
                      <p className="text-sm text-brand-100">{PEOPLE.ahmed.role}</p>
                    </div>
                  </figcaption>
                </figure>
              </div>
            </div>

            {/* right — the form, in its own bordered panel */}
            <div className="flex items-center bg-slate-50/70 p-6 sm:p-7 lg:p-8">
              <div className="w-full rounded-2xl border border-slate-200 bg-white p-10 shadow-sm sm:p-12">
                <h2 className="text-2xl font-bold tracking-tight text-navy-800 sm:text-3xl lg:text-4xl">
                  Create your account
                </h2>
                <p className="mt-3 text-base leading-relaxed text-slate-500 lg:text-lg">
                  Join thousands of professionals and businesses
                  <br />
                  building great things together.
                </p>
                <div className="mt-6">
                  <RegisterForm defaultRole={defaultRole} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
