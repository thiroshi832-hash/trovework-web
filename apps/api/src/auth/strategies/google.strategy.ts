import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, type Profile, type VerifyCallback } from "passport-google-oauth20";
import type { GoogleProfile } from "../auth.service";

/**
 * Google OAuth 2.0. Constructs with harmless placeholders when the app runs
 * without Google configured, so the server still boots — the GoogleAuthGuard
 * refuses the routes with a clear 503 until real credentials are set.
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>("GOOGLE_CLIENT_ID") || "unconfigured",
      clientSecret: config.get<string>("GOOGLE_CLIENT_SECRET") || "unconfigured",
      callbackURL:
        config.get<string>("GOOGLE_CALLBACK_URL") || "http://localhost:4000/api/auth/google/callback",
      scope: ["email", "profile"],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback): void {
    const email = profile.emails?.[0];
    const result: GoogleProfile = {
      googleId: profile.id,
      email: email?.value ?? "",
      // The library reports verification as a boolean or the string "true".
      emailVerified: email?.verified === true || String(email?.verified) === "true",
      fullName: profile.displayName ?? "",
    };
    done(null, result);
  }
}
