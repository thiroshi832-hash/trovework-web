import Image from "next/image";
import Link from "next/link";

/* ================================ icons ================================= */

type IconProps = { className?: string };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function ShieldCheck({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 3 5 5.6v5c0 4.3 3 8.3 7 9.6 4-1.3 7-5.3 7-9.6v-5L12 3Z" {...stroke} />
      <path d="m9 11.8 2.1 2.1L15.2 9.7" {...stroke} strokeWidth={1.9} />
    </svg>
  );
}

function Lock({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="4.8" y="10.5" width="14.4" height="9.7" rx="2.2" {...stroke} />
      <path d="M8.2 10.5V7.9a3.8 3.8 0 0 1 7.6 0v2.6" {...stroke} />
    </svg>
  );
}

function ChatBubble({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M5 5h14a1.9 1.9 0 0 1 1.9 1.9v7.6A1.9 1.9 0 0 1 19 16.4H9.6L5.6 19.6V6.9A1.9 1.9 0 0 1 7.5 5Z" {...stroke} />
    </svg>
  );
}

function Gift({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="4" y="9.5" width="16" height="10.5" rx="1.6" {...stroke} />
      <path d="M4 13.2h16M12 9.5V20" {...stroke} />
      <path d="M12 9.5S10.8 5 8.6 5a2 2 0 0 0 0 4.5Zm0 0S13.2 5 15.4 5a2 2 0 0 1 0 4.5Z" {...stroke} />
    </svg>
  );
}

function Check({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="m5 12.5 4.5 4.5L19 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Star({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 3.6l2.5 5.1 5.6.8-4.1 4 1 5.6-5-2.6-5 2.6 1-5.6-4.1-4 5.6-.8L12 3.6Z" />
    </svg>
  );
}

function Globe({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="8.2" {...stroke} />
      <path d="M3.8 12h16.4M12 3.8c2.1 2.2 3.2 5.1 3.2 8.2S14.1 18 12 20.2C9.9 18 8.8 15.1 8.8 12S9.9 6 12 3.8Z" {...stroke} />
    </svg>
  );
}

function Users({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="9" cy="8.4" r="3.2" {...stroke} />
      <path d="M3.4 19.2a5.8 5.8 0 0 1 11.2 0M16.2 5.6a3.1 3.1 0 0 1 0 5.7M17.6 19.2a5.6 5.6 0 0 0-1.9-4" {...stroke} />
    </svg>
  );
}

function Building({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="5" y="4" width="9.5" height="16" rx="1.4" {...stroke} />
      <path d="M14.5 9.5H19v10.5M8 8h3.5M8 11.5h3.5M8 15h3.5" {...stroke} />
    </svg>
  );
}

function ChevronDown({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="m6.5 9.5 5.5 5.5 5.5-5.5" {...stroke} strokeWidth={1.9} />
    </svg>
  );
}

function ArrowRight({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M4.5 12h15m-5.6-5.6L19.5 12l-5.6 5.6" {...stroke} strokeWidth={1.8} />
    </svg>
  );
}

function Quote({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M9.4 5.5c-3 1.6-4.7 4.1-4.7 7.4v5.6h6.2v-6H7.6c0-2 .8-3.4 2.6-4.4l-.8-2.6Zm9.3 0c-3 1.6-4.7 4.1-4.7 7.4v5.6h6.2v-6h-3.3c0-2 .8-3.4 2.6-4.4l-.8-2.6Z" />
    </svg>
  );
}

/* category glyphs */
function Sparkle({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 4.2 13.6 9l4.8 1.6-4.8 1.6L12 17l-1.6-4.8L5.6 10.6 10.4 9 12 4.2Z" {...stroke} />
    </svg>
  );
}
function Broom({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M15.5 4.5 9.8 10.2M13.2 12.6 7.4 18.4a2.3 2.3 0 0 1-3.2 0 2.3 2.3 0 0 1 0-3.2l5.8-5.8M9.4 8.6l6 6" {...stroke} />
      <path d="M14.4 7.6 17 5a1.9 1.9 0 0 1 2.7 2.7l-2.6 2.6" {...stroke} />
    </svg>
  );
}
function Wrench({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M15.6 4.4a4.6 4.6 0 0 0-5.9 5.7l-5 5a2 2 0 0 0 2.8 2.8l5-5a4.6 4.6 0 0 0 5.7-5.9l-2.6 2.6-2.3-.4-.4-2.3 2.7-2.5Z" {...stroke} />
    </svg>
  );
}
function Book({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M4.5 5.2h5a2.6 2.6 0 0 1 2.5 2.6v11a2 2 0 0 0-2-2H4.5V5.2Zm15 0h-5A2.6 2.6 0 0 0 12 7.8v11a2 2 0 0 1 2-2h5.5V5.2Z" {...stroke} />
    </svg>
  );
}
function Truck({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M3.5 6.5h9.2v9.8H3.5zM12.7 10h3.6l3.2 3v3.3h-6.8z" {...stroke} />
      <circle cx="7" cy="17.6" r="1.7" {...stroke} />
      <circle cx="16.4" cy="17.6" r="1.7" {...stroke} />
    </svg>
  );
}
function Code({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="m8.6 8.4-4 3.6 4 3.6m6.8-7.2 4 3.6-4 3.6M13.4 5.8l-2.8 12.4" {...stroke} />
    </svg>
  );
}
function Pen({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M15.6 4.9 19.1 8.4 8.7 18.8l-4.4.9.9-4.4L15.6 4.9Z" {...stroke} />
      <path d="m13.6 6.9 3.5 3.5" {...stroke} />
    </svg>
  );
}
function Dots({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <circle cx="6.5" cy="12" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="17.5" cy="12" r="1.7" />
    </svg>
  );
}

/* social */
function SocialIcon({ path, label }: { path: string; label: string }) {
  return (
    <a
      href="#"
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
        <path d={path} />
      </svg>
    </a>
  );
}

/* ============================== primitives ============================== */

function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Image src="/logo-mark.png" alt="" width={32} height={32} className="h-8 w-8" priority />
      <span className={`text-xl font-bold tracking-tight ${dark ? "text-white" : "text-navy-800"}`}>
        Trovework
      </span>
    </Link>
  );
}

function Avatar({ initials, className = "" }: { initials: string; className?: string }) {
  return (
    <span
      className={`grid place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 font-semibold text-white ${className}`}
    >
      {initials}
    </span>
  );
}

function Stars({ rating, className = "" }: { rating: number; className?: string }) {
  return (
    <span className={`flex items-center gap-0.5 text-amber-400 ${className}`} aria-label={`${rating} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(rating) ? "" : "text-slate-200"}`} />
      ))}
    </span>
  );
}

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

const FOOTER_LINKS = [
  { heading: "For Clients", links: ["Browse Freelancers", "How It Works", "Safety & Trust", "Help Center"] },
  { heading: "For Freelancers", links: ["Create Profile", "How It Works", "Freelancer Tips", "Community"] },
  { heading: "Company", links: ["About Us", "Blog", "Careers", "Contact Us"] },
  { heading: "Legal", links: ["Terms of Service", "Privacy Policy", "Cookie Policy", "Acceptable Use"] },
];

const SOCIALS = [
  { label: "X", path: "M18.9 3H21l-6.6 7.5L22 21h-6l-4.7-6.1L5.9 21H3.8l7-8L2.4 3h6.2l4.2 5.6L18.9 3Zm-1 16.2h1.2L8.2 4.7H6.9l10 14.5Z" },
  { label: "LinkedIn", path: "M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05A4.2 4.2 0 0 1 17.6 8.7c4 0 4.7 2.6 4.7 6V21h-4v-5.5c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9V21h-4V9Z" },
  { label: "Facebook", path: "M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6A22 22 0 0 0 14.3 3.5c-2.4 0-4 1.45-4 4.1v2.3H7.6V13h2.7v8h3.2Z" },
  { label: "Instagram", path: "M12 7.4a4.6 4.6 0 1 0 0 9.2 4.6 4.6 0 0 0 0-9.2Zm0 7.6a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm5.9-7.8a1.07 1.07 0 1 1-2.15 0 1.07 1.07 0 0 1 2.15 0ZM12 4.6c2.4 0 2.7 0 3.6.05.9.04 1.5.18 2 .38.55.2 1 .5 1.45.95.45.45.75.9.95 1.45.2.5.34 1.1.38 2 .04.9.05 1.2.05 3.6s0 2.7-.05 3.6c-.04.9-.18 1.5-.38 2a4 4 0 0 1-.95 1.45c-.45.45-.9.75-1.45.95-.5.2-1.1.34-2 .38-.9.04-1.2.05-3.6.05s-2.7 0-3.6-.05c-.9-.04-1.5-.18-2-.38a4 4 0 0 1-1.45-.95 4 4 0 0 1-.95-1.45c-.2-.5-.34-1.1-.38-2C4.6 14.7 4.6 14.4 4.6 12s0-2.7.05-3.6c.04-.9.18-1.5.38-2 .2-.55.5-1 .95-1.45A4 4 0 0 1 7.43 4c.5-.2 1.1-.34 2-.38.9-.04 1.2-.05 3.6-.05Z" },
];

/* ================================== page ================================= */

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-white">
      {/* ------------------------------ header ----------------------------- */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3.5">
          <Logo />

          <div className="hidden items-center gap-7 text-sm font-medium text-slate-600 lg:flex">
            <button type="button" className="flex items-center gap-1 hover:text-navy-800">
              Browse Freelancers
              <ChevronDown className="h-4 w-4" />
            </button>
            <a href="#how" className="hover:text-navy-800">How It Works</a>
            <a href="#about" className="hover:text-navy-800">About Us</a>
            <a href="#trust" className="hover:text-navy-800">Safety &amp; Trust</a>
            <a href="#blog" className="hover:text-navy-800">Blog</a>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" className="hidden items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-navy-800 md:flex">
              <Globe className="h-4 w-4" />
              English
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <Link href="/login" className="hidden text-sm font-medium text-slate-600 hover:text-navy-800 sm:block">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Sign up
            </Link>
          </div>
        </nav>
      </header>

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

      {/* ------------------------------ footer ----------------------------- */}
      <footer className="bg-navy-800 text-slate-300">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
            <div>
              <Logo dark />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
                A trust-first global freelance marketplace. Connect, collaborate, and get work done
                with confidence.
              </p>
              <div className="mt-5 flex gap-2.5">
                {SOCIALS.map((s) => (
                  <SocialIcon key={s.label} path={s.path} label={s.label} />
                ))}
              </div>
            </div>

            {FOOTER_LINKS.map((col) => (
              <div key={col.heading}>
                <h3 className="text-sm font-semibold text-white">{col.heading}</h3>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}>
                      <Link href="#" className="text-sm text-slate-400 transition hover:text-white">
                        {l}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Trovework. All rights reserved.</p>
            <p>Made with ❤️ for a better freelance world.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
