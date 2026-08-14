import type { Metadata } from "next";
import { IdUploadForm } from "@/components/id-upload-form";
import { VerifyShell } from "@/components/verify-shell";
import { ShieldCheckSolid } from "@/components/icons";

export const metadata: Metadata = {
  title: "Verify your identity — Trovework",
  description:
    "Upload your ID and take a selfie so Trovework can confirm your identity. Your documents are encrypted and never made public.",
};

const STEPS = ["Upload your ID card", "Take a selfie", "Enter your information"];

export default function IdVerificationPage() {
  return (
    <VerifyShell
      panel={
        <>
          <h2 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
            Verify your identity to build trust.
          </h2>
          <p className="mt-5 max-w-sm text-base leading-relaxed text-brand-100">
            We use our secure verification engine to confirm your identity.
          </p>

          <ol className="mt-9 space-y-6">
            {STEPS.map((label, i) => (
              <li key={label} className="flex items-center gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-sm font-semibold text-white ring-1 ring-white/20">
                  {i + 1}
                </span>
                <span className="text-base text-white">{label}</span>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex items-start gap-3 border-t border-white/10 pt-6">
            <ShieldCheckSolid className="h-7 w-7 shrink-0 text-white/70" />
            <p className="text-sm leading-relaxed text-brand-100">
              Your data is encrypted and kept secure.
            </p>
          </div>
        </>
      }
    >
      <IdUploadForm />
    </VerifyShell>
  );
}
