import { ConfigService } from "@nestjs/config";

/**
 * Whether an SMS provider can actually send a code. Mirrors the provider
 * selection in verification.module.ts: a real key sends, and outside production
 * the console stub stands in (the code is logged), so both count as "can send".
 * Only production-with-no-key cannot.
 */
export function smsConfigured(config: ConfigService): boolean {
  return (
    Boolean(config.get<string>("SEVEN_API_KEY")) ||
    config.get<string>("SMS_DEV_LOG") === "true" ||
    config.get<string>("NODE_ENV") !== "production"
  );
}

/**
 * Whether a freelancer must verify their phone before publishing.
 *
 * Defaults to "only when we can actually send a code" — so the gate switches
 * itself off when no SMS provider is linked (otherwise publishing would be
 * impossible), and back on the moment one is, with no code change. Operators
 * can force it either way with PHONE_VERIFICATION_REQUIRED=true|false.
 *
 * ID verification is unaffected — it remains required regardless.
 */
export function phoneVerificationRequired(config: ConfigService): boolean {
  const override = config.get<string>("PHONE_VERIFICATION_REQUIRED");
  if (override === "true") return true;
  if (override === "false") return false;
  return smsConfigured(config);
}
