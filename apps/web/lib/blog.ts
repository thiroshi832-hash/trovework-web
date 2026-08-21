/**
 * Blog articles, shared by the landing-page strip, the /blog index, and the
 * /blog/[slug] article pages. Real content authored in-repo (no CMS yet), so
 * every card links to a page that actually reads.
 */

export type BlogSection = { heading: string; paragraphs: string[] };

export type BlogPost = {
  slug: string;
  tag: string;
  image: string;
  title: string;
  excerpt: string;
  date: string;
  read: string;
  body: BlogSection[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-hire-the-right-freelancer",
    tag: "TIPS",
    image: "/design/blog-1.jpg",
    title: "How to Hire the Right Freelancer for Your Project",
    excerpt: "A practical guide to scoping your work, comparing verified freelancers, and starting off on the right foot.",
    date: "Aug 15, 2026",
    read: "5 min read",
    body: [
      {
        heading: "Start with a clear brief",
        paragraphs: [
          "The clearest projects get the best results. Before you reach out to anyone, write down what you need in a few sentences: the outcome you want, the rough scope, your timeline, and your budget range. A freelancer who can read a tight brief and ask sharp questions back is already showing you how they'll work.",
          "On Trovework you can browse by field, skill, price range and rating, so you can shortlist people whose focus actually matches your brief instead of casting a wide net.",
        ],
      },
      {
        heading: "Compare on evidence, not promises",
        paragraphs: [
          "Look at each freelancer's headline, skills and rate together — they should tell a consistent story. Ratings on Trovework come only from people who have actually had a conversation with that freelancer, so they reflect real interactions rather than anonymous noise.",
          "Every freelancer you see has completed identity verification, so you already know you're talking to a real, named person before the first message.",
        ],
      },
      {
        heading: "Talk before you commit",
        paragraphs: [
          "Use the built-in chat to ask about a similar past project, how they handle revisions, and how they prefer to communicate. You never have to hand over your personal contact details to get started — the conversation lives on the platform until you both decide to work together.",
          "Agree the scope, milestones and price in writing before any work begins. A short, explicit agreement prevents most of the friction that derails projects later.",
        ],
      },
    ],
  },
  {
    slug: "why-verification-matters",
    tag: "SAFETY",
    image: "/design/blog-2.jpg",
    title: "Why Verification Matters in Freelancing",
    excerpt: "Anonymous marketplaces invite bad actors. Here's how verified identity changes the incentives for everyone.",
    date: "Aug 8, 2026",
    read: "4 min read",
    body: [
      {
        heading: "Anonymity is the root of most marketplace fraud",
        paragraphs: [
          "When anyone can create a throwaway account, the cost of behaving badly drops to almost nothing — a scammer simply makes a new profile and tries again. Most freelance-marketplace horror stories trace back to the same root cause: you never really knew who was on the other side.",
          "Trovework takes the opposite approach. Every member — client and freelancer alike — verifies their identity with a government-issued ID and a live selfie before they can publish a profile, post work, or message anyone.",
        ],
      },
      {
        heading: "Verification changes the incentives",
        paragraphs: [
          "When your real identity is attached to your account, a bad interaction has lasting consequences, and good behaviour compounds into a reputation worth protecting. That single change quietly improves how people treat each other across the whole platform.",
          "It also means the reviews and ratings you read are tied to real, accountable people — not disposable handles.",
        ],
      },
      {
        heading: "Your documents stay protected",
        paragraphs: [
          "Verifying your identity should never mean exposing it. Your ID images and selfie are encrypted and stored outside the public web — they're used only to confirm who you are and are never shown on your profile. Your phone, email and messaging handles stay private too, released only to a verified client and enforced on our servers, not just hidden in the page.",
        ],
      },
    ],
  },
  {
    slug: "remote-work-best-practices",
    tag: "GUIDES",
    image: "/design/blog-3.jpg",
    title: "Remote Work Best Practices for Clients and Freelancers",
    excerpt: "Simple habits — clear scope, steady communication, and honest reviews — that make remote projects succeed.",
    date: "Aug 1, 2026",
    read: "6 min read",
    body: [
      {
        heading: "Agree the scope up front",
        paragraphs: [
          "Most remote projects go wrong not because of the work itself but because two people pictured different things. Spend the first conversation turning a vague idea into a concrete list: what's included, what isn't, what 'done' looks like, and when each piece is due.",
          "Write it down where you both can see it. A shared, explicit scope is the single best predictor of a project that finishes cleanly.",
        ],
      },
      {
        heading: "Communicate in a steady rhythm",
        paragraphs: [
          "Remote work rewards predictable communication over constant availability. Decide together how often you'll check in and keep the whole conversation in one place — Trovework's chat keeps your history in a single thread, so nothing important gets scattered across apps.",
          "Short, regular updates beat long silences followed by surprises. If something slips, say so early; good clients and good freelancers both respect an honest heads-up.",
        ],
      },
      {
        heading: "Close the loop with an honest review",
        paragraphs: [
          "When the work wraps up, leave a fair review. On Trovework you can only review someone you've actually worked with, so your feedback genuinely helps the next person make a good decision — and helps great freelancers and clients stand out.",
        ],
      },
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
