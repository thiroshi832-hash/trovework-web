import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { GoogleStrategy } from "./strategies/google.strategy";
import { GoogleAuthGuard } from "./guards/google-auth.guard";
import { GoogleOAuthExceptionFilter } from "./filters/google-oauth-exception.filter";
import { ConsoleEmailProvider, EMAIL_PROVIDER, type EmailProvider } from "./providers/email.provider";
import { SmtpEmailProvider } from "./providers/smtp-email.provider";

@Module({
  imports: [PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    // Registers the "google" passport strategy; the guard gates it on config.
    GoogleStrategy,
    GoogleAuthGuard,
    GoogleOAuthExceptionFilter,
    // Real SMTP email when credentials are set (SMTP_USER/SMTP_PASS), otherwise
    // the console stub that just logs the reset link.
    {
      provide: EMAIL_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService): EmailProvider =>
        config.get<string>("SMTP_USER") && config.get<string>("SMTP_PASS")
          ? new SmtpEmailProvider(config)
          : new ConsoleEmailProvider(),
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
