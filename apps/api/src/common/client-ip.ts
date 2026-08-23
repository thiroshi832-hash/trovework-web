import type { Request } from "express";

/**
 * The visitor's real IP behind nginx — the first hop in X-Forwarded-For (nginx
 * appends the real client to it). Falls back to Express' own view of the
 * connection when the header is absent (e.g. local dev with no proxy).
 */
export function clientIp(req: Request): string | null {
  const xff = req.headers["x-forwarded-for"];
  const first = Array.isArray(xff) ? xff[0] : xff?.split(",")[0];
  return (first?.trim() || req.ip || req.socket?.remoteAddress || null) ?? null;
}
