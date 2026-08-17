import type { Metadata } from "next";
import { PublicProfile } from "@/components/public-profile";

export const metadata: Metadata = {
  title: "Freelancer profile — Trovework",
  description: "View a verified freelancer's services, skills and reviews on Trovework.",
};

export default async function FreelancerProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // The profile (and per-viewer contact gating) is fetched client-side so the
  // API can gate contact handles against the viewer's own session cookie.
  return <PublicProfile slug={slug} />;
}
