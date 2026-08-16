import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Throttle } from "@nestjs/throttler";
import type { Request, Response } from "express";
import { AuthService, type TokenPair } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { Public } from "./decorators/public.decorator";
import { CurrentUser } from "./decorators/current-user.decorator";
import type { AuthedUser } from "./strategies/jwt.strategy";

const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Tokens live in httpOnly cookies so page scripts cannot read them; an XSS
   * bug then cannot walk off with a session. The refresh cookie is scoped to
   * the refresh path so it is not sent with every ordinary request.
   */
  private setCookies(res: Response, tokens: TokenPair) {
    const secure = this.config.get<string>("NODE_ENV") !== "development";
    const common = { httpOnly: true, secure, sameSite: "lax" as const, path: "/" };

    res.cookie(ACCESS_COOKIE, tokens.accessToken, {
      ...common,
      maxAge: this.auth.ttlToMs(this.config.get<string>("ACCESS_TOKEN_TTL", "15m")),
    });
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
      ...common,
      path: "/api/auth",
      expires: tokens.refreshExpiresAt,
    });
  }

  private clearCookies(res: Response) {
    const secure = this.config.get<string>("NODE_ENV") !== "development";
    const common = { httpOnly: true, secure, sameSite: "lax" as const };
    res.clearCookie(ACCESS_COOKIE, { ...common, path: "/" });
    res.clearCookie(REFRESH_COOKIE, { ...common, path: "/api/auth" });
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("register")
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { userId, ...tokens } = await this.auth.register(dto);
    this.setCookies(res, tokens);
    return { userId };
  }

  @Public()
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post("login")
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { userId, ...tokens } = await this.auth.login(dto);
    this.setCookies(res, tokens);
    return { userId };
  }

  @Public()
  @HttpCode(200)
  @Post("refresh")
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const presented = req.cookies?.[REFRESH_COOKIE];
    if (!presented) throw new UnauthorizedException("Session expired. Please log in again.");

    try {
      const { userId, ...tokens } = await this.auth.refresh(presented);
      this.setCookies(res, tokens);
      return { userId };
    } catch (err) {
      this.clearCookies(res);
      throw err;
    }
  }

  @Public()
  @HttpCode(204)
  @Post("logout")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.auth.logout(req.cookies?.[REFRESH_COOKIE]);
    this.clearCookies(res);
  }

  /** Who am I — the frontend's session check. */
  @Get("me")
  async me(@CurrentUser() user: AuthedUser) {
    return this.auth.findById(user.id);
  }
}
