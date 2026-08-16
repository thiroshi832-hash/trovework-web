import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/password-reset-forms";
import { AuthCard } from "@/components/auth-card";

export const metadata: Metadata = {
  title: "Forgot your password — Trovework",
  description: "Request a link to reset your Trovework password.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard>
      <ForgotPasswordForm />
    </AuthCard>
  );
}
