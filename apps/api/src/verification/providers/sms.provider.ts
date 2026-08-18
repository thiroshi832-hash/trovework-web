import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";

export const SMS_PROVIDER = Symbol("SMS_PROVIDER");

export interface SmsProvider {
  sendCode(phone: string, code: string): Promise<void>;
  /**
   * False when the provider cannot send at all — no credentials configured.
   * Checked before a code is generated or a send slot is claimed, so a feature
   * that is switched off costs the user nothing from their daily allowance.
   */
  readonly available: boolean;
}

/**
 * Dev/stub SMS: logs the code instead of sending it, so the phone flow can be
 * walked end to end without a seven.io account.
 */
@Injectable()
export class ConsoleSmsProvider implements SmsProvider {
  readonly available = true;
  private readonly log = new Logger("SmsProvider");
  async sendCode(phone: string, code: string): Promise<void> {
    this.log.warn(`[dev] SMS code for ${phone}: ${code}`);
  }
}

/**
 * Stands in when there is no SEVEN_API_KEY in production.
 *
 * The rest of the site is unaffected — this exists so a missing key takes out
 * phone verification only, rather than refusing to boot. What it must never do
 * is what ConsoleSmsProvider does: printing the code to a server log and
 * returning success would tell the user a message is on its way that nobody
 * will ever receive.
 */
@Injectable()
export class UnconfiguredSmsProvider implements SmsProvider {
  readonly available = false;
  private readonly log = new Logger("SmsProvider");

  constructor() {
    this.log.warn(
      "SEVEN_API_KEY is not set — phone verification is disabled. Everything else runs as normal.",
    );
  }

  async sendCode(): Promise<void> {
    throw new ServiceUnavailableException(
      "Phone verification is temporarily unavailable. Please try again later.",
    );
  }
}
