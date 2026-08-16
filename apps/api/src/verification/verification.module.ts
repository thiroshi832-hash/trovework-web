import { Module } from "@nestjs/common";
import { VerificationController } from "./verification.controller";
import { AdminVerificationController } from "./admin-verification.controller";
import { VerificationService } from "./verification.service";
import { SecuredStorageService } from "../storage/secured-storage.service";
import { SMS_PROVIDER, ConsoleSmsProvider } from "./providers/sms.provider";
import { VERIFICATION_PROVIDER, ManualVerificationProvider } from "./providers/verification.provider";

@Module({
  controllers: [VerificationController, AdminVerificationController],
  providers: [
    VerificationService,
    SecuredStorageService,
    // Swap these bindings for Twilio / an auto engine when ready — nothing else changes.
    { provide: SMS_PROVIDER, useClass: ConsoleSmsProvider },
    { provide: VERIFICATION_PROVIDER, useClass: ManualVerificationProvider },
  ],
})
export class VerificationModule {}
