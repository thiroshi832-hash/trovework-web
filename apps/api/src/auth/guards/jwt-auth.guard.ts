import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

/**
 * Applied globally. Two modes, chosen per route:
 *
 *  - Protected (default): a valid session is required, else 401.
 *  - @Public(): no session required — but if a valid cookie IS present, the
 *    viewer is still attached to the request. This "optional auth" is what lets
 *    a browse or public-profile route stay open to anonymous visitors while
 *    still knowing who a logged-in viewer is, so it can decide whether to
 *    release gated contact info.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  private isPublic(context: ExecutionContext): boolean {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  canActivate(context: ExecutionContext) {
    // Always run the strategy so a present cookie populates req.user. Whether a
    // missing/invalid one is fatal is decided in handleRequest.
    return super.canActivate(context);
  }

  handleRequest<TUser>(err: unknown, user: TUser, _info: unknown, context: ExecutionContext): TUser {
    if (this.isPublic(context)) {
      // Optional: attach the viewer if we have one, never reject.
      return (user ?? null) as TUser;
    }
    if (err || !user) {
      throw err instanceof Error ? err : new UnauthorizedException();
    }
    return user;
  }
}
