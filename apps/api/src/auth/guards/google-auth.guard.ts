import { ExecutionContext, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "@nestjs/passport";

/**
 * Drives the Google OAuth redirect. Refuses with a clear 503 when Google isn't
 * configured, so the routes exist but fail loudly instead of bouncing the user
 * to Google with placeholder credentials. Stateless — no server session.
 */
@Injectable()
export class GoogleAuthGuard extends AuthGuard("google") {
  constructor(private readonly config: ConfigService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    if (!this.config.get<string>("GOOGLE_CLIENT_ID")) {
      throw new ServiceUnavailableException("Google sign-in is not configured.");
    }
    return super.canActivate(context);
  }

  getAuthenticateOptions() {
    return { session: false };
  }
}
