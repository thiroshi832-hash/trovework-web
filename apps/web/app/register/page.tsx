import type { Metadata } from "next";
import { Avatar } from "@/components/brand";
import { RegisterForm } from "@/components/register-form";
import { SiteHeader } from "@/components/site-header";
import { SlimFooter } from "@/components/site-footer";
import {
  ChatBubble,
  Gift,
  Headset,
  Lock,
  Quote,
  ShieldCheck,
  UserIcon,
  Users,
} from "@/components/icons";
import type { Role } from "@/components/auth-fields";

export const metadata: Metadata = {
  title: "Create your account — Trovework",
  description:
    "Join Trovework, the trust-first freelance marketplace where every user is ID-verified. Free to join, for work of every kind.",
};

const BENEFITS = [
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "ID-verified community",
    body: "Every user is verified to build a safer, more trustworthy marketplace.",
  },
  {
    icon: <ChatBubble className="h-5 w-5" />,
    title: "Safe communication",
    body: "Message, share files and collaborate securely within Trovework.",
  },
  {
    icon: <Gift className="h-5 w-5" />,
    title: "Free to use",
    body: "Create your account and explore opportunities at no cost.",
  },
];

const STEPS = [
  { icon: <UserIcon className="h-6 w-6" />, title: "Create account", body: "Sign up in minutes and tell us about yourself." },
  { icon: <ShieldCheck className="h-6 w-6" />, title: "Verify phone and ID", body: "Confirm your identity to build trust and safety." },
  { icon: <Users className="h-6 w-6" />, title: "Start connecting", body: "Explore opportunities and start collaborating." },
];

const SAFETY = [
  { icon: <Lock className="h-5 w-5" />, title: "Secure & private", body: "Your data is encrypted and never shared." },
  { icon: <ShieldCheck className="h-5 w-5" />, title: "Identity verification", body: "We verify real people to prevent fraud." },
  { icon: <ChatBubble className="h-5 w-5" />, title: "Direct communication", body: "Talk to verified users with no middlemen." },
  { icon: <Headset className="h-5 w-5" />, title: "24/7 support", body: "Our team is here to help you anytime." },
];

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const defaultRole: Role = role === "freelancer" ? "freelancer" : "client";

  return (
    <div className="flex min-h-full flex-col bg-slate-50/60">
      <SiteHeader variant="register" tagline navItems={3} />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-8">
          {/* ------------------------- split card ------------------------- */}
          <div className="grid overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 lg:grid-cols-2">
            {/* left — value proposition */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-navy-900 p-9 lg:p-11">
              <div className="pointer-events-none absolute inset-0 opacity-[0.15] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
              <div className="pointer-events-none absolute -right-16 top-10 h-64 w-64 rounded-full border border-white/10" />
              <div className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full border border-white/10" />

              <div className="relative">
                <h1 className="text-3xl font-bold leading-tight tracking-tight text-white lg:text-4xl">
                  Join a trusted global freelance marketplace
                </h1>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-brand-100">
                  Trovework connects verified clients and freelancers to get work done — safely,
                  smoothly, and successfully.
                </p>

                <ul className="mt-9 space-y-6">
                  {BENEFITS.map((b) => (
                    <li key={b.title} className="flex gap-4">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/20">
                        {b.icon}
                      </span>
                      <div>
                        <h2 className="text-sm font-semibold text-white">{b.title}</h2>
                        <p className="mt-1 max-w-xs text-xs leading-relaxed text-brand-100">{b.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <figure className="mt-10 rounded-xl bg-white/10 p-5 ring-1 ring-white/15">
                  <Quote className="h-5 w-5 text-white/40" />
                  <blockquote className="mt-2 text-sm leading-relaxed text-white/90">
                    Trovework helped me find amazing clients and grow my business with confidence.
                  </blockquote>
                  <figcaption className="mt-4 flex items-center gap-3">
                    <Avatar initials="AR" className="h-9 w-9 text-[11px] ring-2 ring-white/20" />
                    <div>
                      <p className="text-sm font-semibold text-white">Ahmed R.</p>
                      <p className="text-xs text-brand-100">Freelance Web Developer</p>
                    </div>
                  </figcaption>
                </figure>
              </div>
            </div>

            {/* right — the form */}
            <div className="p-8 sm:p-10 lg:p-12">
              <div className="mx-auto max-w-md">
                <h2 className="text-2xl font-bold tracking-tight text-navy-800 sm:text-3xl">
                  Create your account
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Join thousands of professionals and businesses building great things together.
                </p>
                <div className="mt-6">
                  <RegisterForm defaultRole={defaultRole} />
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------ how sign-up works ------------------- */}
          <section className="mt-8 rounded-2xl bg-white p-9 ring-1 ring-slate-200">
            <h2 className="text-center text-xl font-bold tracking-tight text-navy-800">
              How sign-up works
            </h2>
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <div key={s.title} className="flex items-start gap-4">
                  <span className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                    {s.icon}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                        {i + 1}
                      </span>
                      <h3 className="text-sm font-semibold text-navy-800">{s.title}</h3>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* --------------------------- safety --------------------------- */}
          <section className="mt-6 rounded-2xl bg-white p-9 ring-1 ring-slate-200">
            <h2 className="text-center text-xl font-bold tracking-tight text-navy-800">
              Your safety and privacy come first
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {SAFETY.map((f) => (
                <div key={f.title} className="flex gap-3.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                    {f.icon}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-navy-800">{f.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{f.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <SlimFooter />
    </div>
  );
}
