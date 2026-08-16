import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/password-reset-forms";
import { AuthCard } from "@/components/auth-card";

export const metadata: Metadata = {
  title: "Choose a new password — Trovework",
  description: "Set a new password for your Trovework account.",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <AuthCard>
      {/* The server validates the token; the page only needs to know one arrived. */}
      <ResetPasswordForm hasToken={!!token} />
    </AuthCard>
  );
}
