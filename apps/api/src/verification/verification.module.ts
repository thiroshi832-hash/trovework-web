import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { VerificationController } from "./verification.controller";
import { AdminVerificationController } from "./admin-verification.controller";
import { VerificationService } from "./verification.service";
import { SecuredStorageService } from "../storage/secured-storage.service";
import { PiiCryptoService } from "../crypto/pii-crypto.service";
import { SMS_PROVIDER, ConsoleSmsProvider, type SmsProvider } from "./providers/sms.provider";
import { SevenSmsProvider } from "./providers/seven-sms.provider";
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
    // A SEVEN_API_KEY sends real SMS; without one the code is logged instead so
    // the flow still works locally. In production a missing key is fatal at
    // boot — the alternative is a live site printing verification codes to
    // stdout and reporting them as sent, which nobody would notice.
    {
      provide: SMS_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService): SmsProvider => {
        if (config.get<string>("SEVEN_API_KEY")) return new SevenSmsProvider(config);
        if (config.get<string>("NODE_ENV") === "production") {
          throw new Error("SEVEN_API_KEY is required in production — refusing to start without it.");
        }
        return new ConsoleSmsProvider();
      },
    },
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
