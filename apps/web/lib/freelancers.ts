/**
 * The sample freelancers, defined once and read by the landing page's featured
 * strip, the browse page and the public profile — so a person's rate, rating
 * and review count cannot differ depending on where you meet them.
 *
 * Placeholder data until the profiles API exists (BUILD_PLAN phase 2/4).
 */

import type { Availability, Category } from "@/lib/categories";

export type Review = {
  author: string;
  role: string;
  when: string;
  rating: number;
  body: string;
};

export type Freelancer = {
  slug: string;
  name: string;
  title: string;
  photo: string;
  /** USD per hour. */
  rate: number;
  rating: number;
  reviews: number;
  /** Shown as chips on the browse cards. */
  skills: string[];
  /** The fuller list shown on the profile. */
  allSkills: string[];
  /** One-line pitch on the browse cards. */
  blurb: string;
  about: string;
  category: Category;
  workCategories: string[];
  country: string;
  /**
   * Set by the verification engine, never by the client. Drives the verified
   * tick and, through isVisible, whether the profile appears in search at all
   * (FR-V-5, FR-S-3).
   */
  idVerified: boolean;
  availability: Availability;
  /** ISO date; drives both the profile's "Member since" and the Newest sort. */
  joined: string;
  portfolio: string[];
  /** Share of reviews at 5,4,3,2,1 stars. */
  ratingBreakdown: [number, number, number, number, number];
  latestReview: Review;
};

// A deliberately mixed set — cleaner, electrician, tutor, mover, designer — so
// the first impression is "work of every kind", not a tech job board (SRS §1.2).
export const FREELANCERS: Freelancer[] = [
  {
    slug: "marisol-rivera",
    name: "Marisol Rivera",
    title: "Home & Office Cleaner",
    photo: "/avatars/community-1.jpg",
    rate: 28,
    rating: 5.0,
    reviews: 41,
    skills: ["Deep cleaning", "Move-out", "Eco products", "Offices"],
    allSkills: ["Deep cleaning", "Move-out cleans", "Regular housekeeping", "Office cleaning", "Eco-friendly products", "Ironing"],
    blurb: "Reliable, thorough home and office cleaning with eco-friendly products.",
    about:
      "I've cleaned homes and small offices for over ten years. I bring my own eco-friendly supplies, work to a checklist you can adjust, and leave the place exactly how you'd want it. Regular slots or one-off deep cleans both welcome.",
    category: "Home & Cleaning",
    workCategories: ["Home & Cleaning", "Move-out Cleaning"],
    idVerified: true,
    country: "United States",
    availability: "Within 24 hours",
    joined: "2024-01-15",
    portfolio: ["Weekly home cleans", "End-of-tenancy", "Small office contracts"],
    ratingBreakdown: [96, 4, 0, 0, 0],
    latestReview: {
      author: "Jenna P.",
      role: "Client",
      when: "2 weeks ago",
      rating: 5,
      body: "Marisol left our flat spotless for the move-out inspection. We got the full deposit back.",
    },
  },
  {
    slug: "tomas-okafor",
    name: "Tomás Okafor",
    title: "Licensed Electrician",
    photo: "/avatars/community-2.jpg",
    rate: 45,
    rating: 4.9,
    reviews: 33,
    skills: ["Rewiring", "Fault-finding", "Fuse boards", "Callouts"],
    allSkills: ["Rewiring", "Fault-finding", "Consumer units", "EV chargers", "Lighting", "Emergency callouts", "Certification"],
    blurb: "Fully licensed electrician for repairs, installs and same-day callouts.",
    about:
      "Qualified and insured, with fifteen years on domestic and light-commercial jobs. From a dead socket to a full rewire, I'll quote clearly before I start and leave you with the paperwork you need. Emergency callouts available most days.",
    category: "Repairs & Trades",
    workCategories: ["Repairs & Trades", "Electrical"],
    idVerified: true,
    country: "United Kingdom",
    availability: "Within 24 hours",
    joined: "2024-02-19",
    portfolio: ["Kitchen rewire", "EV charger install", "Fault-finding callouts"],
    ratingBreakdown: [90, 10, 0, 0, 0],
    latestReview: {
      author: "Marcus D.",
      role: "Client",
      when: "3 weeks ago",
      rating: 5,
      body: "Came out the same day, found the fault in twenty minutes and charged exactly what he quoted.",
    },
  },
  {
    slug: "priya-sharma",
    name: "Priya Sharma",
    title: "Maths & Science Tutor",
    photo: "/avatars/community-3.jpg",
    rate: 30,
    rating: 4.9,
    reviews: 27,
    skills: ["GCSE Maths", "A-Level Physics", "Exam prep", "Online"],
    allSkills: ["GCSE Maths", "A-Level Maths", "A-Level Physics", "Exam technique", "Online lessons", "In-person"],
    blurb: "Patient maths and science tutoring, in person or online, GCSE to A-Level.",
    about:
      "I'm a qualified teacher who tutors on evenings and weekends. I focus on understanding rather than memorising, build a plan around each student's exam board, and share progress notes with parents after every session.",
    category: "Tutoring & Lessons",
    workCategories: ["Tutoring & Lessons", "Exam Preparation"],
    idVerified: true,
    country: "United Kingdom",
    availability: "This week",
    joined: "2024-03-04",
    portfolio: ["GCSE Maths bootcamp", "A-Level Physics revision", "Online lessons"],
    ratingBreakdown: [93, 7, 0, 0, 0],
    latestReview: {
      author: "Aisha K.",
      role: "Parent",
      when: "1 month ago",
      rating: 5,
      body: "My son went from a 4 to a 7 in Maths. Priya explained things his school never managed to.",
    },
  },
  {
    slug: "daniel-osei",
    name: "Daniel Osei",
    title: "Mover & Van Driver",
    photo: "/avatars/community-4.jpg",
    rate: 35,
    rating: 4.8,
    reviews: 22,
    skills: ["House moves", "Man & van", "Deliveries", "Heavy lifting"],
    allSkills: ["House removals", "Man & van", "Furniture delivery", "Single-item moves", "Packing", "Heavy lifting"],
    blurb: "Careful house moves and man-and-van deliveries, any day of the week.",
    about:
      "I run a clean, insured Luton van and do everything from a single sofa to a whole flat. Furniture blankets and straps come as standard, I'll help pack if you want, and I quote a fixed price so there are no surprises on the day.",
    category: "Moving & Delivery",
    workCategories: ["Moving & Delivery", "Man & Van"],
    idVerified: true,
    country: "Canada",
    availability: "Anytime",
    joined: "2024-04-22",
    portfolio: ["Two-bed flat move", "Furniture deliveries", "Office relocation"],
    ratingBreakdown: [86, 14, 0, 0, 0],
    latestReview: {
      author: "Chloe R.",
      role: "Client",
      when: "2 months ago",
      rating: 5,
      body: "On time, took real care with our things, and nothing was rushed. Would book Daniel again.",
    },
  },
  {
    slug: "sofia-martinez",
    name: "Sofia Martinez",
    title: "Brand & UI Designer",
    photo: "/avatars/community-5.jpg",
    rate: 30,
    rating: 4.9,
    reviews: 18,
    skills: ["Figma", "Branding", "UI Design", "Webflow"],
    allSkills: ["Figma", "Brand identity", "UI Design", "Webflow", "Prototyping", "Design systems"],
    blurb: "Brand and interface design for small businesses that want to look the part.",
    about:
      "I help small businesses and independents look as professional as they are — logos, colour, and simple websites people can actually use. Clear pricing, a couple of rounds of revisions, and files you own at the end.",
    category: "Design & Creative",
    workCategories: ["Design & Creative", "Branding"],
    idVerified: true,
    country: "Spain",
    availability: "Anytime",
    joined: "2024-05-08",
    portfolio: ["Café rebrand", "Trades website", "Menu & signage"],
    ratingBreakdown: [92, 8, 0, 0, 0],
    latestReview: {
      author: "Tom W.",
      role: "Client",
      when: "5 weeks ago",
      rating: 5,
      body: "Sofia gave our cleaning business a proper logo and site. Bookings went up within a month.",
    },
  },
];

export function freelancerBySlug(slug: string): Freelancer | undefined {
  return FREELANCERS.find((f) => f.slug === slug);
}

/**
 * FR-S-3: only verified freelancers are visible, so only these may appear in
 * search results or featured listings. Mirrors freelancer_profiles.is_visible,
 * which the API sets to true only when id_verified is true.
 */
export const VISIBLE_FREELANCERS = FREELANCERS.filter((f) => f.idVerified);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2024-01-15" -> "Jan 2024". Formatted by hand so server and client agree. */
export function memberSince(joined: string): string {
  const [year, month] = joined.split("-");
  return `${MONTHS[Number(month) - 1]} ${year}`;
}
