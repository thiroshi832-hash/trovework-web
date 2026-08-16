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

/** Like request(), but for multipart uploads — never sets a JSON Content-Type,
 *  so the browser can add the multipart boundary itself. */
async function upload<T>(path: string, form: FormData): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, { method: "POST", body: form, credentials: "include" });
  } catch {
    throw new ApiError(0, "Could not reach Trovework. Check your connection and try again.");
  }
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 429) throw new ApiError(429, "Too many attempts. Wait a minute and try again.");
    if (res.status === 413) throw new ApiError(413, "Those files are too large. Use images under 8MB.");
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
    /** Public browse. `qs` may carry category, skill, q, minPrice, maxPrice, take, skip. */
    search: (qs?: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(qs ?? {})) if (v != null && v !== "") params.set(k, String(v));
      const suffix = params.toString() ? `?${params.toString()}` : "";
      return request<unknown[]>(`/api/freelancers${suffix}`);
    },
    getBySlug: (slug: string) => request<unknown>(`/api/freelancers/${slug}`),
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
    requestPhone: (phone: string) =>
      request<{ sent: true }>("/api/verify/phone/request", {
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
      list: () => request<unknown[]>("/api/admin/verifications"),
      approve: (id: string) => request<void>(`/api/admin/verifications/${id}/approve`, { method: "POST" }),
      reject: (id: string, note?: string) =>
        request<void>(`/api/admin/verifications/${id}/reject`, {
          method: "POST",
          body: JSON.stringify({ note }),
        }),
    },
    violations: () => request<unknown[]>("/api/admin/violations"),
    blockedPosts: () => request<unknown[]>("/api/admin/posts/blocked"),
    bannedUsers: () => request<unknown[]>("/api/admin/users/banned"),
    reinstate: (userId: string) => request<void>(`/api/admin/users/${userId}/reinstate`, { method: "POST" }),
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
