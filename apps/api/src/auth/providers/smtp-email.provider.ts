import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import type { EmailProvider } from "./email.provider";

/**
 * Real email delivery over SMTP (defaults tuned for Gmail). Bound to
 * EMAIL_PROVIDER only when SMTP_USER/SMTP_PASS are set (see AuthModule); until
 * then the console stub is used. For Gmail, SMTP_PASS must be an App Password,
 * not the account password.
 */
@Injectable()
export class SmtpEmailProvider implements EmailProvider {
  private readonly log = new Logger("SmtpEmailProvider");
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(config: ConfigService) {
    const host = config.get<string>("SMTP_HOST", "smtp.gmail.com");
    const port = Number(config.get<string>("SMTP_PORT", "465"));
    const user = config.getOrThrow<string>("SMTP_USER");
    const pass = config.getOrThrow<string>("SMTP_PASS");
    this.from = config.get<string>("SMTP_FROM") || `Trovework <${user}>`;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // 465 = implicit TLS; 587 = STARTTLS
      auth: { user, pass },
    });
  }

  async sendPasswordReset(email: string, resetUrl: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to: email,
      subject: "Reset your Trovework password",
      text:
        `We received a request to reset your Trovework password.\n\n` +
        `Reset it here (the link is valid for one hour):\n${resetUrl}\n\n` +
        `If you didn't request this, you can safely ignore this email — your password won't change.`,
      html: `
        <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;color:#0f172a">
          <h1 style="font-size:20px;margin:0 0 16px">Reset your password</h1>
          <p style="font-size:15px;line-height:1.6;color:#475569;margin:0 0 20px">
            We received a request to reset your Trovework password. Click the button below to choose a new one.
            This link is valid for one hour.
          </p>
          <p style="margin:0 0 24px">
            <a href="${resetUrl}" style="display:inline-block;background:#0a55ee;color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 24px;border-radius:8px">
              Reset password
            </a>
          </p>
          <p style="font-size:13px;line-height:1.6;color:#94a3b8;margin:0">
            If you didn't request this, you can safely ignore this email — your password won't change.
          </p>
        </div>`,
    });
    this.log.log(`Sent password-reset email to ${email}`);
  }
}
