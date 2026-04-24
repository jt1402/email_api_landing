/**
 * Thin typed client over the FastAPI backend.
 *
 * All methods run server-side (Server Components, Server Actions, Route
 * Handlers). Never import this into a client component — API URLs and
 * the session bearer token must stay on the server.
 */

const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:8001";

export type User = {
  id: number;
  email: string;
  email_verified: boolean;
  created_at: string;
};

export type ApiKeyRow = {
  id: number;
  name: string;
  prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

export type CreatedKey = {
  id: number;
  name: string;
  prefix: string;
  key: string; // raw secret — show once
};

export type UsageSummary = {
  total_checks: number;
  checks_this_period: number;
  period_start: string;
  blocks: number;
  verify_manually: number;
  allow_with_flag: number;
  allows: number;
  avg_latency_ms: number;
  cache_hit_rate: number;
};

export type RecentCheck = {
  domain: string;
  risk_score: number;
  recommendation: string;
  latency_ms: number;
  cached: boolean;
  checked_at: string;
};

type BackendError = { code: string; http_status: number; message: string };

export class BackendCallError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function call<T>(
  path: string,
  init: RequestInit & { session?: string | null } = {}
): Promise<T> {
  const { session, headers, ...rest } = init;
  const h = new Headers(headers);
  h.set("Content-Type", "application/json");
  if (session) h.set("Authorization", `Bearer ${session}`);

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...rest,
    headers: h,
    cache: "no-store",
  });

  if (!res.ok) {
    let body: { error?: BackendError } = {};
    try {
      body = (await res.json()) as { error?: BackendError };
    } catch {
      /* ignore parse errors */
    }
    const err = body.error;
    throw new BackendCallError(
      res.status,
      err?.code ?? "backend_error",
      err?.message ?? `Backend returned ${res.status}`
    );
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ── Public auth endpoints ──────────────────────────────────────────────
export const auth = {
  signup: (email: string) =>
    call<{ ok: boolean }>("/v1/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  login: (email: string) =>
    call<{ ok: boolean }>("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  verify: (token: string) =>
    call<{ session_token: string; expires_at: string; user: User }>(
      "/v1/auth/verify",
      { method: "POST", body: JSON.stringify({ token }) }
    ),
  logout: (session: string) =>
    call<{ ok: boolean }>("/v1/auth/logout", { method: "POST", session }),
  me: (session: string) => call<User>("/v1/auth/me", { session }),
};

// ── Dashboard endpoints (session required) ─────────────────────────────
export const keys = {
  list: (session: string) => call<ApiKeyRow[]>("/v1/keys", { session }),
  create: (session: string, name: string) =>
    call<CreatedKey>("/v1/keys", {
      method: "POST",
      session,
      body: JSON.stringify({ name }),
    }),
  revoke: (session: string, id: number) =>
    call<void>(`/v1/keys/${id}`, { method: "DELETE", session }),
};

export const usage = {
  summary: (session: string) =>
    call<UsageSummary>("/v1/usage/summary", { session }),
  recent: (session: string, limit = 20) =>
    call<{ items: RecentCheck[] }>(`/v1/usage/recent?limit=${limit}`, {
      session,
    }),
};

export type BundleId = "10k" | "50k" | "250k";

export const billing = {
  balance: (session: string) =>
    call<{ credit_balance_checks: number }>("/v1/billing/balance", { session }),
  checkout: (session: string, bundle: BundleId) =>
    call<{ url: string }>("/v1/billing/checkout", {
      method: "POST",
      session,
      body: JSON.stringify({ bundle }),
    }),
};
