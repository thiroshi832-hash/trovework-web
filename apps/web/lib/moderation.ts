/**
 * Moderation queues — the `violations` table plus the accounts and
 * verifications an admin has to rule on (FR-AD-1/2/3).
 *
 * Placeholder data until the admin API exists (BUILD_PLAN phase 6).
 */

export type Violation = {
  id: string;
  user: string;
  photo: string;
  postTitle: string;
  detectedText: string;
  kind: string;
  at: string;
  /** Which strike this was for that account, at the time it was logged. */
  strike: number;
};

export type ReviewCase = {
  id: string;
  user: string;
  photo: string;
  country: string;
  document: string;
  /** Face + info match score from the engine; borderline lands in this queue. */
  score: number;
  reason: string;
  submitted: string;
};

export type BannedUser = {
  id: string;
  user: string;
  photo: string;
  role: "Freelancer" | "Client";
  reason: string;
  bannedAt: string;
};

export const VIOLATIONS: Violation[] = [
  {
    id: "v-1",
    user: "Alex Morgan",
    photo: "/avatars/alex-morgan.jpg",
    postTitle: "I will audit and speed up your React application",
    detectedText: "telegram @alexmorgan",
    kind: "Messaging app",
    at: "2026-08-11 14:22",
    strike: 1,
  },
  {
    id: "v-2",
    user: "Daniel Kim",
    photo: "/avatars/daniel-kim.jpg",
    postTitle: "I will write your SEO blog programme",
    detectedText: "dkim.writes@example.com",
    kind: "Email address",
    at: "2026-08-10 09:03",
    strike: 2,
  },
  {
    id: "v-3",
    user: "Arjun Patel",
    photo: "/avatars/arjun-patel.jpg",
    postTitle: "I will rebuild your paid search account",
    detectedText: "+1 555 010 8842",
    kind: "Phone number",
    at: "2026-08-08 18:47",
    strike: 1,
  },
];

export const REVIEW_QUEUE: ReviewCase[] = [
  {
    id: "r-1",
    user: "Olivia Brown",
    photo: "/avatars/olivia-brown.jpg",
    country: "United Kingdom",
    document: "Passport",
    score: 0.71,
    reason: "Face match below the auto-approve threshold",
    submitted: "2026-08-13",
  },
  {
    id: "r-2",
    user: "Sofia Martinez",
    photo: "/avatars/sofia-martinez.jpg",
    country: "Spain",
    document: "National ID Card",
    score: 0.64,
    reason: "OCR could not read the date of birth",
    submitted: "2026-08-12",
  },
];

export const BANNED: BannedUser[] = [
  {
    id: "b-1",
    user: "Michael T.",
    photo: "/avatars/michael-t.jpg",
    role: "Client",
    reason: "Third contact-details violation",
    bannedAt: "2026-08-05",
  },
];
