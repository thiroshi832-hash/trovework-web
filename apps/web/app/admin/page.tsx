import type { Metadata } from "next";
import { AdminPanel } from "@/components/admin-panel";

export const metadata: Metadata = {
  title: "Moderation — Trovework",
  description: "Review violations, borderline verifications, blocked posts and banned accounts.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="flex flex-1 flex-col bg-slate-50/60">
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <h1 className="text-2xl font-bold tracking-tight text-navy-800 sm:text-3xl">Moderation</h1>
          <p className="mt-2 text-base text-slate-500">
            Violations, borderline verifications, blocked posts and banned accounts.
          </p>
          <div className="mt-8">
            <AdminPanel />
          </div>
        </div>
      </main>
    </div>
  );
}
