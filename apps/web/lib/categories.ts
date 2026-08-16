/**
 * The category taxonomy, defined once. The landing page shows a curated few as
 * tiles; the browse page lists them all in its filter sidebar.
 */
// Trovework is for work of ANY field, not only tech (SRS §1.2). In-person
// trades and services lead — that's where "is this person verified?" matters
// most — with digital and knowledge work as part of the mix, not the whole.
export const CATEGORIES = [
  "Home & Cleaning",
  "Repairs & Trades",
  "Moving & Delivery",
  "Gardening & Outdoor",
  "Care & Wellbeing",
  "Beauty & Hair",
  "Tutoring & Lessons",
  "Cooking & Catering",
  "Events & Photography",
  "Driving & Transport",
  "Design & Creative",
  "Writing & Translation",
  "Web & Software",
  "Marketing",
  "Business & Admin",
  "Finance & Legal",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** How many the browse sidebar shows before the "More" toggle. */
export const CATEGORIES_COLLAPSED = 6;

/** Availability windows offered in the browse filter. */
export const AVAILABILITY = ["Anytime", "Within 24 hours", "This week"] as const;
export type Availability = (typeof AVAILABILITY)[number];
