/**
 * The header's primary navigation, defined once so the desktop bar and the
 * mobile drawer cannot list different things.
 *
 * Anchors are absolute so they still resolve from /login and /register.
 */
export const NAV = [
  { label: "Browse Freelancers", href: "/freelancers" },
  { label: "How It Works", href: "/#how" },
  // NOTE: the landing page has no #about section, so this one lands at the top
  // of /. Left as-is rather than silently dropped from the menu.
  { label: "About Us", href: "/#about" },
  { label: "Safety & Trust", href: "/#trust" },
  { label: "Blog", href: "/#blog" },
] as const;
