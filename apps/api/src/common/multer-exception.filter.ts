import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import { MulterError } from "multer";
import type { Response } from "express";

/**
 * Multer throws a plain `MulterError` (not an HttpException) when an upload
 * breaks a limit, so without this it surfaces as a raw 500. The most common
 * case is an image over the size cap: we map that to 413 Payload Too Large,
 * which the web client already renders as a friendly "those files are too
 * large" message. Any other Multer complaint (too many files, unexpected
 * field) is a 400 — the request was malformed, not the server.
 */
@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: MulterError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const tooLarge = exception.code === "LIMIT_FILE_SIZE";
    const status = tooLarge ? HttpStatus.PAYLOAD_TOO_LARGE : HttpStatus.BAD_REQUEST;
    const message = tooLarge
      ? "That file is too large. Use images under 8MB."
      : "That upload could not be processed.";
    res.status(status).json({ statusCode: status, message });
  }
}
