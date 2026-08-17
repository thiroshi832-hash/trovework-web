import { ArgumentsHost, Catch, ExceptionFilter, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Response } from "express";

/**
 * Anything thrown while completing the Google OAuth callback — a bad client
 * secret, a token-exchange failure, or the user cancelling on Google's screen —
 * happens inside Passport (the guard), so the route handler's own try/catch
 * never sees it. Without this, the user gets a raw 500 JSON. This lands them
 * back on the login page with a flag the page can explain.
 */
@Catch()
export class GoogleOAuthExceptionFilter implements ExceptionFilter {
  private readonly log = new Logger("GoogleOAuth");

  constructor(private readonly config: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    this.log.warn(`Google sign-in failed: ${(exception as Error)?.message ?? exception}`);
    const res = host.switchToHttp().getResponse<Response>();
    const origin = this.config.get<string>("WEB_ORIGIN", "https://trovework.com");
    res.redirect(`${origin}/login?error=google`);
  }
}
