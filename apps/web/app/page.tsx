import Link from "next/link";
import { Avatar, Stars } from "@/components/brand";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  ArrowRight,
  Book,
  Broom,
  ChatBubble,
  Check,
  Code,
  Dots,
  Gift,
  Globe,
  Lock,
  Pen,
  Quote,
  ShieldCheck,
  Sparkle,
  Star,
  Truck,
  Users,
  Wrench,
  Building,
} from "@/components/icons";

function SectionHeading({
  title,
  action,
  href = "#",
}: {
  title: string;
  action?: string;
  href?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 className="text-2xl font-bold tracking-tight text-navy-800 sm:text-3xl">{title}</h2>
      {action ? (
        <Link href={href} className="group hidden shrink-0 items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 sm:flex">
          {action}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  );
}

/* ================================= data ================================= */

const TRUST_ITEMS = [
  { icon: <ShieldCheck className="h-5 w-5" />, title: "ID Verified Community", body: "Every user is verified to build trust and safety." },
  { icon: <Lock className="h-5 w-5" />, title: "Safe & Secure", body: "Your data and conversations are always protected." },
  { icon: <ChatBubble className="h-5 w-5" />, title: "Direct Communication", body: "Chat directly with verified users. No middlemen." },
  { icon: <Gift className="h-5 w-5" />, title: "Free to Use", body: "Join, connect, and grow without any fees." },
];

// Categories span in-person trades as well as digital work — Trovework is for
// freelancers in any field, not only tech.
const CATEGORIES = [
  { icon: <Broom className="h-6 w-6" />, name: "Home & Cleaning" },
  { icon: <Wrench className="h-6 w-6" />, name: "Repairs & Trades" },
  { icon: <Book className="h-6 w-6" />, name: "Tutoring & Care" },
  { icon: <Truck className="h-6 w-6" />, name: "Driving & Delivery" },
  { icon: <Code className="h-6 w-6" />, name: "Web Development" },
  { icon: <Pen className="h-6 w-6" />, name: "Design & Creative" },
  { icon: <Sparkle className="h-6 w-6" />, name: "Writing & Marketing" },
  { icon: <Dots className="h-6 w-6" />, name: "More Categories", muted: true },
];

const STEPS = [
  { title: "Create an account", body: "Sign up as a client or freelancer in just a few steps." },
  { title: "Get verified", body: "Verify your phone and ID to unlock all features." },
  { title: "Connect & work", body: "Find the right person, start a chat, and get work done." },
];

const STATS = [
  { icon: <Users className="h-6 w-6" />, value: "15K+", label: "Verified Freelancers" },
  { icon: <Building className="h-6 w-6" />, value: "8K+", label: "Happy Clients" },
  { icon: <Globe className="h-6 w-6" />, value: "120+", label: "Countries" },
  { icon: <Star className="h-6 w-6" />, value: "98%", label: "Positive Reviews" },
];

const FREELANCERS = [
  { initials: "MR", name: "Marisol R.", title: "Home & Office Cleaner", rating: 5.0, reviews: 32, skills: ["Deep cleaning", "Move-out"], rate: "$28" },
  { initials: "AM", name: "Alex Morgan", title: "Full Stack Developer", rating: 5.0, reviews: 22, skills: ["React", "Node.js"], rate: "$40" },
  { initials: "TO", name: "Tomás O.", title: "Electrician", rating: 4.8, reviews: 41, skills: ["Rewiring", "Callouts"], rate: "$45" },
  { initials: "PS", name: "Priya S.", title: "Maths Tutor", rating: 4.9, reviews: 27, skills: ["GCSE", "A-Level"], rate: "$30" },
  { initials: "DK", name: "Daniel Kim", title: "Content Writer", rating: 4.8, reviews: 19, skills: ["SEO", "Blogs"], rate: "$20" },
];

const TESTIMONIALS = [
  { quote: "Trovework made it easy to find people I can trust. The verification gives me peace of mind.", initials: "SJ", name: "Sarah J.", role: "Homeowner" },
  { quote: "As a cleaner, I love working with serious clients here. The platform is clean, safe, and easy to use.", initials: "MT", name: "Maria T.", role: "Professional Cleaner" },
  { quote: "I found a long-term electrician within days. Communication is smooth and everything just works.", initials: "JL", name: "Jessica L.", role: "Property Manager" },
];

const POSTS = [
  { tag: "TIPS", tone: "bg-brand-600", title: "How to Hire the Right Freelancer for Your Project", excerpt: "A practical guide to finding the right person and getting great results.", date: "Aug 15, 2026", read: "5 min read" },
  { tag: "SAFETY", tone: "bg-emerald-600", title: "Why ID Verification Matters in Freelancing", excerpt: "Building a safer marketplace for everyone through trust and verification.", date: "Aug 8, 2026", read: "4 min read" },
  { tag: "GUIDES", tone: "bg-amber-500", title: "Working Well Together: Best Practices", excerpt: "Tips to communicate better and deliver successful projects.", date: "Aug 1, 2026", read: "6 min read" },
];



/* ================================== page ================================= */

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-white">
      <SiteHeader />

      <main className="flex-1">
        {/* ------------------------------- hero ---------------------------- */}
        <section className="relative overflow-hidden bg-white">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-14 lg:grid-cols-2 lg:gap-10 lg:py-20">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-700 ring-1 ring-brand-100">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-brand-600 text-white">
                  <Check className="h-2.5 w-2.5" />
                </span>
                A trust-first freelance marketplace
              </span>

              <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-navy-800 sm:text-5xl xl:text-6xl">
                Hire trusted freelancers.
                <br />
                Get work <span className="text-brand-600">done</span>.
              </h1>

              <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600">
                Trovework connects verified freelancers with clients worldwide — from cleaning and
                trades to tutoring and design. Every user is ID-verified so you can collaborate with
                confidence.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup?role=client"
                  className="rounded-lg bg-brand-600 px-7 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                  I&apos;m a Client
                </Link>
                <Link
                  href="/signup?role=freelancer"
                  className="rounded-lg bg-white px-7 py-3 text-center text-sm font-semibold text-brand-600 ring-1 ring-brand-200 transition hover:bg-brand-50"
                >
                  I&apos;m a Freelancer
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <div className="flex -space-x-2">
                  {["AL", "BK", "CR", "DM", "EN"].map((i) => (
                    <Avatar key={i} initials={i} className="h-9 w-9 text-[10px] ring-2 ring-white" />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Stars rating={5} />
                    <span className="text-sm font-semibold text-navy-800">4.9 out of 5</span>
                  </div>
                  <p className="text-xs text-slate-500">Trusted by thousands of users worldwide</p>
                </div>
              </div>
            </div>

            {/* Hero visual — placeholder composition; swap for brand photography */}
            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-brand-100 via-brand-50 to-white ring-1 ring-brand-100">
                <div className="absolute -right-10 -top-10 h-52 w-52 rounded-full bg-brand-200/50 blur-2xl" />
                <div className="absolute bottom-6 left-6 h-40 w-40 rounded-full bg-brand-300/30 blur-2xl" />

                {/* mock profile card */}
                <div className="absolute left-1/2 top-1/2 w-[74%] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-4 shadow-lg ring-1 ring-slate-200/70">
                  <div className="flex items-center gap-3">
                    <Avatar initials="MR" className="h-11 w-11 text-sm" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-semibold text-navy-800">Marisol R.</span>
                        <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
                          <Check className="h-2.5 w-2.5" />
                        </span>
                      </div>
                      <p className="truncate text-xs text-slate-500">Home &amp; Office Cleaner</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <div className="h-2 w-full rounded bg-slate-100" />
                    <div className="h-2 w-4/5 rounded bg-slate-100" />
                    <div className="h-2 w-2/3 rounded bg-slate-100" />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <Stars rating={5} />
                    <span className="text-sm font-bold text-navy-800">
                      $28<span className="text-xs font-medium text-slate-400">/hr</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* floating verified card */}
              <div className="absolute -bottom-5 right-4 w-56 rounded-xl bg-white p-4 shadow-xl ring-1 ring-slate-200/70 sm:right-6">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-white">
                  <Check className="h-5 w-5" />
                </span>
                <p className="mt-2.5 text-sm font-semibold text-navy-800">ID Verified Community</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  All users are ID-verified for a safe and trusted environment.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------- trust bar --------------------------- */}
        <section id="trust" className="mx-auto max-w-7xl px-6 pb-4 pt-10">
          <div className="grid gap-8 rounded-2xl border border-slate-200 bg-white px-8 py-8 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_ITEMS.map((t) => (
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

        {/* ---------------------------- categories -------------------------- */}
        <section id="categories" className="mx-auto max-w-7xl px-6 py-14">
          <SectionHeading title="Popular Categories" action="View all categories" />
          <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            {CATEGORIES.map((c) => (
              <Link
                key={c.name}
                href="/search"
                className="group flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-6 text-center transition hover:border-brand-300 hover:shadow-sm"
              >
                <span className={`${c.muted ? "text-slate-400" : "text-brand-600"} transition group-hover:scale-105`}>
                  {c.icon}
                </span>
                <span className="text-xs font-medium leading-tight text-navy-800">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* --------------------------- how it works ------------------------- */}
        <section id="how" className="bg-slate-50/70 py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-navy-800 sm:text-3xl">How It Works</h2>
              <p className="mt-2 text-sm text-slate-500">Get started in three simple steps</p>
            </div>

            <div className="relative mt-12">
              {/* connector */}
              <div className="absolute left-[16.6%] right-[16.6%] top-4 hidden h-px bg-brand-200 lg:block" />
              <div className="grid gap-10 lg:grid-cols-3">
                {STEPS.map((s, i) => (
                  <div key={s.title} className="relative flex flex-col items-center text-center">
                    <span className="relative z-10 grid h-8 w-8 place-items-center rounded-full border border-brand-200 bg-white text-sm font-semibold text-brand-600">
                      {i + 1}
                    </span>
                    <div className="mt-6 flex h-36 w-full max-w-xs items-center justify-center rounded-xl border border-slate-200 bg-white p-5">
                      <div className="w-full space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-brand-100" />
                          <span className="h-2 w-20 rounded bg-slate-100" />
                        </div>
                        <div className="h-2 w-full rounded bg-slate-100" />
                        <div className="h-2 w-4/5 rounded bg-slate-100" />
                        <div className="h-2 w-3/5 rounded bg-slate-100" />
                      </div>
                    </div>
                    <h3 className="mt-5 font-semibold text-navy-800">{s.title}</h3>
                    <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-slate-500">{s.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------ stats ----------------------------- */}
        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 rounded-2xl bg-brand-600 px-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="flex items-center justify-center gap-3.5 text-white">
                <span className="text-brand-200">{s.icon}</span>
                <div>
                  <p className="text-2xl font-bold leading-none">{s.value}</p>
                  <p className="mt-1 text-xs text-brand-100">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------ featured freelancers -------------------- */}
        <section className="mx-auto max-w-7xl px-6 py-10">
          <SectionHeading title="Featured Freelancers" action="View all freelancers" href="/search" />
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {FREELANCERS.map((f) => (
              <article
                key={f.name}
                className="relative rounded-xl border border-slate-200 bg-white p-5 text-center transition hover:shadow-md"
              >
                <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-brand-50 text-brand-600">
                  <Check className="h-3 w-3" />
                </span>
                <Avatar initials={f.initials} className="mx-auto h-16 w-16 text-base" />
                <div className="mt-3 flex items-center justify-center gap-1.5">
                  <h3 className="font-semibold text-navy-800">{f.name}</h3>
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-brand-600 text-white">
                    <Check className="h-2.5 w-2.5" />
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">{f.title}</p>
                <div className="mt-2 flex items-center justify-center gap-1.5">
                  <Stars rating={f.rating} />
                  <span className="text-xs text-slate-500">
                    {f.rating.toFixed(1)} ({f.reviews})
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                  {f.skills.map((s) => (
                    <span key={s} className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                      {s}
                    </span>
                  ))}
                </div>
                <p className="mt-4 border-t border-slate-100 pt-3 text-left text-lg font-bold text-navy-800">
                  {f.rate}
                  <span className="text-xs font-medium text-slate-400"> /hr</span>
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* --------------------------- testimonials ------------------------- */}
        <section className="mx-auto max-w-7xl px-6 py-14">
          <h2 className="text-center text-2xl font-bold tracking-tight text-navy-800 sm:text-3xl">
            What Our Users Say
          </h2>
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="rounded-xl border border-slate-200 bg-white p-6">
                <Quote className="h-6 w-6 text-brand-200" />
                <blockquote className="mt-3 text-sm leading-relaxed text-slate-600">{t.quote}</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <Avatar initials={t.initials} className="h-9 w-9 text-[11px]" />
                  <div>
                    <p className="text-sm font-semibold text-navy-800">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* ------------------------------- CTA ------------------------------ */}
        <section className="mx-auto max-w-7xl px-6 py-8">
          <div className="relative overflow-hidden rounded-2xl bg-brand-600 px-8 py-14 text-center">
            <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
            <div className="relative">
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Join a global community built on trust
              </h2>
              <p className="mt-3 text-sm text-brand-100">
                Create your free account today and start connecting.
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/signup?role=client"
                  className="rounded-lg bg-white px-7 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                >
                  I&apos;m a Client
                </Link>
                <Link
                  href="/signup?role=freelancer"
                  className="rounded-lg bg-brand-700 px-7 py-3 text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-brand-800"
                >
                  I&apos;m a Freelancer
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------- blog ----------------------------- */}
        <section id="blog" className="mx-auto max-w-7xl px-6 py-14">
          <SectionHeading title="Latest from the Blog" action="View all articles" href="/blog" />
          <div className="mt-7 grid gap-6 md:grid-cols-3">
            {POSTS.map((p) => (
              <article key={p.title} className="group overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="relative aspect-[16/9] bg-gradient-to-br from-brand-100 via-brand-50 to-slate-100">
                  <div className="absolute inset-0 grid place-items-center text-brand-300">
                    <ShieldCheck className="h-12 w-12" />
                  </div>
                  <span className={`absolute bottom-3 left-3 rounded px-2 py-0.5 text-[10px] font-bold tracking-wide text-white ${p.tone}`}>
                    {p.tag}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold leading-snug text-navy-800 group-hover:text-brand-600">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{p.excerpt}</p>
                  <p className="mt-4 text-xs text-slate-400">
                    {p.date} &nbsp;•&nbsp; {p.read}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
