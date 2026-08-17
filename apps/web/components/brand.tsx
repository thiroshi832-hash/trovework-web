import Image from "next/image";
import Link from "next/link";
import { Star } from "@/components/icons";

/**
 * `dark` means the logo sits on a permanently dark ground — the footer — so it
 * always uses the light artwork. Left unset, the ground is the page itself and
 * the lockup follows the theme.
 *
 * The supplied lockups already carry the "TRUST. WORK. TOGETHER." tagline, so
 * there is no separate tagline option.
 */

/** The lockup is wide (4.4:1). At h-10 it takes 174px, which leaves no room for
 *  the menu button on a 375px screen. */
const LOGO_SIZE = "h-8 w-auto sm:h-10";

export function Logo({ dark = false }: { dark?: boolean }) {
  if (dark) {
    return (
      <Link href="/" className="inline-flex shrink-0 items-center">
        <Image
          src="/images/logo-light.png"
          alt="Trovework"
          width={1124}
          height={258}
          className={LOGO_SIZE}
        />
      </Link>
    );
  }

  // Both lockups are rendered and CSS picks one. Swapping the `src` from state
  // would show the wrong artwork until React hydrated — on a dark page that is
  // a dark logo on a dark header. Whichever is hidden is `display:none`, so it
  // is out of the accessibility tree and only one name is announced.
  return (
    <Link href="/" className="inline-flex shrink-0 items-center">
      <Image
        src="/images/logo-dark.png"
        alt="Trovework"
        width={1124}
        height={258}
        priority
        className={`${LOGO_SIZE} dark:hidden`}
      />
      <Image
        src="/images/logo-light.png"
        alt="Trovework"
        width={1124}
        height={258}
        className={`hidden ${LOGO_SIZE} dark:block`}
      />
    </Link>
  );
}

/* Portraits are decorative — the person's name always sits beside them as text. */
export function Portrait({
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

export function Stars({ rating, className = "" }: { rating: number; className?: string }) {
  return (
    <span className={`flex items-center gap-0.5 text-amber-400 ${className}`} aria-label={`${rating} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} className={`h-4.5 w-4.5 ${i < Math.round(rating) ? "" : "text-slate-200"}`} />
      ))}
    </span>
  );
}
