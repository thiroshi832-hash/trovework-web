import Link from "next/link";
import { Logo } from "@/components/brand";
import { ChevronDown, Globe, SOCIALS } from "@/components/icons";

const COLUMNS = [
  { heading: "For Clients", links: ["Browse Freelancers", "How It Works", "Safety & Trust", "Help Center"] },
  { heading: "For Freelancers", links: ["Create Profile", "How It Works", "Freelancer Tips", "Community"] },
  { heading: "Company", links: ["About Us", "Blog", "Careers", "Contact Us"] },
  { heading: "Legal", links: ["Terms of Service", "Privacy Policy", "Cookie Policy", "Acceptable Use"] },
];

function SocialLink({ path, label }: { path: string; label: string }) {
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

/** Compact single-line footer, used on the sign-up page. */
export function SlimFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-6">
          <Logo />
          <p className="hidden text-xs sm:block">© 2026 Trovework. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-7 gap-y-2 text-xs">
          {["Terms of Service", "Privacy Policy", "Cookies Policy", "Help Center"].map((l) => (
            <Link key={l} href="#" className="hover:text-navy-800">
              {l}
            </Link>
          ))}
          <button type="button" className="flex items-center gap-1.5 hover:text-navy-800">
            <Globe className="h-4 w-4" />
            English
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}

export function SiteFooter({ newsletter = false }: { newsletter?: boolean }) {
  return (
    <footer className="bg-navy-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div
          className={`grid gap-10 ${
            newsletter ? "lg:grid-cols-[1.3fr_repeat(4,0.8fr)_1.2fr]" : "lg:grid-cols-[1.4fr_repeat(4,1fr)]"
          }`}
        >
          <div>
            <Logo dark />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              A trust-first global freelance marketplace. Connect, collaborate, and get work done
              with confidence.
            </p>
            <div className="mt-5 flex gap-2.5">
              {SOCIALS.map((s) => (
                <SocialLink key={s.label} path={s.path} label={s.label} />
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
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

          {newsletter ? (
            <div>
              <h3 className="text-sm font-semibold text-white">Stay in the loop</h3>
              <p className="mt-4 text-sm leading-relaxed text-slate-400">
                Get tips, updates, and resources to help you succeed.
              </p>
              {/* TODO: wire to the mailing-list endpoint when the API lands. */}
              <form className="mt-4 space-y-2.5">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  aria-label="Email address"
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-brand-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                  Subscribe
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Trovework. All rights reserved.</p>
          <p>Made with ❤️ for a better freelance world.</p>
        </div>
      </div>
    </footer>
  );
}
