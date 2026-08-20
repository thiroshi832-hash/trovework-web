import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge gate for the signed-in areas. Redirects to /login when no session cookie
 * is present, before the page renders — so an anonymous visitor never sees a
 * flash of protected UI. This is a coarse presence check only; the API still
 * enforces real authorization on every request, and a page whose own /me call
 * comes back 401 (expired token) redirects itself.
 *
 * We accept EITHER the access token OR the long-lived "session" marker: the
 * access token expires after 15 min, so gating on it alone would bounce a still
 * signed-in user to /login on the next navigation. The marker means "there's a
 * refreshable session" — the page loads and the first API call renews the
 * access token. When the refresh token dies (or on logout) the marker is
 * cleared, so this correctly redirects a genuinely logged-out visitor.
 */

const PROTECTED = [
  /^\/freelancers(\/|$)/,
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

  if (req.cookies.get("access_token") || req.cookies.get("session")) return NextResponse.next();

  const login = req.nextUrl.clone();
  login.pathname = "/login";
  login.search = `?next=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(login);
}

export const config = {
  // Skip static assets and API routes; the API guards itself.
  matcher: ["/((?!_next/|api/|favicon|icon|apple-icon|images/|avatars/|.*\\.\\w+$).*)"],
};
