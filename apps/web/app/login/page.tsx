import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/brand";
import { LoginForm } from "@/components/login-form";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  ChatBubble,
  Check,
  Gift,
  Globe,
  Headset,
  Lock,
  Quote,
  ShieldCheck,
  Users,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Sign in — Trovework",
  description:
    "Sign in to Trovework to connect with verified freelancers and clients, and get work done with confidence.",
};

const BENEFITS = [
  { icon: <ShieldCheck className="h-5 w-5" />, title: "Trust First", body: "Every user is ID-verified so you can collaborate safely." },
  { icon: <ChatBubble className="h-5 w-5" />, title: "Direct Communication", body: "Chat directly with verified users. No middlemen." },
  { icon: <Globe className="h-5 w-5" />, title: "Global Community", body: "Hire and work with talent from 120+ countries." },
  { icon: <Lock className="h-5 w-5" />, title: "Privacy & Security", body: "Your data and conversations are always protected." },
];

const STRIP = [
  { icon: <ShieldCheck className="h-5 w-5" />, title: "ID Verified Community", body: "All users are verified for a safe environment." },
  { icon: <Users className="h-5 w-5" />, title: "Work Your Way", body: "Find projects, offer services, and grow your business." },
  { icon: <Gift className="h-5 w-5" />, title: "Free to Use", body: "Join, connect, and grow without any fees." },
  { icon: <Headset className="h-5 w-5" />, title: "24/7 Support", body: "We're here to help whenever you need us." },
];

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-col bg-white">
      <SiteHeader variant="login" navItems={5} />

      <main className="flex-1">
        <div className="grid lg:grid-cols-2">
          {/* ------------------------- left panel ------------------------- */}
          <div className="bg-gradient-to-b from-brand-50 to-slate-50 px-6 py-14 lg:px-14">
            <div className="mx-auto max-w-md">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-navy-800 sm:text-4xl">
                Welcome back to
                <br />
                <span className="text-brand-600">Trovework</span>
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                Sign in to connect with verified freelancers and get work done with confidence.
              </p>

              <ul className="mt-9 space-y-6">
                {BENEFITS.map((b) => (
                  <li key={b.title} className="flex gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-brand-600 ring-1 ring-brand-100">
                      {b.icon}
                    </span>
                    <div>
                      <h2 className="text-sm font-semibold text-navy-800">{b.title}</h2>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">{b.body}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <figure className="mt-9 rounded-xl border border-slate-200 bg-white p-5">
                <Quote className="h-5 w-5 text-brand-200" />
                <blockquote className="mt-2 text-sm leading-relaxed text-slate-600">
                  Trovework helps me find amazing talent with confidence. The verification gives me
                  peace of mind.
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  <Avatar initials="SJ" className="h-9 w-9 text-[11px]" />
                  <div>
                    <p className="text-sm font-semibold text-navy-800">Sarah J.</p>
                    <p className="text-xs text-slate-500">Marketing Manager</p>
                  </div>
                </figcaption>
              </figure>

              {/* verified-network illustration */}
              <div className="relative mt-10 h-32">
                <div className="absolute left-1/2 top-1/2 h-24 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-brand-200" />
                <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg">
                  <Check className="h-8 w-8" />
                </span>
                {[
                  { i: "AK", pos: "left-2 top-3" },
                  { i: "BM", pos: "right-4 top-0" },
                  { i: "CJ", pos: "left-8 bottom-2" },
                  { i: "DP", pos: "right-2 bottom-4" },
                ].map((a) => (
                  <Avatar key={a.i} initials={a.i} className={`absolute ${a.pos} h-9 w-9 text-[10px] ring-2 ring-white`} />
                ))}
              </div>
            </div>
          </div>

          {/* ------------------------- right panel ------------------------ */}
          <div className="flex items-center justify-center px-6 py-14 lg:px-14">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 sm:p-10">
              <h2 className="text-2xl font-bold tracking-tight text-navy-800">
                Sign in to your account
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-semibold text-brand-600 hover:underline">
                  Sign up
                </Link>
              </p>
              <div className="mt-7">
                <LoginForm />
              </div>
            </div>
          </div>
        </div>

        {/* --------------------------- trust strip -------------------------- */}
        <section className="mx-auto max-w-7xl px-6 py-10">
          <div className="grid gap-8 rounded-2xl border border-slate-200 bg-white px-8 py-8 sm:grid-cols-2 lg:grid-cols-4">
            {STRIP.map((t) => (
              <div key={t.title} className="flex gap-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                  {t.icon}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-navy-800">{t.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{t.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter newsletter />
    </div>
  );
}
