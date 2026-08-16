import type { Metadata } from "next";
import { ProfileEditForm } from "@/components/profile-edit-form";

export const metadata: Metadata = {
  title: "Edit your profile — Trovework",
  description: "Update your headline, skills, rate and contact details.",
  // Someone's own editor should never be indexed.
  robots: { index: false, follow: false },
};

export default function ProfileEditPage() {
  return (
    <div className="flex flex-1 flex-col bg-slate-50/60">
      <main className="flex-1">
        <div className="mx-auto max-w-page px-6 py-8">
          <h1 className="text-2xl font-bold tracking-tight text-navy-800 sm:text-3xl">
            Edit your profile
          </h1>
          <p className="mt-2 text-base text-slate-500">
            This is what clients see when they find you in search.
          </p>

          <div className="mt-8">
            <ProfileEditForm />
          </div>
        </div>
      </main>
    </div>
  );
}
