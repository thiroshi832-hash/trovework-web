import { scanForContact, scanPost } from "./contact-scan";

const kinds = (t: string) => scanForContact(t).map((l) => l.kind);

describe("contact scanner", () => {
  describe("catches real contact info", () => {
    it("phone numbers in various formats", () => {
      for (const n of [
        "call me on 555 123 4567",
        "+1 (555) 123-4567",
        "07700 900123",
        "reach me: 5551234567",
      ]) {
        expect(kinds(n)).toContain("phone");
      }
    });

    it("email addresses", () => {
      expect(kinds("write to marisol.r@example.co.uk")).toContain("email");
      expect(kinds("me+work@sub.domain.io")).toContain("email");
    });

    it("links", () => {
      expect(kinds("see https://example.com/portfolio")).toContain("link");
      expect(kinds("at www.my-site.com")).toContain("link");
    });

    it("@usernames", () => {
      expect(kinds("dm @marisol_cleans")).toContain("handle");
    });

    it("messaging apps, including common misspellings", () => {
      for (const w of ["telegram", "telgram", "whatsapp", "whatsap", "discord", "wechat", "signal", "skype", "viber"]) {
        expect(kinds(`find me on ${w}`)).toContain("app");
      }
    });

    it("is case-insensitive on apps and links", () => {
      expect(kinds("WhatsApp me")).toContain("app");
      expect(kinds("HTTPS://EXAMPLE.COM")).toContain("link");
    });
  });

  describe("does not flag innocent text (false-positive guards)", () => {
    it("a price with a thousands separator", () => {
      // The exact example from the dev doc's false-positive warning.
      expect(scanForContact("Rate is 10,000 per project")).toHaveLength(0);
    });

    it("small numbers and short digit runs", () => {
      expect(scanForContact("I have 8 years of experience, 3 references")).toHaveLength(0);
      expect(scanForContact("available 9-5, room 204")).toHaveLength(0);
    });

    it("ordinary prose with an email-like word but no address", () => {
      expect(scanForContact("I clean homes and offices at fair rates")).toHaveLength(0);
    });

    it("the word 'online' does not match the 'line' app", () => {
      // \b word boundaries keep 'line' inside 'online' from matching.
      expect(kinds("I work online and in person")).not.toContain("app");
    });

    it("a short @ mention under the length floor", () => {
      expect(scanForContact("email me @ my address")).toHaveLength(0);
    });
  });

  describe("overlap handling", () => {
    it("reports an email once, as an email, not also as a handle", () => {
      const leaks = scanForContact("reach marisol@example.com now");
      expect(leaks).toHaveLength(1);
      expect(leaks[0].kind).toBe("email");
    });

    it("finds several distinct leaks in one string, in order", () => {
      const leaks = scanForContact("call 555 123 4567 or email me@x.com");
      expect(leaks.map((l) => l.kind)).toEqual(["phone", "email"]);
      expect(leaks[0].start).toBeLessThan(leaks[1].start);
    });
  });

  describe("scanPost", () => {
    it("is clean for an honest listing", () => {
      const r = scanPost({
        title: "Deep cleaning for homes and offices",
        description: "10 years experience. Rates from 10,000 KRW per visit. Eco-friendly products.",
      });
      expect(r.clean).toBe(true);
      expect(r.detectedText).toBe("");
    });

    it("flags a leak in the description and captures the offending text", () => {
      const r = scanPost({
        title: "Cleaner available",
        description: "Message me on whatsapp or 555 123 4567",
      });
      expect(r.clean).toBe(false);
      expect(r.detectedText).toContain("whatsapp");
      expect(r.detectedText).toContain("555 123 4567");
    });

    it("flags a leak hidden in the title", () => {
      const r = scanPost({ title: "Cleaner — dm @marisol_cleans", description: "Honest work." });
      expect(r.clean).toBe(false);
    });

    it("handles empty and missing fields", () => {
      expect(scanPost({}).clean).toBe(true);
      expect(scanPost({ title: "", description: "" }).clean).toBe(true);
    });
  });
});
