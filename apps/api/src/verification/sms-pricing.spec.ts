import {
  ALWAYS_ALLOWED,
  ALWAYS_BLOCKED,
  BLOCKED_COUNTRIES,
  BLOCK_AT_OR_ABOVE_EUR,
  SMS_PRICE_EUR,
  isCountryBlocked,
  priceFor,
} from "./sms-pricing";
import { parsePhone } from "./phone-number";

describe("SMS destination pricing", () => {
  it("blocks exactly the countries the two rules select (price ceiling now off)", () => {
    for (const [iso, price] of Object.entries(SMS_PRICE_EUR)) {
      const expected =
        !ALWAYS_ALLOWED.has(iso) && (price >= BLOCK_AT_OR_ABOVE_EUR || ALWAYS_BLOCKED.has(iso));
      expect(isCountryBlocked(iso)).toBe(expected);
    }
  });

  it("has price-based blocking turned off", () => {
    expect(BLOCK_AT_OR_ABOVE_EUR).toBe(Infinity);
  });

  it("blocks the policy list even though the price would allow it", () => {
    for (const iso of ALWAYS_BLOCKED) {
      expect(isCountryBlocked(iso)).toBe(true);
    }
    // India is the case this exists for: cheap, but blocked on purpose.
    expect(SMS_PRICE_EUR.IN).toBeLessThan(BLOCK_AT_OR_ABOVE_EUR);
    expect(isCountryBlocked("IN")).toBe(true);
    expect(isCountryBlocked("in")).toBe(true);
  });

  it("now sends to what used to be the expensive destinations", () => {
    // Previously refused on price; with the ceiling lifted these all go through.
    const nowAllowed = ["MG", "RU", "BA", "RS", "PK", "ID", "NG", "BD", "IR", "EG", "SA", "UA", "PH", "MY", "PF"];
    for (const iso of nowAllowed) expect(isCountryBlocked(iso)).toBe(false);
  });

  it("still sends to the cheap destinations", () => {
    const expected = ["DE", "GB", "US", "CA", "FR", "JP", "KR", "BR", "ZA", "AU", "CN"];
    for (const iso of expected) expect(isCountryBlocked(iso)).toBe(false);
  });

  it("fails closed on a country it has no rate for", () => {
    expect(isCountryBlocked("ZZ")).toBe(true);
    expect(isCountryBlocked(undefined)).toBe(true);
    expect(isCountryBlocked(null)).toBe(true);
    expect(isCountryBlocked("")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(isCountryBlocked("in")).toBe(true); // policy-blocked
    expect(isCountryBlocked("de")).toBe(false);
  });

  it("reports the rate it would pay", () => {
    expect(priceFor("DE")).toBe(0.075);
    expect(priceFor("MG")).toBe(0.468);
    expect(priceFor("ZZ")).toBeNull();
  });

  it("covers the whole quoted price list", () => {
    expect(Object.keys(SMS_PRICE_EUR)).toHaveLength(231);
    // Price blocking is off; only India remains, on the policy list.
    expect(BLOCKED_COUNTRIES.size).toBe(1);
  });
});

describe("phone number parsing", () => {
  it("normalises to E.164", () => {
    expect(parsePhone("+49 151 12345678")?.e164).toBe("+4915112345678");
    expect(parsePhone("4915112345678")?.e164).toBe("+4915112345678");
    expect(parsePhone(" +49 (151) 123-456-78 ")?.e164).toBe("+4915112345678");
  });

  it("rejects nonsense rather than paying to find out", () => {
    expect(parsePhone("")).toBeNull();
    expect(parsePhone("+1")).toBeNull();
    expect(parsePhone("not a phone")).toBeNull();
    expect(parsePhone("+49 1")).toBeNull();
  });

  /**
   * The reason country resolution can't be done on the dial prefix: these all
   * start +1 but resolve to six different countries. None are blocked now that
   * the price ceiling is lifted, but the resolution still has to be exact for
   * per-send pricing and logging.
   */
  it.each([
    ["+1 212 555 0123", "US", false],
    ["+1 416 555 0123", "CA", false],
    ["+1 876 555 0123", "JM", false],
    ["+1 246 555 0123", "BB", false],
    ["+1 868 555 0123", "TT", false],
    ["+1 787 555 0123", "PR", false],
  ])("resolves %s to %s (blocked: %s)", (input, iso, blocked) => {
    const parsed = parsePhone(input);
    expect(parsed?.country).toBe(iso);
    expect(isCountryBlocked(parsed?.country)).toBe(blocked);
  });

  it("splits +7 between Russia and Kazakhstan (different rates, both now sendable)", () => {
    expect(parsePhone("+7 916 123 4567")?.country).toBe("RU");
    expect(parsePhone("+7 701 123 4567")?.country).toBe("KZ");
    expect(priceFor("RU")).toBe(0.39);
    expect(priceFor("KZ")).toBe(0.177);
  });
});
