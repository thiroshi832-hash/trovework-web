import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { SmsProvider } from "./sms.provider";

const ENDPOINT = "https://gateway.seven.io/api/sms";
const TIMEOUT_MS = 10_000;

/** Gateway status codes worth naming. 100 is the only success. */
const STATUS_MEANING: Record<string, string> = {
  "101": "the gateway accepted only part of the request",
  "201": "the sender ID was rejected",
  "202": "the recipient number was rejected",
  "300": "the gateway rejected the sender",
  "301": "no recipient was supplied",
  "305": "the message text was rejected",
  "401": "the message text was too long",
  "402": "an identical message went to this number in the last 180 seconds",
  "403": "this number has hit the gateway's daily limit",
  "500": "the seven.io account is out of credit",
  "600": "the gateway failed to transmit",
  "900": "the seven.io API key was rejected",
  "902": "the API key lacks permission for the SMS endpoint",
  "903": "this server's IP is not on the seven.io allowlist",
};

export class SmsSendError extends Error {
  constructor(
    readonly status: string,
    message: string,
  ) {
    super(message);
    this.name = "SmsSendError";
  }
}

/**
 * Sends verification codes through seven.io.
 *
 * Only the status code is trusted for success/failure. The gateway answers 200
 * OK with a status of "900" for a bad API key, so treating the HTTP status as
 * the result would silently swallow an outage and report codes as delivered
 * that were never sent.
 */
@Injectable()
export class SevenSmsProvider implements SmsProvider {
  private readonly log = new Logger("SevenSms");

  constructor(private readonly config: ConfigService) {}

  async sendCode(phone: string, code: string): Promise<void> {
    const apiKey = this.config.getOrThrow<string>("SEVEN_API_KEY");
    const from = this.config.get<string>("SEVEN_SMS_FROM", "Trovework");

    // seven.io dedupes identical texts to the same number for 180 seconds
    // (status 402). The code differs every send, so a legitimate resend is
    // never mistaken for a duplicate.
    const body = {
      to: phone,
      from,
      text: `${code} is your Trovework verification code. It expires in 10 minutes.`,
      // Groups the spend under one label in the seven.io dashboard.
      label: "verification",
    };

    let res: Response;
    try {
      res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "X-Api-Key": apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (err) {
      this.log.error(`seven.io unreachable: ${err instanceof Error ? err.message : String(err)}`);
      throw new SmsSendError("network", "Could not reach the SMS gateway.");
    }

    const raw = await res.text();
    const status = this.readStatus(raw);

    if (status !== "100") {
      const why = STATUS_MEANING[status] ?? `the gateway returned ${status}`;
      // The code itself is never logged; the number is what we need to trace.
      this.log.error(`seven.io refused ${phone}: ${status} — ${why}`);
      throw new SmsSendError(status, why);
    }

    this.log.log(`Verification SMS accepted for ${phone}`);
  }

  /**
   * The gateway replies with JSON (`{"success":"100",…}`), but the older plain
   * status-code body is still what comes back on some error paths, so accept
   * either rather than throwing while parsing an error we could have reported.
   */
  private readStatus(raw: string): string {
    const text = raw.trim();
    try {
      const parsed = JSON.parse(text) as { success?: unknown };
      if (parsed && typeof parsed === "object" && parsed.success != null) {
        return String(parsed.success);
      }
    } catch {
      // Not JSON — fall through to the bare-code form.
    }
    return /^\d{3}$/.test(text) ? text : "unknown";
  }
}
