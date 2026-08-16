import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { AuthedUser } from "../strategies/jwt.strategy";

export const VERIFIED_KEY = "requiresVerification";
export type VerificationNeed = "phone" | "id" | "both";

/**
 * Guards the gated actions. @RequireVerified("both") is what a publish
 * endpoint uses; "id" is what contact-info and chat use.
 */
@Injectable()
export class VerifiedGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const need = this.reflector.getAllAndOverride<VerificationNeed>(VERIFIED_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!need) return true;

    const user: AuthedUser | undefined = context.switchToHttp().getRequest().user;
    if (!user) throw new ForbiddenException("Verification required.");

    const needPhone = need === "phone" || need === "both";
    const needId = need === "id" || need === "both";

    if (needPhone && !user.phoneVerified) {
      throw new ForbiddenException("Verify your phone number to continue.");
    }
    if (needId && !user.idVerified) {
      throw new ForbiddenException("Verify your identity to continue.");
    }
    return true;
  }
}
