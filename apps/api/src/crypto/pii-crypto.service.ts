import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const PREFIX = "v1"; // versioned so the scheme can change without ambiguity
const IV_BYTES = 12; // GCM standard nonce length
const KEY_BYTES = 32; // AES-256

/**
 * Field-level encryption for sensitive PII at rest (idNumber, dob) — NFR-SEC-2.
 * AES-256-GCM, so each value is authenticated: tampering fails the tag rather
 * than decrypting to garbage. The key comes from PII_ENCRYPTION_KEY (32 bytes,
 * hex or base64). Ciphertext is stored as "v1.<iv>.<tag>.<ct>" (base64url parts).
 *
 * Backward-compatible: decrypt() returns any value lacking the "v1." prefix
 * unchanged, so rows written before encryption was introduced still read.
 */
@Injectable()
export class PiiCryptoService {
  private readonly log = new Logger("PiiCryptoService");
  private readonly key: Buffer;

  constructor(config: ConfigService) {
    const raw = config.get<string>("PII_ENCRYPTION_KEY", "") ?? "";
    this.key = this.parseKey(raw);
  }

  encrypt(plaintext: string): string {
    const iv = randomBytes(IV_BYTES);
    const cipher = createCipheriv("aes-256-gcm", this.key, iv);
    const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return [PREFIX, b64(iv), b64(tag), b64(ct)].join(".");
  }

  decrypt(blob: string): string {
    if (!blob.startsWith(`${PREFIX}.`)) return blob; // legacy plaintext row
    const [, ivPart, tagPart, ctPart] = blob.split(".");
    const decipher = createDecipheriv("aes-256-gcm", this.key, unb64(ivPart));
    decipher.setAuthTag(unb64(tagPart));
    return Buffer.concat([decipher.update(unb64(ctPart)), decipher.final()]).toString("utf8");
  }

  private parseKey(raw: string): Buffer {
    if (!raw) {
      // A fixed dev key keeps local runs and tests working; production MUST set
      // its own (documented in .env.example / DEPLOYMENT). Warn loudly.
      this.log.warn("PII_ENCRYPTION_KEY is not set — using an insecure dev key. Set it in production.");
      return Buffer.alloc(KEY_BYTES, 7);
    }
    const key = /^[0-9a-f]{64}$/i.test(raw) ? Buffer.from(raw, "hex") : Buffer.from(raw, "base64");
    if (key.length !== KEY_BYTES) {
      throw new Error(`PII_ENCRYPTION_KEY must decode to ${KEY_BYTES} bytes (got ${key.length}).`);
    }
    return key;
  }
}

const b64 = (buf: Buffer) => buf.toString("base64url");
const unb64 = (s: string) => Buffer.from(s, "base64url");
