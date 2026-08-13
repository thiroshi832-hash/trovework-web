import Link from "next/link";
import { Logo } from "@/components/brand";
import { ChevronDown, Globe } from "@/components/icons";

/* Anchors are absolute so they still resolve from /login and /register. */
const NAV = [
  { label: "Browse Freelancers", href: "/search", dropdown: true },
  { label: "How It Works", href: "/#how" },
  { label: "About Us", href: "/#about" },
  { label: "Safety & Trust", href: "/#trust" },
  { label: "Blog", href: "/#blog" },
];

/**
 * `variant` controls the right-hand actions:
 *  - "default" — language, Login, Register (landing)
 *  - "register" — Login only (shown on the register page)
 *  - "login"   — Register only (shown on the login page)
 */
export function SiteHeader({
  variant = "default",
  navItems = 5,
}: {
  variant?: "default" | "register" | "login";
  navItems?: number;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-2">
        <Logo />

        <div className="hidden items-center gap-7 text-sm font-medium text-slate-600 lg:flex">
          {NAV.slice(0, navItems).map((item) =>
            item.dropdown ? (
              <button key={item.label} type="button" className="flex items-center gap-1 hover:text-navy-800">
                {item.label}
                <ChevronDown className="h-4 w-4" />
              </button>
            ) : (
              <Link key={item.label} href={item.href} className="hover:text-navy-800">
                {item.label}
              </Link>
            ),
          )}
        </div>

        <div className="flex items-center gap-3">
          {variant !== "register" ? (
            <button type="button" className="hidden items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-navy-800 md:flex">
              <Globe className="h-4 w-4" />
              English
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          ) : null}

          {variant === "login" ? (
            <Link
              href="/register"
              className="rounded-lg border border-brand-600 px-5 py-2.5 text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
            >
              Register
            </Link>
          ) : variant === "register" ? (
            <Link href="/login" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
              Login
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden text-sm font-medium text-slate-600 hover:text-navy-800 sm:block">
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
