import { ConflictException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
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

@Injectable()
export class AuthService {
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

  async register(dto: RegisterDto): Promise<{ userId: string } & TokenPair> {
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
      },
    });

    const role = await this.ensureAdminRole(user.id, user.email, user.role);
    return { userId: user.id, ...(await this.issueTokens(user.id, role, false, false)) };
  }

  /* --------------------------------- login --------------------------------- */

  async login(dto: LoginDto): Promise<{ userId: string } & TokenPair> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Hash even when the user is missing so a wrong address and a wrong
    // password take the same time — otherwise the endpoint leaks which
    // emails are registered.
    const hash = user?.passwordHash ?? "$2b$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidi";
    const ok = await bcrypt.compare(dto.password, hash);

    if (!user || !ok) throw new UnauthorizedException("Email or password is incorrect.");
    if (user.status === "banned") throw new UnauthorizedException("This account has been suspended.");

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
    await this.email.sendPasswordReset(user.email, `${origin}/reset-password?token=${token}`);
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
