import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { createHash, randomBytes } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

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
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

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

    return { userId: user.id, ...(await this.issueTokens(user.id, user.role, false, false)) };
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

    return {
      userId: user.id,
      ...(await this.issueTokens(user.id, user.role, user.phoneVerified, user.idVerified)),
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
