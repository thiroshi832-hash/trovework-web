import { SetMetadata } from "@nestjs/common";
import { VERIFIED_KEY, type VerificationNeed } from "../guards/verified.guard";

export const RequireVerified = (need: VerificationNeed) => SetMetadata(VERIFIED_KEY, need);
