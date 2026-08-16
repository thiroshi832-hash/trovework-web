/**
 * Thin client for the NestJS API.
 *
 * Everything is same-origin: nginx routes /api to the API container in
 * production, and next.config.ts rewrites it in development. That matters
 * because auth rides in httpOnly cookies — a cross-origin call would need CORS
 * plus SameSite=None, and would stop working the moment a browser tightened
 * third-party cookie rules.
 */

export type Role = "client" | "freelancer";

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: Role | "admin";
  status: "active" | "banned" | "pending";
  phoneVerified: boolean;
  idVerified: boolean;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Nest returns `message` as a string, or an array of them from the validation pipe. */
function readMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "message" in body) {
    const m = (body as { message: unknown }).message;
    if (typeof m === "string") return m;
    if (Array.isArray(m) && m.length) return m.join(" ");
  }
  return fallback;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    // Offline, DNS failure, or the API is not running.
    throw new ApiError(0, "Could not reach Trovework. Check your connection and try again.");
  }

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 429) {
      throw new ApiError(429, "Too many attempts. Wait a minute and try again.");
    }
    if (res.status >= 500) {
      throw new ApiError(res.status, "Something went wrong on our side. Please try again.");
    }
    throw new ApiError(res.status, readMessage(body, "Something went wrong. Please try again."));
  }

  return body as T;
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  role: Role;
  country: string;
  state: string;
  postalCode: string;
}

export const api = {
  register: (input: RegisterInput) =>
    request<{ userId: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  login: (email: string, password: string) =>
    request<{ userId: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () => request<void>("/api/auth/logout", { method: "POST" }),

  me: () => request<SessionUser>("/api/auth/me"),
};

/** Where a user lands after authenticating. */
export function homeFor(role: SessionUser["role"]): string {
  if (role === "admin") return "/admin";
  return role === "freelancer" ? "/dashboard/freelancer" : "/dashboard/client";
}
