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
  strikeCount?: number;
  country?: string;
  /** Global: false when no SMS provider is linked, so the UI hides the phone step. */
  phoneVerificationRequired?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    /** On a 429, how long the server says to wait before retrying. */
    readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** A 429 body may carry both a specific reason and a wait; use them if present. */
function readRetryAfter(body: unknown): number | undefined {
  if (body && typeof body === "object" && "retryAfterSeconds" in body) {
    const value = (body as { retryAfterSeconds: unknown }).retryAfterSeconds;
    if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  }
  return undefined;
}

/** A page of results plus the total count, for the admin list endpoints. */
export interface Page<T> {
  items: T[];
  total: number;
}
export interface PageQuery {
  take?: number;
  skip?: number;
  // Lets a PageQuery (and its extensions, e.g. + q/status) satisfy qs()'s param.
  [key: string]: string | number | undefined;
}

/** Builds a "?a=1&b=2" query string, dropping undefined/empty values. */
function qs(params?: Record<string, string | number | undefined>): string {
  if (!params) return "";
  const pairs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => [k, String(v)] as [string, string]);
  return pairs.length ? `?${new URLSearchParams(pairs).toString()}` : "";
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

// Endpoints where a 401 is a real credential failure (wrong password, expired
// reset link, …), not a stale access token — never try to refresh on these.
const NO_REFRESH = [
  "/api/auth/refresh",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/google",
];

/** One in-flight refresh shared across concurrent 401s, so we don't stampede. */
let refreshing: Promise<boolean> | null = null;
function refreshSession(): Promise<boolean> {
  refreshing ??= fetch("/api/auth/refresh", { method: "POST", credentials: "include" })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

async function request<T>(path: string, init?: RequestInit, retry = true): Promise<T> {
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

  // The 15-minute access token lapsed — rotate it with the refresh token and
  // replay the request once, so a long-open page doesn't 401 mid-action.
  if (res.status === 401 && retry && !NO_REFRESH.some((p) => path.startsWith(p))) {
    if (await refreshSession()) return request<T>(path, init, false);
  }

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 429) {
      // Endpoints that throttle for a specific reason (the SMS resend cooldown,
      // the daily code cap) say so and say for how long — pass that through
      // rather than flattening it to the generic message.
      throw new ApiError(
        429,
        readMessage(body, "Too many attempts. Wait a minute and try again."),
        readRetryAfter(body),
      );
    }
    // A 503 is a deliberate "this feature is switched off right now" — e.g.
    // phone verification when no SMS provider is configured — and its body
    // carries a message written for the user. Surface it, rather than making an
    // intentionally-disabled feature look like a crash. Other 5xx are genuinely
    // unexpected, so stay generic and leak nothing internal.
    if (res.status === 503) {
      throw new ApiError(503, readMessage(body, "This feature is temporarily unavailable. Please try again later."));
    }
    if (res.status >= 500) {
      throw new ApiError(res.status, "Something went wrong on our side. Please try again.");
    }
    throw new ApiError(res.status, readMessage(body, "Something went wrong. Please try again."));
  }

  return body as T;
}

/** Like request(), but for multipart uploads — never sets a JSON Content-Type,
 *  so the browser can add the multipart boundary itself. */
async function upload<T>(path: string, form: FormData, retry = true): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, { method: "POST", body: form, credentials: "include" });
  } catch {
    throw new ApiError(0, "Could not reach Trovework. Check your connection and try again.");
  }
  if (res.status === 401 && retry && !NO_REFRESH.some((p) => path.startsWith(p))) {
    if (await refreshSession()) return upload<T>(path, form, false);
  }
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 429) throw new ApiError(429, "Too many attempts. Wait a minute and try again.");
    if (res.status === 413) throw new ApiError(413, "Those files are too large. Use images under 8MB.");
    if (res.status === 503) throw new ApiError(503, readMessage(body, "This feature is temporarily unavailable. Please try again later."));
    if (res.status >= 500) throw new ApiError(res.status, "Something went wrong on our side. Please try again.");
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

  /** Always resolves (the API answers 202 whether or not the email exists). */
  forgotPassword: (email: string) =>
    request<{ ok: true }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    request<{ ok: true }>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),

  /** Finishes a Google signup (role + location) using the pending cookie the callback set. */
  completeGoogleSignup: (input: { role: Role; country: string; state: string; postalCode: string }) =>
    request<{ userId: string }>("/api/auth/google/complete", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  /* ------------------------------- profile ------------------------------- */
  profile: {
    getMine: () => request<unknown>("/api/profile/me"),
    upsert: (input: Record<string, unknown>) =>
      request<unknown>("/api/profile", { method: "PUT", body: JSON.stringify(input) }),
    /** Multipart upload of a single "photo" file; returns the stored public path. */
    uploadPhoto: (file: File) => {
      const form = new FormData();
      form.append("photo", file);
      return upload<{ photoPath: string }>("/api/profile/photo", form);
    },
  },

  /* ---------------------------- freelancers ------------------------------ */
  freelancers: {
    /** Browse. `qs` may carry q, categories, skill, availability, minRating,
     *  minPrice, maxPrice, sort, take, skip. Returns a page + total. */
    search: (qs?: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(qs ?? {})) if (v != null && v !== "") params.set(k, String(v));
      const suffix = params.toString() ? `?${params.toString()}` : "";
      return request<{ items: unknown[]; total: number }>(`/api/freelancers${suffix}`);
    },
    getBySlug: (slug: string) => request<unknown>(`/api/freelancers/${slug}`),
    /** The distinct skills across visible freelancers, for the browse filter. */
    skills: () => request<string[]>("/api/freelancers/skills"),
    /** Public: a few verified freelancers for the landing page. */
    featured: () => request<unknown[]>("/api/freelancers/featured"),
  },

  /* ------------------------------- posts --------------------------------- */
  posts: {
    listMine: () => request<unknown[]>("/api/posts/mine"),
    get: (id: string) => request<unknown>(`/api/posts/${id}`),
    create: (input: Record<string, unknown>) =>
      request<PostWriteResult>("/api/posts", { method: "POST", body: JSON.stringify(input) }),
    update: (id: string, input: Record<string, unknown>) =>
      request<PostWriteResult>(`/api/posts/${id}`, { method: "PUT", body: JSON.stringify(input) }),
    remove: (id: string) => request<void>(`/api/posts/${id}`, { method: "DELETE" }),
  },

  /* ---------------------------- verification ----------------------------- */
  verify: {
    /** Resolves with how long the server wants before it will resend. */
    requestPhone: (phone: string) =>
      request<{ sent: true; resendAfterSeconds: number }>("/api/verify/phone/request", {
        method: "POST",
        body: JSON.stringify({ phone }),
      }),
    confirmPhone: (code: string) =>
      request<{ phoneVerified: true }>("/api/verify/phone/confirm", {
        method: "POST",
        body: JSON.stringify({ code }),
      }),
    /** form must carry: idFront, selfie (required), idBack (optional), fullName, dob, idNumber */
    submitId: (form: FormData) => upload<{ status: string; message: string }>("/api/verify/id", form),
  },

  /* ----------------------------- categories ------------------------------ */
  categories: {
    /** Public, active-only, in display order. */
    list: () => request<Category[]>("/api/categories"),
  },

  /* ------------------------------- admin --------------------------------- */
  admin: {
    verifications: {
      list: (p?: PageQuery) => request<Page<unknown>>(`/api/admin/verifications${qs(p)}`),
      approve: (id: string) => request<void>(`/api/admin/verifications/${id}/approve`, { method: "POST" }),
      reject: (id: string, note?: string) =>
        request<void>(`/api/admin/verifications/${id}/reject`, {
          method: "POST",
          body: JSON.stringify({ note }),
        }),
    },
    violations: (p?: PageQuery) => request<Page<unknown>>(`/api/admin/violations${qs(p)}`),
    blockedPosts: (p?: PageQuery) => request<Page<unknown>>(`/api/admin/posts/blocked${qs(p)}`),
    bannedUsers: (p?: PageQuery) => request<Page<unknown>>(`/api/admin/users/banned${qs(p)}`),
    users: (p?: PageQuery & { q?: string; status?: string }) => request<Page<unknown>>(`/api/admin/users${qs(p)}`),
    userDetail: (id: string) => request<unknown>(`/api/admin/users/${id}`),
    reinstate: (userId: string) => request<void>(`/api/admin/users/${userId}/reinstate`, { method: "POST" }),
    ban: (userId: string) => request<void>(`/api/admin/users/${userId}/ban`, { method: "POST" }),
    resetStrikes: (userId: string) => request<void>(`/api/admin/users/${userId}/reset-strikes`, { method: "POST" }),
    deleteUser: (userId: string) => request<void>(`/api/admin/users/${userId}`, { method: "DELETE" }),
    categories: {
      list: () => request<Category[]>("/api/admin/categories"),
      create: (input: { name: string; slug?: string; sortOrder?: number; isActive?: boolean }) =>
        request<Category>("/api/admin/categories", { method: "POST", body: JSON.stringify(input) }),
      update: (id: string, input: Partial<{ name: string; slug: string; sortOrder: number; isActive: boolean }>) =>
        request<Category>(`/api/admin/categories/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
      remove: (id: string) => request<void>(`/api/admin/categories/${id}`, { method: "DELETE" }),
    },
  },

  /* -------------------------------- chat --------------------------------- */
  chat: {
    start: (freelancerId: string) =>
      request<{ id: string }>("/api/conversations", {
        method: "POST",
        body: JSON.stringify({ freelancerId }),
      }),
    list: () => request<unknown[]>("/api/conversations"),
    messages: (id: string) => request<unknown[]>(`/api/conversations/${id}/messages`),
    /** Clears the thread's unread badge for the current user. */
    markRead: (id: string) => request<void>(`/api/conversations/${id}/read`, { method: "POST" }),
    send: (id: string, body: string) =>
      request<unknown>(`/api/conversations/${id}/messages`, {
        method: "POST",
        body: JSON.stringify({ body }),
      }),
  },
};

/** What POST/PUT /api/posts returns — a blocked post carries the scanner verdict. */
export interface PostWriteResult {
  post: { id: string; status: "active" | "blocked" | "draft"; blockedReason: string | null };
  blocked?: { detectedText: string; strikeCount: number; banned: boolean; message: string };
}

/** Where a user lands after authenticating. */
export function homeFor(role: SessionUser["role"]): string {
  if (role === "admin") return "/admin";
  return role === "freelancer" ? "/dashboard/freelancer" : "/dashboard/client";
}
