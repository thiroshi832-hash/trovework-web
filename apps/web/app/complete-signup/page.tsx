import type { Metadata } from "next";
import { AuthCard } from "@/components/auth-card";
import { CompleteGoogleForm } from "@/components/complete-google-form";

export const metadata: Metadata = {
  title: "Finish signing up — Trovework",
  description: "Add the last details to finish creating your Trovework account.",
  robots: { index: false, follow: false },
};

export default function CompleteSignupPage() {
  return (
    <AuthCard>
      <CompleteGoogleForm />
    </AuthCard>
  );
}
