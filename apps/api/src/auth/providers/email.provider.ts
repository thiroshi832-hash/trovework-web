import { Injectable, Logger } from "@nestjs/common";

export const EMAIL_PROVIDER = Symbol("EMAIL_PROVIDER");

export interface EmailProvider {
  /** Sends a password-reset link. `resetUrl` already carries the one-time token. */
  sendPasswordReset(email: string, resetUrl: string): Promise<void>;
}

/**
 * Dev/stub email: logs the reset link instead of sending it, so the flow works
 * end to end without an SMTP account. Swap for an SmtpEmailProvider (same
 * interface) by binding EMAIL_PROVIDER in the module when credentials exist.
 */
@Injectable()
export class ConsoleEmailProvider implements EmailProvider {
  private readonly log = new Logger("EmailProvider");
  async sendPasswordReset(email: string, resetUrl: string): Promise<void> {
    this.log.warn(`[dev] Password-reset link for ${email}: ${resetUrl}`);
  }
}
