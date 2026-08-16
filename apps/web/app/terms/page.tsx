import type { Metadata } from "next";
import { LegalPlaceholder } from "@/components/legal-placeholder";

export const metadata: Metadata = {
  title: "Terms of Service — Trovework",
  description: "The terms under which Trovework may be used.",
};

export default function TermsPage() {
  return (
    <LegalPlaceholder
      title="Terms of Service"
      summary="The rules for using Trovework: what we provide, what we expect of members, and the limits of our responsibility."
    />
  );
}
