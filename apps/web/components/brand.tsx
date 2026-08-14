import Image from "next/image";
import Link from "next/link";
import { Star } from "@/components/icons";

/**
 * `dark` means the logo sits on a dark ground, so it uses the light artwork.
 * The supplied lockups already carry the "TRUST. WORK. TOGETHER." tagline, so
 * there is no separate tagline option.
 */
export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="inline-flex shrink-0 items-center">
      <Image
        src={dark ? "/images/logo-light.png" : "/images/logo-dark.png"}
        alt="Trovework"
        width={1124}
        height={258}
        priority
        className="h-10 w-auto"
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
        <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(rating) ? "" : "text-slate-200"}`} />
      ))}
    </span>
  );
}
