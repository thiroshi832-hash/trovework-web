"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "@/components/icons";
import { api, homeFor, type SessionUser } from "@/lib/api";

/**
 * The header's auth actions, session-aware. Fetches the current user on mount
 * (and again on navigation, so it reflects a fresh login/logout) and shows a
 * user menu when signed in, Login/Register when not.
 */
export function AuthNav() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let live = true;
    api
      .me()
      .then((u) => live && setUser(u))
      .catch(() => live && setUser(null))
      .finally(() => live && setReady(true));
    return () => {
      live = false;
    };
    // Re-check when the route changes — a login redirect lands on a new path.
  }, [pathname]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function logout() {
    setOpen(false);
    await api.logout().catch(() => {});
    setUser(null);
    router.replace("/");
    router.refresh();
  }

  // Avoid a flash of "Login/Register" before we know the session — render an
  // inert placeholder until the first /me resolves.
  if (!ready) return <span className="h-9 w-24" aria-hidden />;

  if (!user) {
    return (
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
    );
  }

  const initials =
    user.fullName.split(/\s+/).map((p) => p[0] ?? "").join("").slice(0, 2).toUpperCase() || "?";
  const first = user.fullName.split(/\s+/)[0];

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2.5 text-sm font-medium text-navy-800 transition hover:bg-slate-100"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-xs font-semibold text-white">
          {initials}
        </span>
        <span className="hidden sm:block">{first}</span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          <div className="border-b border-slate-100 px-4 py-2.5">
            <p className="truncate text-sm font-semibold text-navy-800">{user.fullName}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
          <Link
            href={homeFor(user.role)}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-navy-800 transition hover:bg-slate-50"
          >
            Dashboard
          </Link>
          {user.role === "freelancer" ? (
            <Link
              href="/profile/edit"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-navy-800 transition hover:bg-slate-50"
            >
              Edit profile
            </Link>
          ) : null}
          <Link
            href="/inbox"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-navy-800 transition hover:bg-slate-50"
          >
            Messages
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={logout}
            className="block w-full px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
          >
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}
