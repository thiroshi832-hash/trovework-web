import type { Metadata } from "next";
import { ClientDashboard } from "@/components/client-dashboard";

export const metadata: Metadata = {
  title: "Dashboard — Trovework",
  description: "Your conversations, verification status and recommended freelancers.",
  robots: { index: false, follow: false },
};

export default function ClientDashboardPage() {
  return (
    <div className="flex flex-1 flex-col bg-slate-50/60">
      <main className="flex-1">
        <ClientDashboard />
      </main>
    </div>
  );
}
