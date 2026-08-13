import Image from "next/image";
import Link from "next/link";
import { Star } from "@/components/icons";

export function Logo({
  dark = false,
  tagline = false,
}: {
  dark?: boolean;
  tagline?: boolean;
}) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Image src="/logo-mark.png" alt="" width={32} height={32} className="h-8 w-8" priority />
      <span className="leading-none">
        <span className={`block text-xl font-bold tracking-tight ${dark ? "text-white" : "text-navy-800"}`}>
          Trovework
        </span>
        {tagline ? (
          <span className={`mt-0.5 block text-[7px] font-semibold tracking-[0.18em] ${dark ? "text-slate-400" : "text-slate-400"}`}>
            TRUST. WORK. TOGETHER.
          </span>
        ) : null}
      </span>
    </Link>
  );
}

export function Avatar({ initials, className = "" }: { initials: string; className?: string }) {
  return (
    <span
      className={`grid place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 font-semibold text-white ${className}`}
    >
      {initials}
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
