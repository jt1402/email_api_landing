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
  allow_with_flag: number;
  allows: number;
  avg_latency_ms: number;
  cache_hit_rate: number;
};

export type RecentCheck = {
  domain: string;
  risk_score: number;
  recommendation: string;
  risk_level: "low" | "medium" | "high" | "critical" | null;
  confidence_level: "low" | "medium" | "high" | null;
  disposable: boolean | null;
  latency_ms: number;
  cached: boolean;
  checked_at: string;
};

export type Signal = {
  name: string;
  category: string;
  direction: "risk" | "trust";
  weight: number;
  description: string;
};

export type CheckStep = {
  name: string;
  status: string;
  duration_ms: number;
  result: string | null;
  probe_detail?: string | null;
};

export type CheckResponse = {
  meta: {
    request_id: string;
    email: string;
    domain: string;
    checked_at: string;
    latency_ms: number;
    model_phase: string;
    model_version: string;
    path_taken: string;
    cached: boolean;
    cache_age_seconds: number | null;
  };
  verdict: {
    recommendation: "allow" | "allow_with_flag" | "block";
    risk_level: "low" | "medium" | "high" | "critical";
    disposable: boolean;
    catch_all: boolean | null;
    catch_all_checked: boolean;
    valid_address: boolean;
    safe_to_send: boolean;
    summary: string;
  };
  score: {
    value: number;
    confidence: number;
    confidence_level: "high" | "medium" | "low";
    components: {
      strong_signals: number;
      corroborating: number;
      trust_adjustments: number;
      compounding_bonus: number;
      final_clamped: number;
    };
    thresholds: {
      block_at: number;
      flag_at: number;
      your_profile: "strict" | "balanced" | "permissive";
    };
  };
  signals: {
    fired: Signal[];
    trust_signals: Signal[];
    compounding: {
      applied: boolean;
      signal_count: number;
      bonus_applied: number;
      explanation: string;
    };
  };
  checks: {
    run: CheckStep[];
    path_explanation: string;
  };
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

// ── OAuth — server-side exchange after the provider redirect ──────────
export const oauth = {
  exchange: (code: string) =>
    call<{ session_token: string; default_api_key: string | null }>(
      "/v1/auth/oauth/exchange",
      { method: "POST", body: JSON.stringify({ code }) }
    ),
};

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
    call<{
      session_token: string;
      expires_at: string;
      user: User;
      default_api_key: string | null;
    }>("/v1/auth/verify", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),
  logout: (session: string) =>
    call<{ ok: boolean }>("/v1/auth/logout", { method: "POST", session }),
  me: (session: string) => call<User>("/v1/auth/me", { session }),
  deleteAccount: (session: string) =>
    call<void>("/v1/auth/me", { method: "DELETE", session }),
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

export type DomainBreakdown = {
  blocks: number;
  allow_with_flag: number;
  allows: number;
};

export type DomainRow = {
  domain: string;
  total: number;
  breakdown: DomainBreakdown;
  last_seen: string;
  last_recommendation: string;
  in_allow_list: boolean;
  in_block_list: boolean;
};

export type DomainsQuery = {
  recommendation?: "allow" | "allow_with_flag" | "block";
  since_days?: number;
  in_list?: "allow" | "block" | "none";
  q?: string;
  limit?: number;
  offset?: number;
};

export type DailyBucket = { date: string; total: number; blocks: number };

export type HistoryRow = {
  checked_at: string;
  recommendation: string;
  risk_score: number;
  risk_level: string | null;
  confidence_level: string | null;
  disposable: boolean | null;
  latency_ms: number;
  cached: boolean;
  path_taken: string;
};

export type SignalEntry = {
  name: string;
  direction: "risk" | "trust";
  weight: number;
  description: string;
};

export type DomainHistory = {
  domain: string;
  history: HistoryRow[];
  aggregate: DomainBreakdown;
  total: number;
  in_allow_list: boolean;
  in_block_list: boolean;
  is_reviewed: boolean;
  last_signals_fired: SignalEntry[];
  last_signals_trust: SignalEntry[];
};

export const usage = {
  summary: (session: string) =>
    call<UsageSummary>("/v1/usage/summary", { session }),
  recent: (session: string, limit = 20) =>
    call<{ items: RecentCheck[] }>(`/v1/usage/recent?limit=${limit}`, {
      session,
    }),
  domains: (session: string, q: DomainsQuery = {}) => {
    const p = new URLSearchParams();
    if (q.recommendation) p.set("recommendation", q.recommendation);
    if (q.since_days) p.set("since_days", String(q.since_days));
    if (q.in_list) p.set("in_list", q.in_list);
    if (q.q) p.set("q", q.q);
    if (q.limit) p.set("limit", String(q.limit));
    if (q.offset) p.set("offset", String(q.offset));
    return call<{
      items: DomainRow[];
      total: number;
      counts: { need_review: number; blocked: number; trusted: number };
    }>(`/v1/usage/domains?${p.toString()}`, { session });
  },
  domainHistory: (session: string, domain: string, limit = 20) =>
    call<DomainHistory>(
      `/v1/usage/domains/${encodeURIComponent(domain)}/history?limit=${limit}`,
      { session }
    ),
  byDay: (session: string, days = 30) =>
    call<{ days: number; buckets: DailyBucket[] }>(
      `/v1/usage/by_day?days=${days}`,
      { session }
    ),
};

export type ListKind = "allow" | "block" | "reviewed";

export const lists = {
  get: (session: string, kind: ListKind) =>
    call<{ kind: string; domains: string[] }>(`/v1/lists/${kind}`, { session }),
  add: (session: string, kind: ListKind, domain: string) =>
    call<{ kind: string; domain: string; added: boolean }>(
      `/v1/lists/${kind}`,
      { method: "POST", session, body: JSON.stringify({ domain }) }
    ),
  remove: (session: string, kind: ListKind, domain: string) =>
    call<{ kind: string; domain: string; removed: boolean }>(
      `/v1/lists/${kind}/${encodeURIComponent(domain)}`,
      { method: "DELETE", session }
    ),
};

export const checks = {
  preview: (
    session: string,
    body: { email: string; risk_profile?: string }
  ) =>
    call<CheckResponse>("/v1/check/preview", {
      method: "POST",
      session,
      headers: body.risk_profile
        ? { "X-Risk-Profile": body.risk_profile }
        : undefined,
      body: JSON.stringify({ email: body.email }),
    }),
};

export type BundleId = "5k" | "10k" | "25k" | "50k" | "100k";

export const billing = {
  balance: (session: string) =>
    call<{
      credit_balance_checks: number;
      has_purchased: boolean;
    }>("/v1/billing/balance", { session }),
  checkout: (session: string, bundle: BundleId) =>
    call<{ url: string }>("/v1/billing/checkout", {
      method: "POST",
      session,
      body: JSON.stringify({ bundle }),
    }),
};
