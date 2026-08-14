/**
 * The category taxonomy, defined once. The landing page shows a curated few as
 * tiles; the browse page lists them all in its filter sidebar.
 */
export const CATEGORIES = [
  "Web Development",
  "Mobile Development",
  "Design & Creative",
  "Writing & Translation",
  "Marketing",
  "Video & Animation",
  "AI Services",
  "Data & Analytics",
  "Business",
  "Music & Audio",
  "Photography",
  "Engineering & Architecture",
  "Finance & Accounting",
  "Legal",
  "Admin & Customer Support",
  "Education & Tutoring",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** How many the browse sidebar shows before the "More" toggle. */
export const CATEGORIES_COLLAPSED = 6;

/** Availability windows offered in the browse filter. */
export const AVAILABILITY = ["Anytime", "Within 24 hours", "This week"] as const;
export type Availability = (typeof AVAILABILITY)[number];
