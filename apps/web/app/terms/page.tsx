import type { Metadata } from "next";
import { LegalPlaceholder } from "@/components/legal-placeholder";

export const metadata: Metadata = {
  title: "Terms of Service — Trovework",
  description: "The agreement between you and Trovework, in plain words.",
};

export default function TermsPage() {
  return (
    <LegalPlaceholder
      title="Terms of Service"
      lead="This is the deal between you and us: what Trovework does, what we ask of you, and what happens when something goes wrong."
      points={[
        {
          heading: "What we actually do",
          body: "We check that people are who they say they are, and we help you find each other. That's it. We're not part of the work you agree to do together, and we don't supervise it.",
        },
        {
          heading: "What we ask of you",
          body: "Be honest about who you are. Keep phone numbers, emails and messaging handles out of public posts — that's what the verification is protecting. And treat the person on the other end like a colleague.",
        },
        {
          heading: "Money is between you two",
          body: "You agree payment directly with the other person, and it never passes through us. That also means we can't recover it for you if something goes wrong, so agree terms before you start.",
        },
        {
          heading: "How you could lose your account",
          body: "Posting contact details gets a warning the first two times and closes the account on the third. You'll always be shown the exact text that triggered it, because honest mistakes happen and should be fixable.",
        },
        {
          heading: "What we don't promise",
          body: "Verification tells you someone is real. It doesn't tell you they're good at the job, easy to work with, or going to hit your deadline. Use your judgement as you would anywhere else.",
        },
      ]}
    />
  );
}
