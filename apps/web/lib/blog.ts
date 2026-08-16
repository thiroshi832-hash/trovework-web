/**
 * Blog teasers, shared by the landing page strip and the /blog index.
 *
 * Placeholder copy until there is a CMS; `slug` is here so article pages can
 * be added without the two lists drifting.
 */

export type BlogPost = {
  slug: string;
  tag: string;
  image: string;
  title: string;
  excerpt: string;
  date: string;
  read: string;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-hire-the-right-freelancer",
    tag: "TIPS",
    image: "/design/blog-1.jpg",
    title: "How to Hire the Right Freelancer for Your Project",
    excerpt: "A practical guide to finding the perfect freelancer and getting great results.",
    date: "Aug 15, 2026",
    read: "5 min read",
  },
  {
    slug: "why-verification-matters",
    tag: "SAFETY",
    image: "/design/blog-2.jpg",
    title: "Why Verification Matters in Freelancing",
    excerpt: "Building a safer marketplace for everyone through trust and verification.",
    date: "Aug 8, 2026",
    read: "4 min read",
  },
  {
    slug: "remote-work-best-practices",
    tag: "GUIDES",
    image: "/design/blog-3.jpg",
    title: "Remote Work Best Practices for Clients and Freelancers",
    excerpt: "Tips to communicate better and deliver successful projects remotely.",
    date: "Aug 1, 2026",
    read: "6 min read",
  },
];
