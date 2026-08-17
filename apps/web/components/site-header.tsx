import Link from "next/link";
import { Logo } from "@/components/brand";
import { AuthNav } from "@/components/auth-nav";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChevronDown, Globe } from "@/components/icons";
import { NAV } from "@/lib/nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-page items-center justify-between gap-3 px-4 py-4 sm:gap-6 sm:px-6 lg:px-10 xl:px-16">
        <Logo />

        <div className="hidden items-center gap-7 text-sm font-medium text-slate-600 lg:flex">
          {NAV.map((item) => (
            <Link key={item.label} href={item.href} className="hover:text-navy-800">
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="hidden items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-navy-800 lg:flex"
          >
            <Globe className="h-5 w-5" />
            English
            <ChevronDown className="h-4.5 w-4.5" />
          </button>

          <ThemeToggle />
          <AuthNav />
          {/* Below lg the horizontal menu is hidden, so the drawer carries it. */}
          <MobileNav />
        </div>
      </nav>
    </header>
  );
}
