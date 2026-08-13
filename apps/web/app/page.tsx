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

function StarOutline({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 3.6l2.5 5.1 5.6.8-4.1 4 1 5.6-5-2.6-5 2.6 1-5.6-4.1-4 5.6-.8L12 3.6Z" {...stroke} />
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

function UserPlus({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="10" cy="8.6" r="3.4" {...stroke} />
      <path d="M4.2 19.4a5.8 5.8 0 0 1 11.6 0" {...stroke} />
      <path d="M18.4 8.4v4.4M20.6 10.6h-4.4" {...stroke} strokeWidth={1.9} />
    </svg>
  );
}

function UserGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <circle cx="12" cy="8.4" r="3.6" />
      <path d="M4.8 20.4a7.2 7.2 0 0 1 14.4 0Z" />
    </svg>
  );
}

/* category glyphs — traced from the comp's icon row */

/* an open ring holding a dot and a slash — the comp's dev/code mark */
function CodeCircle({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M15.5 4.6A8.2 8.2 0 1 1 8.5 4.6" {...stroke} />
      <circle cx="9.7" cy="12.3" r="1.15" fill="currentColor" stroke="none" />
      <path d="M14.9 8.7 12.1 15.5" {...stroke} strokeWidth={1.9} />
    </svg>
  );
}

function Pencil({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M16.1 3.9 20.1 7.9 8.6 19.4l-5.1 1.1 1.1-5.1L16.1 3.9Z" {...stroke} />
      <path d="m13.9 6.1 4 4" {...stroke} />
    </svg>
  );
}

function Document({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M5.2 4.6h9.6L18.8 8.6v10.8H5.2z" {...stroke} />
      <path d="M14.6 4.6v4.2h4.2" {...stroke} />
      <path d="M8.2 11.4h7M8.2 14.2h7M8.2 17h4.4" {...stroke} />
    </svg>
  );
}

function Megaphone({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M17.2 6v12L8.4 15H6.2a1.8 1.8 0 0 1-1.8-1.8v-2.4A1.8 1.8 0 0 1 6.2 9h2.2l8.8-3Z" {...stroke} />
      <path d="M8.4 15v2.8a1.7 1.7 0 0 0 3.4 0V16" {...stroke} />
      <path d="M19.8 9.8a3.4 3.4 0 0 1 0 4.4" {...stroke} />
    </svg>
  );
}

function PlayBox({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="4.2" y="6" width="15.6" height="12" rx="2.6" {...stroke} />
      <path d="m10.6 9.6 4.8 2.4-4.8 2.4V9.6Z" {...stroke} />
    </svg>
  );
}

function AiSpark({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="3.2" {...stroke} />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <path
        d="M12 3.2v2.3M12 18.5v2.3M3.2 12h2.3M18.5 12h2.3M5.8 5.8l1.6 1.6M16.6 16.6l1.6 1.6M18.2 5.8l-1.6 1.6M7.4 16.6l-1.6 1.6"
        {...stroke}
      />
    </svg>
  );
}

function Briefcase({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="3.8" y="7.4" width="16.4" height="11.2" rx="2.2" {...stroke} />
      <path d="M9 7.4V6.2a1.7 1.7 0 0 1 1.7-1.7h2.6A1.7 1.7 0 0 1 15 6.2v1.2" {...stroke} />
      <path d="M3.8 12.2h6.4v1.6h3.6v-1.6h6.4" {...stroke} />
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

/* `dark` means the logo sits on a dark ground, so it uses the light artwork. */
function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="inline-flex shrink-0 items-center">
      <Image
        src={dark ? "/images/logo-light.png" : "/images/logo-dark.png"}
        alt="Trovework"
        width={1124}
        height={258}
        priority
        className="h-11 w-auto"
      />
    </Link>
  );
}

/* Portraits are decorative — the person's name always sits beside them as text. */
function Portrait({
  src,
  className = "",
  sizes = "96px",
}: {
  src: string;
  className?: string;
  sizes?: string;
}) {
  return (
    <span className={`relative block shrink-0 overflow-hidden rounded-full bg-slate-100 ${className}`}>
      <Image src={src} alt="" fill sizes={sizes} className="object-cover" />
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

function VerifiedTick({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-brand-600 text-white ${className}`}>
      <Check className="h-[60%] w-[60%]" />
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

/* The comp's cards: white, hairline ring, very soft lift — not a hard border. */
const CARD = "rounded-xl bg-white shadow-[0_1px_2px_rgba(11,28,56,0.04),0_10px_28px_-16px_rgba(11,28,56,0.18)] ring-1 ring-slate-200/70";

/* ================================= data ================================= */

const TRUST_ITEMS = [
  { icon: <ShieldCheck className="h-6 w-6" />, title: "Verified Community", body: "Every user is verified to build trust and safety." },
  { icon: <Lock className="h-6 w-6" />, title: "Safe & Secure", body: "Your data and conversations are always protected." },
  { icon: <ChatBubble className="h-6 w-6" />, title: "Direct Communication", body: "Chat directly with verified users. No middlemen." },
  { icon: <Gift className="h-6 w-6" />, title: "Free to Use", body: "Join, connect, and grow without any fees." },
];

const CATEGORIES = [
  { icon: <CodeCircle className="h-10 w-10" />, name: "Web Development" },
  { icon: <Pencil className="h-10 w-10" />, name: "Design & Creative" },
  { icon: <Document className="h-10 w-10" />, name: "Writing & Translation" },
  { icon: <Megaphone className="h-10 w-10" />, name: "Marketing" },
  { icon: <PlayBox className="h-10 w-10" />, name: "Video & Animation" },
  { icon: <AiSpark className="h-10 w-10" />, name: "AI Services" },
  { icon: <Briefcase className="h-10 w-10" />, name: "Business" },
  { icon: <Dots className="h-10 w-10" />, name: "More Categories", muted: true },
];

const STEPS = [
  { title: "Create an account", body: "Register as a client or freelancer in just a few steps." },
  { title: "Get verified", body: "Verify your phone and ID to unlock all features." },
  { title: "Connect & work", body: "Find the right person, start a chat, and get work done." },
];

const STATS = [
  { icon: <Users className="h-7 w-7" />, value: "15K+", label: "Verified Freelancers" },
  { icon: <Building className="h-7 w-7" />, value: "8K+", label: "Happy Clients" },
  { icon: <Globe className="h-7 w-7" />, value: "120+", label: "Countries" },
  { icon: <StarOutline className="h-7 w-7" />, value: "98%", label: "Positive Reviews" },
];

const FREELANCERS = [
  { photo: "/avatars/alex-morgan.jpg", name: "Alex Morgan", title: "Full Stack Developer", rating: 5.0, reviews: 22, skills: ["React", "Node.js", "TypeScript"], rate: "$40" },
  { photo: "/avatars/sofia-martinez.jpg", name: "Sofia Martinez", title: "UI/UX Designer", rating: 4.9, reviews: 18, skills: ["Figma", "UI Design", "UX Research"], rate: "$30" },
  { photo: "/avatars/daniel-kim.jpg", name: "Daniel Kim", title: "Content Writer", rating: 4.8, reviews: 17, skills: ["Writing", "SEO", "Blog Writing"], rate: "$20" },
  { photo: "/avatars/olivia-brown.jpg", name: "Olivia Brown", title: "Video Editor", rating: 4.9, reviews: 21, skills: ["Premiere Pro", "After Effects", "DaVinci Resolve"], rate: "$25" },
  { photo: "/avatars/arjun-patel.jpg", name: "Arjun Patel", title: "Digital Marketer", rating: 4.8, reviews: 25, skills: ["SEO", "Google Ads", "Analytics"], rate: "$35" },
];

/* the overlapping faces in the hero's social-proof row */
const COMMUNITY = [1, 2, 3, 4, 5].map((n) => `/avatars/community-${n}.jpg`);

const TESTIMONIALS = [
  { quote: "Trovework made it easy to find amazing talent I can trust. The verification gives me peace of mind.", photo: "/avatars/sarah-j.jpg", name: "Sarah J.", role: "Marketing Manager" },
  { quote: "As a freelancer, I love working with serious clients here. The platform is clean, safe, and easy to use.", photo: "/avatars/michael-t.jpg", name: "Michael T.", role: "Full Stack Developer" },
  { quote: "I found a long-term designer within days. Communication is smooth and everything just works.", photo: "/avatars/jessica-l.jpg", name: "Jessica L.", role: "Startup Founder" },
];

const POSTS = [
  { tag: "TIPS", image: "/design/blog-1.jpg", title: "How to Hire the Right Freelancer for Your Project", excerpt: "A practical guide to finding the perfect freelancer and getting great results.", date: "Aug 15, 2026", read: "5 min read" },
  { tag: "SAFETY", image: "/design/blog-2.jpg", title: "Why Verification Matters in Freelancing", excerpt: "Building a safer marketplace for everyone through trust and verification.", date: "Aug 8, 2026", read: "4 min read" },
  { tag: "GUIDES", image: "/design/blog-3.jpg", title: "Remote Work Best Practices for Clients and Freelancers", excerpt: "Tips to communicate better and deliver successful projects remotely.", date: "Aug 1, 2026", read: "6 min read" },
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

/* ========================= how-it-works artwork ========================== */

const MOCK = "block rounded bg-slate-200/70";

function StepCreateAccount() {
  return (
    <div className="relative w-full max-w-[220px]">
      <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200/80">
        <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-2">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="ml-2 h-1.5 flex-1 rounded bg-slate-200/70" />
        </div>
        <div className="flex gap-2.5 p-3">
          <span className="h-10 w-10 shrink-0 rounded-full bg-slate-200/70" />
          <div className="flex-1 space-y-1.5 pt-1.5">
            <span className={`${MOCK} h-1.5 w-full`} />
            <span className={`${MOCK} h-1.5 w-4/5`} />
            <span className={`${MOCK} h-1.5 w-3/5`} />
          </div>
        </div>
        <div className="flex gap-2 px-3 pb-3">
          <span className="h-4 w-16 rounded bg-slate-100" />
          <span className="h-4 w-10 rounded bg-slate-100" />
        </div>
      </div>
      <span className="absolute -bottom-3 right-3 grid h-11 w-11 place-items-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/25">
        <UserPlus className="h-5 w-5" />
      </span>
    </div>
  );
}

function StepGetVerified() {
  return (
    <div className="relative w-full max-w-[220px]">
      <div className="rounded-lg bg-white p-3.5 shadow-sm ring-1 ring-slate-200/80">
        <div className="flex gap-2.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-brand-100 text-brand-500">
            <UserGlyph className="h-6 w-6" />
          </span>
          <div className="flex-1 space-y-1.5 pt-1.5">
            <span className={`${MOCK} h-1.5 w-full`} />
            <span className={`${MOCK} h-1.5 w-3/4`} />
          </div>
        </div>
        <div className="mt-3.5 space-y-1.5">
          <span className={`${MOCK} h-1.5 w-full`} />
          <span className={`${MOCK} h-1.5 w-5/6`} />
        </div>
      </div>
      <span className="absolute -bottom-3 right-2 grid h-11 w-11 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
        <Check className="h-5 w-5" />
      </span>
    </div>
  );
}

function StepConnectWork() {
  return (
    <div className="w-full max-w-[220px] space-y-3">
      <div className="flex items-center gap-2">
        <Portrait src="/avatars/community-3.jpg" className="h-9 w-9" sizes="36px" />
        <div className="flex-1 rounded-lg rounded-tl-sm bg-white p-3 shadow-sm ring-1 ring-slate-200/80">
          <span className="block h-1.5 w-4/5 rounded bg-brand-400/70" />
        </div>
      </div>
      <div className="flex items-center gap-2 pl-7">
        <div className="flex-1 rounded-lg rounded-tr-sm bg-white p-3 shadow-sm ring-1 ring-slate-200/80">
          <span className="ml-auto block h-1.5 w-3/5 rounded bg-brand-400/70" />
        </div>
        <Portrait src="/avatars/community-2.jpg" className="h-9 w-9" sizes="36px" />
      </div>
    </div>
  );
}

const STEP_ART = [<StepCreateAccount key="1" />, <StepGetVerified key="2" />, <StepConnectWork key="3" />];

/* =============================== hero card =============================== */

function VerifiedCard({ className = "" }: { className?: string }) {
  return (
    <div className={`flex-col justify-center overflow-hidden rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200/60 ${className}`}>
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
        <ShieldCheck className="h-6 w-6" />
      </span>
      <p className="mt-3.5 text-[17px] font-bold leading-snug text-navy-800">
        Verified
        <br />
        Community
      </p>
      <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
        All users are verified for a safe and trusted environment.
      </p>
    </div>
  );
}

/* ================================== page ================================= */

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-white">
      {/* ------------------------------ header ----------------------------- */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-2">
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
              href="/register"
              className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Sign up
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* ------------------------------- hero ---------------------------- */}
        {/*
          The photo is a background layer rather than an <img> so the headline
          can run over its left edge. It starts at 46% and bleeds off the right.
        */}
        <section className="relative overflow-hidden bg-white lg:min-h-[41.67vw]">
          <div
            aria-hidden
            className="absolute inset-y-0 right-0 hidden w-[54%] bg-[url('/images/hero.jpg')] bg-cover bg-[position:38%_center] [-webkit-mask-image:linear-gradient(to_right,transparent,#000_26%)] [mask-image:linear-gradient(to_right,transparent,#000_26%)] lg:block"
          />

          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 py-12 lg:grid-cols-2 lg:py-20">
            {/* the floating card belongs to the container, not the bleeding
                photo — its right edge lines up with the trust bar below */}
            {/* vertical offset tracks the photo (whose height is 41.67vw, set by
                its locked aspect ratio) rather than this container, so the card
                stays on the picture at every desktop width */}
            <VerifiedCard className="absolute right-6 top-[calc(37.1vw_-_256px)] hidden w-[232px] min-h-[256px] lg:flex" />
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-700 ring-1 ring-brand-100">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-brand-600 text-white">
                  <Check className="h-2.5 w-2.5" />
                </span>
                A trust-first freelance marketplace
              </span>

              {/* Two lines, always — the long first line is allowed to run past
                  the column and over the photo rather than wrapping to three. */}
              <h1 className="mt-5 text-[7.2vw] font-bold leading-[1.14] tracking-tight text-navy-800 sm:text-[5.4vw] lg:whitespace-nowrap lg:text-[4vw] xl:text-[51px]">
                Hire trusted freelancers.
                <br />
                Get work{" "}
                <span className="relative inline-block">
                  <span className="text-brand-600">done</span>.
                  <svg
                    viewBox="0 0 100 10"
                    preserveAspectRatio="none"
                    aria-hidden
                    className="absolute -bottom-[0.16em] left-0 h-[0.17em] w-full overflow-visible text-brand-600"
                  >
                    <path
                      d="M1 8.4Q50 0.6 99 5.6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </span>
              </h1>

              <p className="mt-6 max-w-md text-[17px] leading-[1.95] text-slate-600">
                Trovework connects verified freelancers with clients worldwide. Every user is
                verified so you can collaborate with confidence.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register?role=client"
                  className="rounded-lg bg-brand-600 px-8 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                  I&apos;m a Client
                </Link>
                <Link
                  href="/register?role=freelancer"
                  className="rounded-lg bg-white px-8 py-3 text-center text-sm font-semibold text-brand-600 ring-1 ring-brand-300 transition hover:bg-brand-50"
                >
                  I&apos;m a Freelancer
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <div className="flex -space-x-2.5">
                  {COMMUNITY.map((src) => (
                    <Portrait key={src} src={src} className="h-9 w-9 ring-2 ring-white" sizes="36px" />
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

            {/* below lg the photo can't bleed, so it becomes a banner + card */}
            <div className="lg:hidden">
              <div
                role="img"
                aria-label="Two people working together at a laptop"
                className="aspect-[16/9] w-full rounded-2xl bg-[url('/images/hero.jpg')] bg-cover bg-[position:center_30%]"
              />
              <VerifiedCard className="mt-4 flex max-w-xs" />
            </div>
          </div>
        </section>

        {/* ---------------------------- trust bar --------------------------- */}
        <section id="trust" className="mx-auto max-w-7xl px-6 pb-4 pt-8">
          <div className={`grid ${CARD} rounded-2xl sm:grid-cols-2 lg:grid-cols-4`}>
            {TRUST_ITEMS.map((t, i) => (
              <div
                key={t.title}
                className={`flex gap-4 px-8 py-12 ${i > 0 ? "lg:border-l lg:border-slate-200/70" : ""}`}
              >
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                  {t.icon}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-navy-800">{t.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{t.body}</p>
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
                className={`group flex flex-col items-center gap-3.5 px-3 py-7 text-center transition hover:-translate-y-0.5 hover:ring-brand-200 ${CARD}`}
              >
                <span className={c.muted ? "text-brand-400" : "text-brand-600"}>{c.icon}</span>
                <span className="text-xs font-medium leading-tight text-navy-800">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* --------------------------- how it works ------------------------- */}
        <section id="how" className="bg-white py-14">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-navy-800 sm:text-3xl">How It Works</h2>
              <p className="mt-2.5 text-sm text-slate-500">Get started in three simple steps</p>
            </div>

            <div className="relative mt-12">
              {/* dashed connector, as in the comp */}
              <div className="absolute left-[16.6%] right-[16.6%] top-4 hidden border-t border-dashed border-brand-200 lg:block" />
              <div className="grid gap-12 lg:grid-cols-3">
                {STEPS.map((s, i) => (
                  <div key={s.title} className="relative flex flex-col items-center text-center">
                    <span className="relative z-10 grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-600">
                      {i + 1}
                    </span>
                    <div className="mt-8 flex h-44 w-full max-w-xs items-center justify-center rounded-xl bg-slate-50/80 p-5">
                      {STEP_ART[i]}
                    </div>
                    <h3 className="mt-6 font-semibold text-navy-800">{s.title}</h3>
                    <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-500">{s.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------ stats ----------------------------- */}
        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-10 rounded-2xl bg-gradient-to-r from-stat-from via-stat-via to-stat-to px-8 py-14 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`flex flex-col items-center gap-2 text-white ${i > 0 ? "lg:border-l lg:border-white/15" : ""}`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-white/75">{s.icon}</span>
                  <p className="text-3xl font-bold leading-none">{s.value}</p>
                </div>
                <p className="text-sm text-white/75">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------ featured freelancers -------------------- */}
        <section className="mx-auto max-w-7xl px-6 py-10">
          <SectionHeading title="Featured Freelancers" action="View all freelancers" href="/search" />
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {FREELANCERS.map((f) => (
              <article key={f.name} className={`relative p-6 text-center transition hover:shadow-md ${CARD}`}>
                <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-md bg-brand-50 text-brand-600">
                  <Check className="h-3 w-3" />
                </span>
                <Portrait src={f.photo} className="mx-auto h-28 w-28" sizes="112px" />
                <div className="mt-4 flex items-center justify-center gap-1.5">
                  <h3 className="font-semibold text-navy-800">{f.name}</h3>
                  <VerifiedTick />
                </div>
                <p className="mt-1 text-xs text-slate-500">{f.title}</p>
                <div className="mt-2.5 flex items-center justify-center gap-1.5">
                  <Stars rating={f.rating} />
                  <span className="text-xs text-slate-500">
                    {f.rating.toFixed(1)} ({f.reviews})
                  </span>
                </div>
                <div className="mt-3.5 flex flex-wrap justify-center gap-1.5">
                  {f.skills.map((s) => (
                    <span key={s} className="rounded bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">
                      {s}
                    </span>
                  ))}
                </div>
                <p className="mt-5 text-left text-lg font-bold text-navy-800">
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
              <figure key={t.name} className={`p-6 ${CARD}`}>
                <Quote className="h-6 w-6 text-brand-300" />
                <blockquote className="mt-3.5 text-sm leading-relaxed text-slate-600">{t.quote}</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <Portrait src={t.photo} className="h-9 w-9" sizes="36px" />
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
          <div className="relative overflow-hidden rounded-2xl bg-brand-600 px-8 py-20 text-center">
            {/* dotted world map, as in the comp: the Americas at the left edge,
                Europe/Africa/Asia/Oceania at the right, the Atlantic left open
                in the middle for the headline */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 hidden w-[30%] bg-[url('/images/dots-americas.svg')] bg-contain bg-left bg-no-repeat opacity-20 sm:block"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 hidden w-[34%] bg-[url('/images/dots-eastern.svg')] bg-contain bg-right bg-no-repeat opacity-20 sm:block"
            />
            <div className="relative">
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
                Join a global community built on trust
              </h2>
              <p className="mt-4 text-sm text-brand-100 sm:text-base">
                Create your free account today and start connecting.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/register?role=client"
                  className="rounded-lg bg-white px-8 py-3 text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
                >
                  I&apos;m a Client
                </Link>
                <Link
                  href="/register?role=freelancer"
                  className="rounded-lg px-8 py-3 text-sm font-semibold text-white ring-1 ring-white/60 transition hover:bg-white/10"
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
              <article key={p.title} className={`group overflow-hidden ${CARD}`}>
                <div className="relative aspect-[203/102]">
                  <Image
                    src={p.image}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                  />
                  <span className="absolute bottom-3 left-3 rounded bg-brand-600 px-2 py-1 text-[10px] font-bold tracking-wide text-white">
                    {p.tag}
                  </span>
                </div>
                <div className="px-6 py-7">
                  <h3 className="text-lg font-semibold leading-snug text-navy-800 group-hover:text-brand-600">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-500">{p.excerpt}</p>
                  <p className="mt-8 text-xs text-slate-400">
                    {p.date} &nbsp;•&nbsp; {p.read}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* ------------------------------ footer ----------------------------- */}
      <footer className="bg-navy-900 text-slate-300">
        <div className="mx-auto max-w-7xl px-6 py-24">
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
