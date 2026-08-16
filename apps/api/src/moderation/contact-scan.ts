/**
 * The authoritative anti-leak scanner (dev doc §8, FR-M-2/3).
 *
 * This is the one that counts. The frontend has a mirror of it
 * (apps/web/lib/contact-scan.ts) purely so the editor can warn before submit —
 * but a post is blocked, a violation logged, and a strike counted only when
 * THIS server-side check fires, on every create and edit.
 *
 * Kept as a pure function with no Nest/Prisma imports so it is trivially
 * unit-testable in isolation, which matters: false positives here punish honest
 * users, and false negatives defeat the whole trust model.
 */

export type LeakKind = "phone" | "email" | "link" | "handle" | "app";

export interface Leak {
  kind: LeakKind;
  text: string;
  start: number;
  end: number;
}

const PATTERNS: { kind: LeakKind; re: RegExp }[] = [
  // A run of 9+ digit-ish characters. The {7,} inner span plus the two anchor
  // digits means "10,000" (6 chars) does not trip it, but a real number does.
  { kind: "phone", re: /\+?\d[\d\s().-]{7,}\d/g },
  { kind: "email", re: /[\w.+-]+@[\w-]+\.[\w.-]+/g },
  { kind: "link", re: /(https?:\/\/|www\.)\S+/gi },
  { kind: "handle", re: /@[A-Za-z0-9_]{3,}/g },
  {
    kind: "app",
    // Common misspellings included on purpose (dev doc §8).
    re: /\b(telegram|telgram|whatsapp|whatsap|wsap|discord|line|wechat|signal|skype|viber|snapchat|kakaotalk)\b/gi,
  },
];

/** All contact-info matches, ordered by position with overlaps removed. */
export function scanForContact(text: string): Leak[] {
  if (!text) return [];
  const found: Leak[] = [];

  for (const { kind, re } of PATTERNS) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      found.push({ kind, text: m[0], start: m.index, end: m.index + m[0].length });
      if (m[0].length === 0) re.lastIndex++; // guard against zero-width loops
    }
  }

  // An email also matches the @username pattern; when two matches overlap keep
  // the longer, more specific one so the reason shown to the user is accurate.
  found.sort((a, b) => a.start - b.start || b.end - a.end);
  const kept: Leak[] = [];
  for (const leak of found) {
    if (kept.some((k) => leak.start < k.end && k.start < leak.end)) continue;
    kept.push(leak);
  }
  return kept;
}

export interface ScanResult {
  clean: boolean;
  leaks: Leak[];
  /** The offending substrings, joined — stored on the violation for review. */
  detectedText: string;
}

/** Scans the parts of a post that users control (title + description). */
export function scanPost(fields: { title?: string; description?: string }): ScanResult {
  const leaks = [
    ...scanForContact(fields.title ?? ""),
    ...scanForContact(fields.description ?? ""),
  ];
  return {
    clean: leaks.length === 0,
    leaks,
    detectedText: leaks.map((l) => l.text).join(" | "),
  };
}
