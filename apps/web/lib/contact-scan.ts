/**
 * Client-side preview of the anti-leak scanner (dev doc §8, FR-M-2).
 *
 * The real check runs on the server on every post save and is the only one that
 * counts — this exists so the editor can warn *before* submitting, rather than
 * letting someone earn a strike for a mistake they could have seen. Keep the
 * patterns in step with the server implementation when it lands.
 */

export type LeakKind = "phone" | "email" | "link" | "handle" | "app";

export type Leak = {
  kind: LeakKind;
  text: string;
  start: number;
  end: number;
};

const PATTERNS: { kind: LeakKind; re: RegExp; label: string }[] = [
  // 9+ characters, so a price like "10,000" does not trip it (dev doc §8).
  { kind: "phone", re: /\+?\d[\d\s().-]{7,}\d/g, label: "a phone number" },
  { kind: "email", re: /[\w.+-]+@[\w-]+\.[\w.-]+/g, label: "an email address" },
  { kind: "link", re: /(https?:\/\/|www\.)\S+/gi, label: "a link" },
  { kind: "handle", re: /@[A-Za-z0-9_]{3,}/g, label: "an @username" },
  {
    kind: "app",
    // MUST stay identical to the server list in apps/api/src/moderation/contact-scan.ts.
    // If this drifts, a post the server blocks can pass the client preview, so the
    // user earns a strike with no warning — the exact outcome this mirror exists to prevent.
    re: /\b(telegram|telgram|whatsapp|whatsap|wsap|discord|line|wechat|signal|skype|viber|snapchat|kakaotalk)\b/gi,
    label: "a messaging app",
  },
];

export const LEAK_LABEL: Record<LeakKind, string> = {
  phone: "Phone number",
  email: "Email address",
  link: "Link",
  handle: "@username",
  app: "Messaging app",
};

/** All contact-info matches in `text`, ordered by position and de-overlapped. */
export function scanForContact(text: string): Leak[] {
  const found: Leak[] = [];

  for (const { kind, re } of PATTERNS) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      found.push({ kind, text: m[0], start: m.index, end: m.index + m[0].length });
      if (m[0].length === 0) re.lastIndex++;
    }
  }

  // An email also matches the @username pattern; keep the longer, more specific
  // match so the reason shown to the user is the accurate one.
  found.sort((a, b) => a.start - b.start || b.end - a.end);
  const kept: Leak[] = [];
  for (const leak of found) {
    if (kept.some((k) => leak.start < k.end && k.start < leak.end)) continue;
    kept.push(leak);
  }
  return kept;
}

/** Splits text into plain and flagged runs, for highlighting in the editor. */
export function segment(text: string, leaks: Leak[]): { text: string; leak?: Leak }[] {
  if (leaks.length === 0) return [{ text }];
  const out: { text: string; leak?: Leak }[] = [];
  let at = 0;
  for (const leak of leaks) {
    if (leak.start > at) out.push({ text: text.slice(at, leak.start) });
    out.push({ text: text.slice(leak.start, leak.end), leak });
    at = leak.end;
  }
  if (at < text.length) out.push({ text: text.slice(at) });
  return out;
}
