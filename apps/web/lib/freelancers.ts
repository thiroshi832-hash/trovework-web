/**
 * The sample freelancers, defined once and read by the landing page's featured
 * strip, the browse page and the public profile — so a person's rate, rating
 * and review count cannot differ depending on where you meet them.
 *
 * Placeholder data until the profiles API exists (BUILD_PLAN phase 2/4).
 */

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
  category: string;
  workCategories: string[];
  country: string;
  memberSince: string;
  portfolio: string[];
  /** Share of reviews at 5,4,3,2,1 stars. */
  ratingBreakdown: [number, number, number, number, number];
  latestReview: Review;
};

export const FREELANCERS: Freelancer[] = [
  {
    slug: "alex-morgan",
    name: "Alex Morgan",
    title: "Full Stack Developer",
    photo: "/avatars/alex-morgan.jpg",
    rate: 40,
    rating: 5.0,
    reviews: 32,
    skills: ["React", "Node.js", "TypeScript", "Next.js"],
    allSkills: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS", "API Integration"],
    blurb: "I build modern, responsive and scalable web applications with excellent performance.",
    about:
      "I'm a Full Stack Developer with 6+ years of experience building modern web applications. I specialize in React, Next.js, Node.js and PostgreSQL. I love creating fast, scalable and user-friendly solutions that solve real problems.",
    category: "Web Development",
    workCategories: ["Web Development", "SaaS Development"],
    country: "United States",
    memberSince: "Jan 2024",
    portfolio: ["E-commerce Platform", "SaaS Dashboard", "Task Management App"],
    ratingBreakdown: [100, 0, 0, 0, 0],
    latestReview: {
      author: "John Smith",
      role: "Client",
      when: "2 weeks ago",
      rating: 5,
      body: "Great developer! Delivered high quality work on time. Highly recommended.",
    },
  },
  {
    slug: "sofia-martinez",
    name: "Sofia Martinez",
    title: "UI/UX Designer",
    photo: "/avatars/sofia-martinez.jpg",
    rate: 30,
    rating: 4.9,
    reviews: 18,
    skills: ["Figma", "UI Design", "UX Research", "Adobe XD"],
    allSkills: ["Figma", "UI Design", "UX Research", "Adobe XD", "Prototyping", "Design Systems"],
    blurb: "I create beautiful and user-friendly designs that convert visitors into customers.",
    about:
      "I'm a product designer focused on interfaces people actually enjoy using. I run research, build design systems and prototype quickly so teams can test ideas before committing to them.",
    category: "Design & Creative",
    workCategories: ["Design & Creative", "Product Design"],
    country: "Spain",
    memberSince: "Mar 2024",
    portfolio: ["Banking App Redesign", "Design System", "Marketing Site"],
    ratingBreakdown: [92, 8, 0, 0, 0],
    latestReview: {
      author: "Priya N.",
      role: "Client",
      when: "1 month ago",
      rating: 5,
      body: "Sofia understood the brief immediately and the handoff to our developers was flawless.",
    },
  },
  {
    slug: "daniel-kim",
    name: "Daniel Kim",
    title: "Content Writer",
    photo: "/avatars/daniel-kim.jpg",
    rate: 20,
    rating: 4.8,
    reviews: 27,
    skills: ["Writing", "SEO", "Blog Writing", "Copywriting"],
    allSkills: ["Writing", "SEO", "Blog Writing", "Copywriting", "Editing", "Content Strategy"],
    blurb: "I craft engaging content that ranks well and connects with your audience.",
    about:
      "I write long-form content that earns its place in search results and still reads like a human wrote it. I work with founders and marketing teams to turn subject-matter expertise into articles people finish.",
    category: "Writing & Translation",
    workCategories: ["Writing & Translation", "Content Marketing"],
    country: "South Korea",
    memberSince: "Feb 2024",
    portfolio: ["SaaS Blog Programme", "Product Launch Copy", "Newsletter Series"],
    ratingBreakdown: [85, 15, 0, 0, 0],
    latestReview: {
      author: "Marcus D.",
      role: "Client",
      when: "3 weeks ago",
      rating: 5,
      body: "Clear, well-researched articles delivered ahead of schedule. Needed almost no editing.",
    },
  },
  {
    slug: "olivia-brown",
    name: "Olivia Brown",
    title: "Video Editor",
    photo: "/avatars/olivia-brown.jpg",
    rate: 25,
    rating: 4.9,
    reviews: 21,
    skills: ["Premiere Pro", "After Effects", "DaVinci Resolve"],
    allSkills: ["Premiere Pro", "After Effects", "DaVinci Resolve", "Motion Graphics", "Colour Grading"],
    blurb: "I edit professional videos that tell your story and engage your audience.",
    about:
      "I cut video for brands and creators — everything from short social edits to long-form documentary work. I handle colour, sound and motion graphics so you get a finished piece, not just a timeline.",
    category: "Video & Animation",
    workCategories: ["Video & Animation", "Motion Graphics"],
    country: "United Kingdom",
    memberSince: "Apr 2024",
    portfolio: ["Brand Launch Film", "YouTube Series", "Event Recap"],
    ratingBreakdown: [90, 10, 0, 0, 0],
    latestReview: {
      author: "Chloe R.",
      role: "Client",
      when: "2 months ago",
      rating: 5,
      body: "Olivia turned hours of raw footage into something we were proud to put our name on.",
    },
  },
  {
    slug: "arjun-patel",
    name: "Arjun Patel",
    title: "Digital Marketer",
    photo: "/avatars/arjun-patel.jpg",
    rate: 35,
    rating: 4.8,
    reviews: 25,
    skills: ["SEO", "Google Ads", "Analytics"],
    allSkills: ["SEO", "Google Ads", "Analytics", "Conversion Optimisation", "Email Marketing"],
    blurb: "I grow traffic and turn it into customers with measurable, honest marketing.",
    about:
      "I run acquisition for small teams that need results they can verify. Search, paid and analytics — set up properly, reported plainly, with no vanity metrics.",
    category: "Marketing",
    workCategories: ["Marketing", "Growth"],
    country: "India",
    memberSince: "May 2024",
    portfolio: ["E-commerce Growth", "Paid Search Rebuild", "Analytics Overhaul"],
    ratingBreakdown: [84, 16, 0, 0, 0],
    latestReview: {
      author: "Tom W.",
      role: "Client",
      when: "5 weeks ago",
      rating: 5,
      body: "Arjun rebuilt our tracking first and only then touched spend. Refreshingly rigorous.",
    },
  },
];

export function freelancerBySlug(slug: string): Freelancer | undefined {
  return FREELANCERS.find((f) => f.slug === slug);
}

export const CATEGORIES = [
  "Web Development",
  "Design & Creative",
  "Writing & Translation",
  "Marketing",
  "Video & Animation",
] as const;
