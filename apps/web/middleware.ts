import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge gate for the signed-in areas. Redirects to /login when no session cookie
 * is present, before the page renders — so an anonymous visitor never sees a
 * flash of protected UI. This is a coarse presence check only; the API still
 * enforces real authorization on every request, and a page whose own /me call
 * comes back 401 (expired token) redirects itself.
 */

const PROTECTED = [
  /^\/dashboard(\/|$)/,
  /^\/profile(\/|$)/,
  /^\/posts\/new(\/|$)/,
  /^\/posts\/[^/]+\/edit(\/|$)/,
  /^\/inbox(\/|$)/,
  /^\/admin(\/|$)/,
  /^\/verify(\/|$)/,
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!PROTECTED.some((re) => re.test(pathname))) return NextResponse.next();

  if (req.cookies.get("access_token")) return NextResponse.next();

  const login = req.nextUrl.clone();
  login.pathname = "/login";
  login.search = `?next=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(login);
}

export const config = {
  // Skip static assets and API routes; the API guards itself.
  matcher: ["/((?!_next/|api/|favicon|icon|apple-icon|images/|avatars/|.*\\.\\w+$).*)"],
};
