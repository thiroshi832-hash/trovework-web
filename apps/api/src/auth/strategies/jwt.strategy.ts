import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { Request } from "express";
import { PrismaService } from "../../prisma/prisma.service";
import type { AccessTokenPayload } from "../auth.service";

/** What lands on `req.user`. Read fresh from the DB, never trusted from the token. */
export interface AuthedUser {
  id: string;
  email: string;
  role: "client" | "freelancer" | "admin";
  status: "active" | "banned" | "pending";
  phoneVerified: boolean;
  idVerified: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.access_token ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>("JWT_ACCESS_SECRET"),
    });
  }

  /**
   * The token carries role and verification flags, but they go stale the moment
   * an admin bans someone or a verification passes. Gated decisions must use
   * current state, so re-read it here on every request.
   */
  async validate(payload: AccessTokenPayload): Promise<AuthedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        phoneVerified: true,
        idVerified: true,
      },
    });

    if (!user) throw new UnauthorizedException();
    if (user.status === "banned") throw new UnauthorizedException("This account has been suspended.");

    return user as AuthedUser;
  }
}
