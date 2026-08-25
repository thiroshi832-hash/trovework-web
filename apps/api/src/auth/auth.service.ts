import { ConflictException, Inject, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { createHash, randomBytes } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { EMAIL_PROVIDER, type EmailProvider } from "./providers/email.provider";

const BCRYPT_ROUNDS = 12;

export interface AccessTokenPayload {
  sub: string;
  role: string;
  /** Verification state is a hint for the client; gated actions re-read the DB. */
  pv: boolean;
  iv: boolean;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
}

/** What the Google strategy hands us after validating the OAuth profile. */
export interface GoogleProfile {
  googleId: string;
  email: string;
  emailVerified: boolean;
  fullName: string;
}

/**
 * Either the Google user is known (or matched by email) and gets logged straight
 * in, or they're new and must finish signing up (role + location) — in which case
 * we hand back a short-lived token that carries their verified Google identity.
 */
export type GoogleAuthResult =
  | { kind: "authenticated"; userId: string; role: string; tokens: TokenPair }
  | { kind: "needs_signup"; pendingToken: string };

@Injectable()
export class AuthService {
  private readonly log = new Logger(AuthService.name);
  /** Emails that should always be admins, from ADMIN_EMAILS (comma-separated). */
  private readonly adminEmails: Set<string>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @Inject(EMAIL_PROVIDER) private readonly email: EmailProvider,
  ) {
    this.adminEmails = new Set(
      (this.config.get<string>("ADMIN_EMAILS", "") ?? "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean),
    );
  }

  /**
   * Bootstraps admins without a chicken-and-egg problem: an email listed in
   * ADMIN_EMAILS is promoted to admin on login/register, since registration
   * itself only allows client/freelancer. Returns the effective role. The
   * env list is the source of truth — a DB role is never *demoted* here, so
   * removing an email doesn't strip an existing admin (do that deliberately).
   */
  private async ensureAdminRole(userId: string, email: string, role: string): Promise<string> {
    if (role === "admin" || !this.adminEmails.has(email.toLowerCase())) return role;
    await this.prisma.user.update({ where: { id: userId }, data: { role: "admin" } });
    return "admin";
  }

  /* ------------------------------ registration ----------------------------- */

  async register(dto: RegisterDto, ip?: string | null): Promise<{ userId: string } & TokenPair> {
    const email = dto.email.trim().toLowerCase();

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      // Deliberately explicit: sign-up needs to tell you the address is taken.
      // The *login* path stays generic so it cannot be used to enumerate users.
      throw new ConflictException("An account with that email already exists.");
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
        fullName: dto.fullName.trim(),
        role: dto.role,
        country: dto.country.trim(),
        state: dto.state.trim(),
        postalCode: dto.postalCode.trim(),
        // Sign-up is also the first login — record both from the same request,
        // and log the login event so it counts toward daily active users.
        signupIp: ip ?? null,
        lastLoginIp: ip ?? null,
        lastLoginAt: new Date(),
        loginEvents: { create: {} },
      },
    });

    const role = await this.ensureAdminRole(user.id, user.email, user.role);
    return { userId: user.id, ...(await this.issueTokens(user.id, role, false, false)) };
  }

  /* --------------------------------- login --------------------------------- */

  async login(dto: LoginDto, ip?: string | null): Promise<{ userId: string } & TokenPair> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Hash even when the user is missing so a wrong address and a wrong
    // password take the same time — otherwise the endpoint leaks which
    // emails are registered.
    const hash = user?.passwordHash ?? "$2b$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidi";
    const ok = await bcrypt.compare(dto.password, hash);

    if (!user || !ok) throw new UnauthorizedException("Email or password is incorrect.");
    if (user.status === "banned") throw new UnauthorizedException("This account has been suspended.");

    // Record where this successful login came from, for admin oversight, and
    // log the event so it counts toward daily active users.
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginIp: ip ?? null, lastLoginAt: new Date(), loginEvents: { create: {} } },
    });

    const role = await this.ensureAdminRole(user.id, user.email, user.role);
    return {
      userId: user.id,
      ...(await this.issueTokens(user.id, role, user.phoneVerified, user.idVerified)),
    };
  }

  /* -------------------------------- refresh -------------------------------- */

  /**
   * Rotates the refresh token: the presented one is revoked and a new one
   * issued. Presenting an already-revoked token means it leaked, so every
   * session for that user is killed.
   */
  async refresh(presented: string): Promise<{ userId: string } & TokenPair> {
    const tokenHash = this.hashToken(presented);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored) throw new UnauthorizedException("Session expired. Please log in again.");

    if (stored.revokedAt) {
      await this.revokeAllForUser(stored.userId);
      throw new UnauthorizedException("Session expired. Please log in again.");
    }

    if (stored.expiresAt <= new Date()) {
      throw new UnauthorizedException("Session expired. Please log in again.");
    }

    if (stored.user.status === "banned") {
      await this.revokeAllForUser(stored.userId);
      throw new UnauthorizedException("This account has been suspended.");
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return {
      userId: stored.userId,
      ...(await this.issueTokens(
        stored.userId,
        stored.user.role,
        stored.user.phoneVerified,
        stored.user.idVerified,
      )),
    };
  }

  /* -------------------------------- logout --------------------------------- */

  async logout(presented: string | undefined): Promise<void> {
    if (!presented) return;
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: this.hashToken(presented), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /* ---------------------------- password reset ----------------------------- */

  /**
   * Starts a reset. Emails a one-time link ONLY when the address exists, but
   * the caller always gets the same answer, so this can't be used to discover
   * which emails have accounts. Issuing a new token invalidates the user's
   * older unused ones.
   */
  async requestPasswordReset(email: string): Promise<void> {
    const normalised = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email: normalised } });
    if (!user || user.status === "banned") return;

    // Retire any still-usable tokens so only the newest link works.
    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const token = randomBytes(32).toString("base64url");
    const ttlMs = this.ttlToMs(this.config.get<string>("PASSWORD_RESET_TTL", "1h"));
    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash: this.hashToken(token), expiresAt: new Date(Date.now() + ttlMs) },
    });

    const origin = this.config.get<string>("WEB_ORIGIN", "https://trovework.com");
    // Never let a mail-delivery failure surface to the caller: the endpoint must
    // stay neutral (a thrown error would 500 and reveal that the address exists).
    // The token is already stored; the user can retry if the mail didn't arrive.
    try {
      await this.email.sendPasswordReset(user.email, `${origin}/reset-password?token=${token}`);
    } catch (err) {
      this.log.error(`Failed to send password-reset email to ${user.email}: ${(err as Error)?.message}`);
    }
  }

  /**
   * Completes a reset: sets the new password, burns the token, and revokes every
   * refresh token so any session opened with the old password is killed.
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const stored = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: this.hashToken(token) },
    });
    if (!stored || stored.usedAt || stored.expiresAt <= new Date()) {
      throw new UnauthorizedException("This reset link is invalid or has expired.");
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: stored.userId },
        data: { passwordHash: await bcrypt.hash(newPassword, BCRYPT_ROUNDS) },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: stored.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: stored.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  /* ------------------------------- google oauth ---------------------------- */

  /** Distinguishes the short-lived signup token from a normal access token. */
  private static readonly GOOGLE_PENDING_TYP = "google_pending";

  /**
   * Called after Google validates the user. Logs in a known account (matched by
   * Google id, or by a verified email — which links the two), otherwise returns
   * a short-lived token so the new user can finish signing up with a role and
   * location.
   */
  async loginOrPrepareGoogle(profile: GoogleProfile): Promise<GoogleAuthResult> {
    if (!profile.emailVerified) {
      // Google should always verify its own accounts; refuse if it somehow didn't.
      throw new UnauthorizedException("Your Google email is not verified.");
    }
    const email = profile.email.trim().toLowerCase();

    const existing =
      (await this.prisma.user.findUnique({ where: { googleId: profile.googleId } })) ??
      (await this.prisma.user.findUnique({ where: { email } }));

    if (existing) {
      if (existing.status === "banned") throw new UnauthorizedException("This account has been suspended.");
      // First Google login for an email/password account links the two.
      if (!existing.googleId) {
        await this.prisma.user.update({ where: { id: existing.id }, data: { googleId: profile.googleId } });
      }
      const role = await this.ensureAdminRole(existing.id, existing.email, existing.role);
      return {
        kind: "authenticated",
        userId: existing.id,
        role,
        tokens: await this.issueTokens(existing.id, role, existing.phoneVerified, existing.idVerified),
      };
    }

    // New user — carry the verified identity in a signed, short-lived token.
    const pendingToken = await this.jwt.signAsync(
      { typ: AuthService.GOOGLE_PENDING_TYP, googleId: profile.googleId, email, name: profile.fullName },
      { secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"), expiresIn: "15m" },
    );
    return { kind: "needs_signup", pendingToken };
  }

  /**
   * Finishes a Google signup: validates the pending token, creates the account
   * with the role and location the user just chose, and logs them in.
   */
  async completeGoogleSignup(
    pendingToken: string,
    details: { role: "client" | "freelancer"; country: string; state: string; postalCode: string },
  ): Promise<{ userId: string } & TokenPair> {
    let payload: { typ?: string; googleId?: string; email?: string; name?: string };
    try {
      payload = await this.jwt.verifyAsync(pendingToken, {
        secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
      });
    } catch {
      throw new UnauthorizedException("Your sign-up session expired. Please start again.");
    }
    if (payload.typ !== AuthService.GOOGLE_PENDING_TYP || !payload.googleId || !payload.email) {
      throw new UnauthorizedException("Invalid sign-up session. Please start again.");
    }

    const email = payload.email.trim().toLowerCase();

    // If the account was created in the meantime (double submit, or they linked
    // via email elsewhere), just log them in rather than failing.
    const already =
      (await this.prisma.user.findUnique({ where: { googleId: payload.googleId } })) ??
      (await this.prisma.user.findUnique({ where: { email } }));
    if (already) {
      const role = await this.ensureAdminRole(already.id, already.email, already.role);
      return {
        userId: already.id,
        ...(await this.issueTokens(already.id, role, already.phoneVerified, already.idVerified)),
      };
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        googleId: payload.googleId,
        passwordHash: null, // no password — Google is the credential
        fullName: (payload.name ?? "").trim() || email.split("@")[0],
        role: details.role,
        country: details.country.trim(),
        state: details.state.trim(),
        postalCode: details.postalCode.trim(),
      },
    });

    const role = await this.ensureAdminRole(user.id, user.email, user.role);
    return { userId: user.id, ...(await this.issueTokens(user.id, role, false, false)) };
  }

  /* --------------------------------- lookup -------------------------------- */

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        phoneVerified: true,
        idVerified: true,
        strikeCount: true,
        country: true,
        state: true,
        createdAt: true,
        // A freelancer's profile photo, so the header avatar can show it.
        profile: { select: { photoPath: true } },
      },
    });
  }

  /* -------------------------------- internals ------------------------------- */

  /** SHA-256, not bcrypt: these are 256-bit random strings, not guessable secrets. */
  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  private async issueTokens(
    userId: string,
    role: string,
    phoneVerified: boolean,
    idVerified: boolean,
  ): Promise<TokenPair> {
    const payload: AccessTokenPayload = { sub: userId, role, pv: phoneVerified, iv: idVerified };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
      // Seconds, so the "15m" shorthand goes through one parser rather than
      // relying on the signer's own string handling.
      expiresIn: Math.floor(this.ttlToMs(this.config.get<string>("ACCESS_TOKEN_TTL", "15m")) / 1000),
    });

    const refreshToken = randomBytes(48).toString("base64url");
    const refreshExpiresAt = new Date(
      Date.now() + this.ttlToMs(this.config.get<string>("REFRESH_TOKEN_TTL", "7d")),
    );

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash: this.hashToken(refreshToken), expiresAt: refreshExpiresAt },
    });

    return { accessToken, refreshToken, refreshExpiresAt };
  }

  /** Accepts the "15m" / "7d" / "3600s" shorthand used in the env file. */
  ttlToMs(ttl: string): number {
    const m = /^(\d+)([smhd])$/.exec(ttl.trim());
    if (!m) throw new Error(`Invalid TTL: ${ttl}`);
    const n = Number(m[1]);
    const unit = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[m[2] as "s" | "m" | "h" | "d"];
    return n * unit;
  }
}
