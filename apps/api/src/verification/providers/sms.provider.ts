import { Injectable, Logger } from "@nestjs/common";

export const SMS_PROVIDER = Symbol("SMS_PROVIDER");

export interface SmsProvider {
  sendCode(phone: string, code: string): Promise<void>;
}

/**
 * Dev/stub SMS: logs the code instead of sending it. Lets the phone flow work
 * end to end without a Twilio account. Swap for a TwilioSmsProvider (same
 * interface) by binding SMS_PROVIDER in the module when credentials exist.
 */
@Injectable()
export class ConsoleSmsProvider implements SmsProvider {
  private readonly log = new Logger("SmsProvider");
  async sendCode(phone: string, code: string): Promise<void> {
    this.log.warn(`[dev] SMS code for ${phone}: ${code}`);
  }
}
