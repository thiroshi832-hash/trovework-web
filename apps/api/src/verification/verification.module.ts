import { Logger, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { VerificationController } from "./verification.controller";
import { AdminVerificationController } from "./admin-verification.controller";
import { VerificationService } from "./verification.service";
import { SecuredStorageService } from "../storage/secured-storage.service";
import { PiiCryptoService } from "../crypto/pii-crypto.service";
import {
  SMS_PROVIDER,
  ConsoleSmsProvider,
  UnconfiguredSmsProvider,
  type SmsProvider,
} from "./providers/sms.provider";
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
    // A SEVEN_API_KEY sends real SMS. Without one, development logs the code
    // to the console so the flow can still be walked; production gets a
    // provider that refuses at send time. Either way the app boots and every
    // other feature works — only phone verification is affected, and it fails
    // honestly rather than reporting a message nobody will receive.
    {
      provide: SMS_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService): SmsProvider => {
        if (config.get<string>("SEVEN_API_KEY")) return new SevenSmsProvider(config);
        // The console stub logs the code instead of sending it, so the whole
        // phone flow can be exercised before an SMS account exists — you read
        // the code from the server log. It runs automatically outside
        // production, and in a production-mode dev/staging deploy when
        // SMS_DEV_LOG=true is set explicitly. It must never be on for real
        // users: it would report a code as sent that nobody receives.
        const devLog = config.get<string>("SMS_DEV_LOG") === "true";
        if (devLog || config.get<string>("NODE_ENV") !== "production") {
          if (devLog && config.get<string>("NODE_ENV") === "production") {
            new Logger("SmsProvider").warn(
              "SMS_DEV_LOG is on in production — verification codes are written to the log, not texted. Turn it off before real users sign up.",
            );
          }
          return new ConsoleSmsProvider();
        }
        return new UnconfiguredSmsProvider();
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
