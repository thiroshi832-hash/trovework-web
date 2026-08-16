import type { Metadata } from "next";
import { LegalPlaceholder } from "@/components/legal-placeholder";

export const metadata: Metadata = {
  title: "Privacy Policy — Trovework",
  description: "What Trovework collects, why, and how long it is kept — in plain words.",
};

export default function PrivacyPage() {
  return (
    <LegalPlaceholder
      title="Privacy Policy"
      lead="We ask for more than most sites — a photo of your ID, and a selfie. So you deserve a straight answer about where it goes."
      points={[
        {
          heading: "Your ID and your selfie",
          body: "We use them once, to check the face matches the document and the details match what you typed. They're encrypted, kept off the public web entirely, and are never shown on your profile or handed to another member.",
        },
        {
          heading: "Your profile",
          body: "Your name, headline, skills and rate are public — that's the point of them. Your Telegram, Discord and WhatsApp handles are not: the server releases those only to a client who has verified their own identity.",
        },
        {
          heading: "Your phone number",
          body: "Used to send you a one-time code and to make it harder for one person to run twenty accounts. It isn't shown to anyone else.",
        },
        {
          heading: "Getting it deleted",
          body: "Ask, and we delete it. Your ID images go too. If the law requires us to keep a record of a verification for a period, we'll tell you what and for how long rather than quietly holding on to it.",
        },
        {
          heading: "Who else gets it",
          body: "Nobody buys it from us — there's no advertising business here to sell it to. We use outside services for a couple of jobs, like sending the SMS code, and we'll name them here.",
        },
      ]}
    />
  );
}
