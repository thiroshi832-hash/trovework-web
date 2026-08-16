import type { Metadata } from "next";
import { LegalPlaceholder } from "@/components/legal-placeholder";

export const metadata: Metadata = {
  title: "Privacy Policy — Trovework",
  description: "What personal data Trovework collects, why, and how long it is kept.",
};

export default function PrivacyPage() {
  return (
    <LegalPlaceholder
      title="Privacy Policy"
      summary="What we collect and why — including the identity documents used for verification, how they are secured, and how long they are kept."
    />
  );
}
