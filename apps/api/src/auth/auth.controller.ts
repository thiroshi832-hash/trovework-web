import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseFilters,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Throttle } from "@nestjs/throttler";
import type { Request, Response } from "express";
import { AuthService, type GoogleProfile, type TokenPair } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { CompleteGoogleDto } from "./dto/complete-google.dto";
import { phoneRequiredFor } from "../verification/phone-policy";
import { Public } from "./decorators/public.decorator";
import { GoogleAuthGuard } from "./guards/google-auth.guard";
import { GoogleOAuthExceptionFilter } from "./filters/google-oauth-exception.filter";
import { CurrentUser } from "./decorators/current-user.decorator";
import type { AuthedUser } from "./strategies/jwt.strategy";

const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";
const SESSION_COOKIE = "session";
const GOOGLE_PENDING_COOKIE = "google_pending";

/** Where a role lands after auth — mirrors the web client's homeFor(). */
function homeFor(role: string): string {
  if (role === "admin") return "/admin";
  return role === "freelancer" ? "/dashboard/freelancer" : "/dashboard/client";
}

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
    // A non-secret marker the edge middleware can see on every path (the refresh
    // token is scoped to /api/auth and the access token expires in 15 min, so
    // neither is visible for a navigation gate). It just says "this browser has
    // a refreshable session" — real authorization still happens on every API
    // call. Same lifetime as the refresh token.
    res.cookie(SESSION_COOKIE, "1", { ...common, expires: tokens.refreshExpiresAt });
  }

  private clearCookies(res: Response) {
    const secure = this.config.get<string>("NODE_ENV") !== "development";
    const common = { httpOnly: true, secure, sameSite: "lax" as const };
    res.clearCookie(ACCESS_COOKIE, { ...common, path: "/" });
    res.clearCookie(REFRESH_COOKIE, { ...common, path: "/api/auth" });
    res.clearCookie(SESSION_COOKIE, { ...common, path: "/" });
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

  /**
   * Always 202, whether or not the address exists — the response must not reveal
   * which emails are registered. Tightly throttled to blunt email-bombing.
   */
  @Public()
  @HttpCode(202)
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post("forgot-password")
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.auth.requestPasswordReset(dto.email);
    return { ok: true };
  }

  /** Consumes the one-time token, sets the new password, and clears any session cookies. */
  @Public()
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("reset-password")
  async resetPassword(@Body() dto: ResetPasswordDto, @Res({ passthrough: true }) res: Response) {
    await this.auth.resetPassword(dto.token, dto.password);
    this.clearCookies(res);
    return { ok: true };
  }

  /* ------------------------------- google oauth ---------------------------- */

  /** Kicks off the OAuth redirect (the guard sends the browser to Google). */
  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get("google")
  googleStart() {
    // The guard redirects to Google; this body never runs.
  }

  /**
   * Google redirects here. A known user is logged straight in; a new one is sent
   * to /complete-signup carrying a short-lived pending token in an httpOnly cookie
   * (never in the URL) to finish with a role and location.
   */
  @Public()
  @UseGuards(GoogleAuthGuard)
  @UseFilters(GoogleOAuthExceptionFilter)
  @Get("google/callback")
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const origin = this.config.get<string>("WEB_ORIGIN", "https://trovework.com");
    try {
      const result = await this.auth.loginOrPrepareGoogle(req.user as GoogleProfile);
      if (result.kind === "authenticated") {
        this.setCookies(res, result.tokens);
        return res.redirect(`${origin}${homeFor(result.role)}`);
      }
      const secure = this.config.get<string>("NODE_ENV") !== "development";
      res.cookie(GOOGLE_PENDING_COOKIE, result.pendingToken, {
        httpOnly: true,
        secure,
        sameSite: "lax",
        path: "/api/auth",
        maxAge: 15 * 60_000,
      });
      return res.redirect(`${origin}/complete-signup`);
    } catch {
      return res.redirect(`${origin}/login?error=google`);
    }
  }

  /** Finishes a Google signup using the pending cookie plus the chosen role/location. */
  @Public()
  @HttpCode(200)
  @Post("google/complete")
  async googleComplete(
    @Body() dto: CompleteGoogleDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const pending = req.cookies?.[GOOGLE_PENDING_COOKIE];
    if (!pending) throw new UnauthorizedException("Your sign-up session expired. Please start again.");

    const { userId, ...tokens } = await this.auth.completeGoogleSignup(pending, dto);
    this.setCookies(res, tokens);
    const secure = this.config.get<string>("NODE_ENV") !== "development";
    res.clearCookie(GOOGLE_PENDING_COOKIE, { httpOnly: true, secure, sameSite: "lax", path: "/api/auth" });
    return { userId };
  }

  /** Who am I — the frontend's session check. */
  @Get("me")
  async me(@CurrentUser() user: AuthedUser) {
    const me = await this.auth.findById(user.id);
    // Per-user: whether this account must verify a phone. Off for US accounts
    // (US A2P SMS needs 10DLC) and when no provider is linked, so the client
    // hides the phone step accordingly.
    return { ...me, phoneVerificationRequired: phoneRequiredFor(this.config, me?.country) };
  }
}
