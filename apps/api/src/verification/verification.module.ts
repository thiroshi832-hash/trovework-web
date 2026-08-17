import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { VerificationController } from "./verification.controller";
import { AdminVerificationController } from "./admin-verification.controller";
import { VerificationService } from "./verification.service";
import { SecuredStorageService } from "../storage/secured-storage.service";
import { PiiCryptoService } from "../crypto/pii-crypto.service";
import { SMS_PROVIDER, ConsoleSmsProvider } from "./providers/sms.provider";
import {
  VERIFICATION_PROVIDER,
  ManualVerificationProvider,
  type VerificationProvider,
} from "./providers/verification.provider";
import { AutoVerificationProvider } from "./providers/auto-verification.provider";

@Module({
  controllers: [VerificationController, AdminVerificationController],
  providers: [
    VerificationService,
    SecuredStorageService,
    PiiCryptoService,
    { provide: SMS_PROVIDER, useClass: ConsoleSmsProvider },
    // ID_VERIFY_ENGINE=auto turns on the face-match + OCR engine; anything else
    // (the default) keeps every submission going to a human reviewer.
    {
      provide: VERIFICATION_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService): VerificationProvider =>
        config.get<string>("ID_VERIFY_ENGINE") === "auto"
          ? new AutoVerificationProvider(config)
          : new ManualVerificationProvider(),
    },
  ],
})
export class VerificationModule {}
