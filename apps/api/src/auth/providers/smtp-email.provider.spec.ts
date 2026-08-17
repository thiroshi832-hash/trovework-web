import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import { SmtpEmailProvider } from "./smtp-email.provider";

jest.mock("nodemailer");

const sendMail = jest.fn().mockResolvedValue({});

function make(cfg: Record<string, string>) {
  const config = {
    get: (k: string, d?: string) => cfg[k] ?? d,
    getOrThrow: (k: string) => cfg[k],
  } as unknown as ConfigService;
  return new SmtpEmailProvider(config);
}

describe("SmtpEmailProvider", () => {
  beforeEach(() => {
    sendMail.mockClear();
    (nodemailer.createTransport as jest.Mock).mockClear();
    (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail });
  });

  it("sends the reset link to the user over SMTP", async () => {
    const svc = make({ SMTP_USER: "bot@gmail.com", SMTP_PASS: "app-password" });
    const url = "https://trovework.com/reset-password?token=abc123";
    await svc.sendPasswordReset("user@example.com", url);

    expect(sendMail).toHaveBeenCalledTimes(1);
    const mail = sendMail.mock.calls[0][0];
    expect(mail.to).toBe("user@example.com");
    expect(mail.subject).toMatch(/reset/i);
    expect(mail.text).toContain(url);
    expect(mail.html).toContain(url);
    expect(mail.from).toContain("bot@gmail.com");
  });

  it("defaults to a secure Gmail transport", () => {
    make({ SMTP_USER: "bot@gmail.com", SMTP_PASS: "app-password" });
    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({ host: "smtp.gmail.com", port: 465, secure: true }),
    );
  });

  it("uses STARTTLS (not implicit TLS) on port 587", () => {
    make({ SMTP_USER: "bot@gmail.com", SMTP_PASS: "app-password", SMTP_PORT: "587" });
    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({ port: 587, secure: false }),
    );
  });

  it("honours a custom From header", async () => {
    const svc = make({ SMTP_USER: "bot@gmail.com", SMTP_PASS: "x", SMTP_FROM: "Trovework Support <help@trovework.com>" });
    await svc.sendPasswordReset("u@e.com", "https://x/y");
    expect(sendMail.mock.calls[0][0].from).toBe("Trovework Support <help@trovework.com>");
  });
});
