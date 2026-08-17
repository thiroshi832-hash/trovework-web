export type IconProps = { className?: string };

const s = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/* ------------------------------- trust / ui ------------------------------ */

export function ShieldCheck({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 3 5 5.6v5c0 4.3 3 8.3 7 9.6 4-1.3 7-5.3 7-9.6v-5L12 3Z" {...s} />
      <path d="m9 11.8 2.1 2.1L15.2 9.7" {...s} strokeWidth={1.9} />
    </svg>
  );
}

export function Lock({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="4.8" y="10.5" width="14.4" height="9.7" rx="2.2" {...s} />
      <path d="M8.2 10.5V7.9a3.8 3.8 0 0 1 7.6 0v2.6" {...s} />
    </svg>
  );
}

export function ChatBubble({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M5 5h14a1.9 1.9 0 0 1 1.9 1.9v7.6A1.9 1.9 0 0 1 19 16.4H9.6L5.6 19.6V6.9A1.9 1.9 0 0 1 7.5 5Z" {...s} />
    </svg>
  );
}

export function Gift({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="4" y="9.5" width="16" height="10.5" rx="1.6" {...s} />
      <path d="M4 13.2h16M12 9.5V20" {...s} />
      <path d="M12 9.5S10.8 5 8.6 5a2 2 0 0 0 0 4.5Zm0 0S13.2 5 15.4 5a2 2 0 0 1 0 4.5Z" {...s} />
    </svg>
  );
}

export function Check({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="m5 12.5 4.5 4.5L19 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Star({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 3.6l2.5 5.1 5.6.8-4.1 4 1 5.6-5-2.6-5 2.6 1-5.6-4.1-4 5.6-.8L12 3.6Z" />
    </svg>
  );
}

export function Globe({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="8.2" {...s} />
      <path d="M3.8 12h16.4M12 3.8c2.1 2.2 3.2 5.1 3.2 8.2S14.1 18 12 20.2C9.9 18 8.8 15.1 8.8 12S9.9 6 12 3.8Z" {...s} />
    </svg>
  );
}

export function Users({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="9" cy="8.4" r="3.2" {...s} />
      <path d="M3.4 19.2a5.8 5.8 0 0 1 11.2 0M16.2 5.6a3.1 3.1 0 0 1 0 5.7M17.6 19.2a5.6 5.6 0 0 0-1.9-4" {...s} />
    </svg>
  );
}

export function Building({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="5" y="4" width="9.5" height="16" rx="1.4" {...s} />
      <path d="M14.5 9.5H19v10.5M8 8h3.5M8 11.5h3.5M8 15h3.5" {...s} />
    </svg>
  );
}

export function ChevronDown({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="m6.5 9.5 5.5 5.5 5.5-5.5" {...s} strokeWidth={1.9} />
    </svg>
  );
}

export function Sun({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="4.2" {...s} strokeWidth={1.8} />
      <path
        d="M12 2.8v2.4M12 18.8v2.4M21.2 12h-2.4M5.2 12H2.8M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7M18.5 18.5l-1.7-1.7M7.2 7.2 5.5 5.5"
        {...s}
        strokeWidth={1.8}
      />
    </svg>
  );
}

export function Moon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M20.2 14.4A8.6 8.6 0 0 1 9.6 3.8a8.6 8.6 0 1 0 10.6 10.6Z" {...s} strokeWidth={1.8} />
    </svg>
  );
}

export function Menu({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" {...s} strokeWidth={1.9} />
    </svg>
  );
}

export function Close({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" {...s} strokeWidth={1.9} />
    </svg>
  );
}

export function ArrowRight({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M4.5 12h15m-5.6-5.6L19.5 12l-5.6 5.6" {...s} strokeWidth={1.8} />
    </svg>
  );
}

export function Quote({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M9.4 5.5c-3 1.6-4.7 4.1-4.7 7.4v5.6h6.2v-6H7.6c0-2 .8-3.4 2.6-4.4l-.8-2.6Zm9.3 0c-3 1.6-4.7 4.1-4.7 7.4v5.6h6.2v-6h-3.3c0-2 .8-3.4 2.6-4.4l-.8-2.6Z" />
    </svg>
  );
}

export function Headset({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M4.6 14.5v-2.4a7.4 7.4 0 0 1 14.8 0v2.4" {...s} />
      <rect x="3" y="13.4" width="3.6" height="5.4" rx="1.5" {...s} />
      <rect x="17.4" y="13.4" width="3.6" height="5.4" rx="1.5" {...s} />
      <path d="M19.2 18.8a3 3 0 0 1-3 2.4H13" {...s} />
    </svg>
  );
}

/* --------------------------------- forms -------------------------------- */

export function UserIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="8.2" r="3.6" {...s} />
      <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" {...s} />
    </svg>
  );
}

export function Mail({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="3.2" y="5.4" width="17.6" height="13.2" rx="2" {...s} />
      <path d="m4.2 7.2 7.8 5.6 7.8-5.6" {...s} />
    </svg>
  );
}

export function Phone({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="6.6" y="2.8" width="10.8" height="18.4" rx="2.4" {...s} />
      <path d="M10.8 18.4h2.4" {...s} />
    </svg>
  );
}

export function Eye({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M2.6 12S6 5.8 12 5.8 21.4 12 21.4 12 18 18.2 12 18.2 2.6 12 2.6 12Z" {...s} />
      <circle cx="12" cy="12" r="2.9" {...s} />
    </svg>
  );
}

export function EyeOff({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M9.6 6.2A8.9 8.9 0 0 1 12 5.8c6 0 9.4 6.2 9.4 6.2a15.6 15.6 0 0 1-3.3 4M6.2 8.1A15.7 15.7 0 0 0 2.6 12S6 18.2 12 18.2c1.3 0 2.4-.3 3.4-.7" {...s} />
      <path d="m3.4 3.4 17.2 17.2" {...s} />
    </svg>
  );
}

export function MapPin({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 21.2s6.4-5.4 6.4-10.4a6.4 6.4 0 1 0-12.8 0c0 5 6.4 10.4 6.4 10.4Z" {...s} />
      <circle cx="12" cy="10.6" r="2.4" {...s} />
    </svg>
  );
}

export function Hash({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M9.4 4.2 7.6 19.8m8.8-15.6-1.8 15.6M4.6 8.8h15m-16 6.4h15" {...s} />
    </svg>
  );
}

export function Briefcase({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="3" y="7.4" width="18" height="12.2" rx="2" {...s} />
      <path d="M8.6 7.4V5.8a1.8 1.8 0 0 1 1.8-1.8h3.2a1.8 1.8 0 0 1 1.8 1.8v1.6M3 12.6h18" {...s} />
    </svg>
  );
}

/* --------------------------------- brands -------------------------------- */

export function GoogleMark({ className }: IconProps) {
  return (
    <svg viewBox="0 0 18 18" className={className} aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  );
}

export function AppleMark({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16.4 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.15-2.8.85-3.5.85-.7 0-1.85-.83-3.05-.81-1.55.02-3 .9-3.8 2.3-1.63 2.82-.42 7 1.16 9.3.77 1.12 1.7 2.38 2.9 2.34 1.16-.05 1.6-.75 3-.75s1.8.75 3.03.73c1.25-.02 2.04-1.14 2.8-2.27.88-1.3 1.25-2.56 1.27-2.63-.03-.01-2.43-.93-2.45-3.7ZM14.1 5.3c.63-.77 1.06-1.83.94-2.9-.91.04-2.02.61-2.67 1.37-.58.68-1.09 1.77-.95 2.81 1.02.08 2.05-.51 2.68-1.28Z" />
    </svg>
  );
}

/* ------------------------------- categories ------------------------------ */

export function Sparkle({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 4.2 13.6 9l4.8 1.6-4.8 1.6L12 17l-1.6-4.8L5.6 10.6 10.4 9 12 4.2Z" {...s} />
    </svg>
  );
}
export function Broom({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M15.5 4.5 9.8 10.2M13.2 12.6 7.4 18.4a2.3 2.3 0 0 1-3.2 0 2.3 2.3 0 0 1 0-3.2l5.8-5.8M9.4 8.6l6 6" {...s} />
      <path d="M14.4 7.6 17 5a1.9 1.9 0 0 1 2.7 2.7l-2.6 2.6" {...s} />
    </svg>
  );
}
export function Wrench({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M15.6 4.4a4.6 4.6 0 0 0-5.9 5.7l-5 5a2 2 0 0 0 2.8 2.8l5-5a4.6 4.6 0 0 0 5.7-5.9l-2.6 2.6-2.3-.4-.4-2.3 2.7-2.5Z" {...s} />
    </svg>
  );
}
export function Book({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M4.5 5.2h5a2.6 2.6 0 0 1 2.5 2.6v11a2 2 0 0 0-2-2H4.5V5.2Zm15 0h-5A2.6 2.6 0 0 0 12 7.8v11a2 2 0 0 1 2-2h5.5V5.2Z" {...s} />
    </svg>
  );
}
export function Truck({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M3.5 6.5h9.2v9.8H3.5zM12.7 10h3.6l3.2 3v3.3h-6.8z" {...s} />
      <circle cx="7" cy="17.6" r="1.7" {...s} />
      <circle cx="16.4" cy="17.6" r="1.7" {...s} />
    </svg>
  );
}
export function Code({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="m8.6 8.4-4 3.6 4 3.6m6.8-7.2 4 3.6-4 3.6M13.4 5.8l-2.8 12.4" {...s} />
    </svg>
  );
}
export function Pen({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M15.6 4.9 19.1 8.4 8.7 18.8l-4.4.9.9-4.4L15.6 4.9Z" {...s} />
      <path d="m13.6 6.9 3.5 3.5" {...s} />
    </svg>
  );
}
export function Dots({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <circle cx="6.5" cy="12" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="17.5" cy="12" r="1.7" />
    </svg>
  );
}

/* --------------------------------- social -------------------------------- */

export const SOCIALS = [
  { label: "X", path: "M18.9 3H21l-6.6 7.5L22 21h-6l-4.7-6.1L5.9 21H3.8l7-8L2.4 3h6.2l4.2 5.6L18.9 3Zm-1 16.2h1.2L8.2 4.7H6.9l10 14.5Z" },
  { label: "LinkedIn", path: "M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05A4.2 4.2 0 0 1 17.6 8.7c4 0 4.7 2.6 4.7 6V21h-4v-5.5c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9V21h-4V9Z" },
  { label: "Facebook", path: "M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6A22 22 0 0 0 14.3 3.5c-2.4 0-4 1.45-4 4.1v2.3H7.6V13h2.7v8h3.2Z" },
  { label: "Instagram", path: "M12 7.4a4.6 4.6 0 1 0 0 9.2 4.6 4.6 0 0 0 0-9.2Zm0 7.6a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm5.9-7.8a1.07 1.07 0 1 1-2.15 0 1.07 1.07 0 0 1 2.15 0ZM12 4.6c2.4 0 2.7 0 3.6.05.9.04 1.5.18 2 .38.55.2 1 .5 1.45.95.45.45.75.9.95 1.45.2.5.34 1.1.38 2 .04.9.05 1.2.05 3.6s0 2.7-.05 3.6c-.04.9-.18 1.5-.38 2a4 4 0 0 1-.95 1.45c-.45.45-.9.75-1.45.95-.5.2-1.1.34-2 .38-.9.04-1.2.05-3.6.05s-2.7 0-3.6-.05c-.9-.04-1.5-.18-2-.38a4 4 0 0 1-1.45-.95 4 4 0 0 1-.95-1.45c-.2-.5-.34-1.1-.38-2C4.6 14.7 4.6 14.4 4.6 12s0-2.7.05-3.6c.04-.9.18-1.5.38-2 .2-.55.5-1 .95-1.45A4 4 0 0 1 7.43 4c.5-.2 1.1-.34 2-.38.9-.04 1.2-.05 3.6-.05Z" },
];

/* ---------------------------------------------------------------------------
   Solid variants for the auth panels' feature badges: the glyph is a filled
   white shape with its detail punched out in the badge's blue, rather than a
   thin stroke. `currentColor` carries the white so the badge can set it.
   --------------------------------------------------------------------------- */

/** Matches --color-badge-to, the darker end of the badge gradient. */
const CUT = "#0a55ee";

export function ShieldCheckSolid({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 2.2 3.9 5.1v6.2c0 5.1 3.4 9.6 8.1 11 4.7-1.4 8.1-5.9 8.1-11V5.1L12 2.2Z"
        fill="currentColor"
      />
      <path
        d="m8.5 11.9 2.4 2.4 4.6-4.8"
        fill="none"
        stroke={CUT}
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChatBubbleSolid({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M5.4 4.4h13.2A2.4 2.4 0 0 1 21 6.8v7.6a2.4 2.4 0 0 1-2.4 2.4h-7.2l-4.5 3.4a.6.6 0 0 1-1-.5v-2.9h-.5A2.4 2.4 0 0 1 3 14.4V6.8a2.4 2.4 0 0 1 2.4-2.4Z"
        fill="currentColor"
      />
      <circle cx="8.4" cy="10.6" r="1.3" fill={CUT} />
      <circle cx="12" cy="10.6" r="1.3" fill={CUT} />
      <circle cx="15.6" cy="10.6" r="1.3" fill={CUT} />
    </svg>
  );
}

export function GiftSolid({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 8.4S10.8 3.9 8.5 3.9a2.2 2.2 0 0 0 0 4.5Zm0 0s1.2-4.5 3.5-4.5a2.2 2.2 0 0 1 0 4.5Z"
        fill="currentColor"
      />
      <path d="M3.2 9h17.6v3.9H3.2z" fill="currentColor" />
      <path d="M4.9 13.9h14.2v6.1a1.4 1.4 0 0 1-1.4 1.4H6.3a1.4 1.4 0 0 1-1.4-1.4z" fill="currentColor" />
      <path d="M10.7 9h2.6v12.4h-2.6z" fill={CUT} />
    </svg>
  );
}

export function GlobeSolid({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9.3" fill="currentColor" />
      <path
        d="M2.7 12h18.6M12 2.7c2.4 2.6 3.7 5.9 3.7 9.3s-1.3 6.7-3.7 9.3c-2.4-2.6-3.7-5.9-3.7-9.3S9.6 5.3 12 2.7Z"
        fill="none"
        stroke={CUT}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LockSolid({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M8.4 10.4V7.9a3.6 3.6 0 0 1 7.2 0v2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <rect x="4.3" y="10.2" width="15.4" height="10.6" rx="2.4" fill="currentColor" />
      <circle cx="12" cy="15.5" r="1.8" fill={CUT} />
    </svg>
  );
}

/* ------------------------- browse / profile / verify ---------------------- */

export function Search({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="10.8" cy="10.8" r="6.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="m15.6 15.6 4.2 4.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function ArrowLeft({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M19.5 12h-15m5.6-5.6L4.5 12l5.6 5.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Clock({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="8.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 7.4V12l3 1.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CalendarCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="8.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="m8.4 12.2 2.4 2.4 4.8-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Document with an image inside — the ID-upload dropzone glyph. */
export function IdUpload({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path
        d="M6.5 3.5h12l7 7v18h-19z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <path d="M18.5 3.5v7h7" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <path
        d="M10 22.5l3.4-3.6 2.4 2.4 3-3.2 3.2 3.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="21.5" cy="24.5" r="4.2" fill="currentColor" />
      <path
        d="m19.8 24.6 1.2 1.2 2.3-2.4"
        fill="none"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
