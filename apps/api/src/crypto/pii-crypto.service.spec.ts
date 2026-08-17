import { ConfigService } from "@nestjs/config";
import { PiiCryptoService } from "./pii-crypto.service";

function make(key?: string) {
  const cfg: Record<string, string> = key ? { PII_ENCRYPTION_KEY: key } : {};
  return new PiiCryptoService({ get: (k: string, d?: string) => cfg[k] ?? d } as unknown as ConfigService);
}

const HEX_KEY = "a".repeat(64); // 32 bytes

describe("PiiCryptoService", () => {
  it("round-trips a value", () => {
    const svc = make(HEX_KEY);
    const blob = svc.encrypt("AB123456");
    expect(blob).not.toContain("AB123456");
    expect(blob.startsWith("v1.")).toBe(true);
    expect(svc.decrypt(blob)).toBe("AB123456");
  });

  it("produces a different ciphertext each time (random IV)", () => {
    const svc = make(HEX_KEY);
    expect(svc.encrypt("same")).not.toBe(svc.encrypt("same"));
  });

  it("fails to decrypt if the ciphertext is tampered with", () => {
    const svc = make(HEX_KEY);
    const blob = svc.encrypt("secret");
    const parts = blob.split(".");
    // Flip a byte in the ciphertext segment.
    const ct = Buffer.from(parts[3], "base64url");
    ct[0] ^= 0xff;
    parts[3] = ct.toString("base64url");
    expect(() => svc.decrypt(parts.join("."))).toThrow();
  });

  it("passes through legacy plaintext lacking the version prefix", () => {
    expect(make(HEX_KEY).decrypt("1990-04-12")).toBe("1990-04-12");
  });

  it("accepts a base64 key as well as hex", () => {
    const b64 = Buffer.alloc(32, 3).toString("base64");
    const svc = make(b64);
    expect(svc.decrypt(svc.encrypt("x"))).toBe("x");
  });

  it("rejects a key of the wrong length", () => {
    expect(() => make("deadbeef")).toThrow(/32 bytes/);
  });

  it("still works with no key (insecure dev fallback)", () => {
    const svc = make();
    expect(svc.decrypt(svc.encrypt("dev"))).toBe("dev");
  });
});
