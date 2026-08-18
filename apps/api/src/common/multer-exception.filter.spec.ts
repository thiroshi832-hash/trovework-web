import { ArgumentsHost } from "@nestjs/common";
import { MulterError } from "multer";
import { MulterExceptionFilter } from "./multer-exception.filter";

/** Builds a minimal ArgumentsHost whose response records status()/json(). */
function mockHost() {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  const host = {
    switchToHttp: () => ({ getResponse: () => res }),
  } as unknown as ArgumentsHost;
  return { host, res };
}

describe("MulterExceptionFilter", () => {
  const filter = new MulterExceptionFilter();

  it("maps an over-size upload to 413 with a friendly message", () => {
    const { host, res } = mockHost();
    filter.catch(new MulterError("LIMIT_FILE_SIZE"), host);
    expect(res.statusCode).toBe(413);
    expect(res.body).toEqual({ statusCode: 413, message: expect.stringContaining("too large") });
  });

  it("maps other Multer errors to 400", () => {
    const { host, res } = mockHost();
    filter.catch(new MulterError("LIMIT_UNEXPECTED_FILE", "selfie"), host);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ statusCode: 400, message: expect.any(String) });
  });
});
