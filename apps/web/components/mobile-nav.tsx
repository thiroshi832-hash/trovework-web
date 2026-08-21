"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Close, Menu } from "@/components/icons";
import { homeFor } from "@/lib/api";
import { useDict } from "@/lib/i18n/provider";
import { useSession } from "@/lib/use-session";

/**
 * The header's navigation below `lg`, where the horizontal menu is hidden.
 *
 * A right-hand drawer rather than a dropdown: the list is five items plus the
 * account links, which is more than a phone-height dropdown holds comfortably.
 */
export function MobileNav() {
  const pathname = usePathname();
  const { user, ready } = useSession();
  const t = useDict();

  // Mirrors the list SiteHeader builds server-side. Both read the same
  // dictionary, so the drawer and the desktop bar stay in step.
  const NAV = [
    { label: t.nav.browse, href: "/freelancers" },
    { label: t.nav.how, href: "/#how" },
    { label: t.nav.trust, href: "/safety" },
    { label: t.nav.blog, href: "/#blog" },
  ];
  const panelRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  // Held as "the route the drawer was opened on" rather than a plain boolean,
  // so a navigation closes it by falling out of step with the current path —
  // no effect needed to watch for it. Clicking a hash link stays on the same
  // path, so those links close it themselves.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;
  const close = () => setOpenedOn(null);

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenedOn(null);
    }
    document.addEventListener("keydown", onKey);

    // Stop the page behind the drawer scrolling with it.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Send focus into the panel, and put it back on the button on the way out,
    // so the drawer is usable from the keyboard.
    panelRef.current?.focus();
    const opener = openerRef.current;

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
      opener?.focus();
    };
  }, [open]);

  const linkClass =
    "block rounded-lg px-3 py-3 text-base font-medium text-navy-800 transition hover:bg-slate-100";

  return (
    <>
      <button
        ref={openerRef}
        type="button"
        onClick={() => setOpenedOn(pathname)}
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-nav"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-navy-800 lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Escape is the keyboard route out; this is the pointer equivalent
              and is deliberately not in the tab order. */}
          <div
            onClick={close}
            className="absolute inset-0 bg-navy-900/50"
            aria-hidden
          />

          <div
            id="mobile-nav"
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            // `end-0`, not `right-0`: the layout now sets dir="rtl" for Arabic,
            // and the drawer should come in from the side the text runs to.
            className="absolute end-0 top-0 flex h-full w-[min(20rem,85vw)] flex-col overflow-y-auto bg-white shadow-2xl outline-none"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
              <span className="text-sm font-semibold text-navy-800">Menu</span>
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="grid h-9 w-9 place-items-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-navy-800"
              >
                <Close className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-3">
              {NAV.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={close}
                  className={linkClass}
                >
                  {item.label}
                </Link>
              ))}

              {/* The account links repeat here because the header bar only has
                  room for one of them once the menu button is in place. */}
              {ready ? (
                <div className="mt-3 border-t border-slate-200 pt-3">
                  {user ? (
                    <>
                      <Link href={homeFor(user.role)} onClick={close} className={linkClass}>
                        {t.account.dashboard}
                      </Link>
                      {user.role === "freelancer" ? (
                        <Link href="/profile/edit" onClick={close} className={linkClass}>
                          {t.account.editProfile}
                        </Link>
                      ) : null}
                      <Link href="/inbox" onClick={close} className={linkClass}>
                        {t.account.messages}
                      </Link>
                    </>
                  ) : (
                    <Link href="/login" onClick={close} className={linkClass}>
                      {t.account.login}
                    </Link>
                  )}
                </div>
              ) : null}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
