import type { Metadata } from "next";
import { FreelancerDashboard } from "@/components/freelancer-dashboard";

export const metadata: Metadata = {
  title: "Dashboard — Trovework",
  description: "Manage your profile, posts, verification and conversations.",
  robots: { index: false, follow: false },
};

export default function FreelancerDashboardPage() {
  return (
    <div className="flex flex-1 flex-col bg-slate-50/60">
      <main className="flex-1">
        <FreelancerDashboard />
      </main>
    </div>
  );
}
