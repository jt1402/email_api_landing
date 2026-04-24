"use client";

import { useActionState, useState } from "react";
import {
  runPlaygroundCheckAction,
  type CheckResult,
} from "@/app/actions";
import type { CheckResponse, Signal } from "@/lib/backend";

export function PlaygroundClient({ initialBalance }: { initialBalance: number }) {
  const [state, formAction, pending] = useActionState<CheckResult | null, FormData>(
    runPlaygroundCheckAction,
    null,
  );

  return (
    <>
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <h2 className="mb-1 text-[28px] leading-[1.2] tracking-[-0.02em]">
            Playground
          </h2>
          <p className="text-[14px] text-text-2">
            Hit <code className="font-mono text-[13px]">/v1/check</code> with any
            email. Each run costs 1 credit from your balance.
          </p>
        </div>
        <span className="rounded-full border border-border bg-surface px-3 py-[6px] font-mono text-[12px] text-text-2">
          {initialBalance.toLocaleString()} credits
        </span>
      </div>

      <section className="mb-5 rounded-md border border-border bg-surface px-7 py-6">
        <form action={formAction} className="grid grid-cols-[1fr_180px_auto] gap-3 max-[700px]:grid-cols-1">
          <div className="flex flex-col gap-[6px]">
            <label
              htmlFor="email"
              className="text-[13px] font-medium text-text-2"
            >
              Email to check
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoFocus
              placeholder="test@example.com"
              className="h-10 rounded-sm border border-border-strong bg-surface px-3 text-[14px] text-text focus:border-accent focus:outline-none focus:ring-[3px] focus:ring-accent/15"
            />
          </div>
          <div className="flex flex-col gap-[6px]">
            <label
              htmlFor="risk_profile"
              className="text-[13px] font-medium text-text-2"
            >
              Risk profile
            </label>
            <select
              id="risk_profile"
              name="risk_profile"
              className="h-10 rounded-sm border border-border-strong bg-surface px-3 text-[14px] text-text"
              defaultValue=""
            >
              <option value="">Default (balanced)</option>
              <option value="strict">Strict</option>
              <option value="balanced">Balanced</option>
              <option value="permissive">Permissive</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="btn btn-primary h-10"
              disabled={pending}
            >
              {pending ? "Checking…" : "Run check"}
            </button>
          </div>
        </form>
        {state && !state.ok && (
          <div className="mt-[14px] rounded-xs border border-[#fecaca] bg-[#fef2f2] px-3 py-[10px] text-[13px] leading-[1.5] text-[#b91c1c]">
            {state.error}
          </div>
        )}
      </section>

      {state?.ok && <ResultPanel data={state.data} />}

      <CodeExamples />
    </>
  );
}

function ResultPanel({ data }: { data: CheckResponse }) {
  return (
    <>
      <section className="mb-5 rounded-md border border-border bg-surface px-7 py-6">
        <div className="mb-4 flex items-center gap-3">
          <RecommendationBadge rec={data.verdict.recommendation} />
          <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-text-3">
            {data.verdict.risk_level} risk
          </span>
          <span className="ml-auto font-mono text-[12px] text-text-3">
            {data.meta.latency_ms}ms
            {data.meta.cached && " · cached"}
            {" · "}
            {data.meta.path_taken}
          </span>
        </div>
        <p className="mb-5 text-[15px] leading-[1.55] text-text">
          {data.verdict.summary}
        </p>
        <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[13px]">
          <Meta label="Domain">
            <span className="font-mono">{data.meta.domain}</span>
          </Meta>
          <Meta label="Disposable">
            {data.verdict.disposable ? "yes" : "no"}
          </Meta>
          <Meta label="Valid address">
            {data.verdict.valid_address ? "yes" : "no"}
          </Meta>
          <Meta label="Safe to send">
            {data.verdict.safe_to_send ? "yes" : "no"}
          </Meta>
          <Meta label="Catch-all">
            {data.verdict.catch_all === null
              ? "not checked"
              : data.verdict.catch_all
                ? "yes"
                : "no"}
          </Meta>
        </div>
      </section>

      <section className="mb-5 grid grid-cols-2 gap-5 max-[700px]:grid-cols-1">
        <div className="rounded-md border border-border bg-surface px-7 py-6">
          <h3 className="mb-4 text-[16px]">Score</h3>
          <div className="mb-3 flex items-baseline gap-3">
            <span className="text-[44px] font-semibold tracking-[-0.02em] tabular-nums">
              {data.score.value}
            </span>
            <span className="text-[14px] text-text-2">
              / 100 · conf {(data.score.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <ScoreBar
            value={data.score.value}
            blockAt={data.score.thresholds.block_at}
            flagAt={data.score.thresholds.flag_at}
          />
          <div className="mt-4 grid grid-cols-2 gap-y-[6px] text-[12px] text-text-2">
            <span>Strong</span>
            <span className="text-right tabular-nums">
              +{data.score.components.strong_signals}
            </span>
            <span>Corroborating (compounded)</span>
            <span className="text-right tabular-nums">
              +{data.score.components.corroborating}
            </span>
            <span>Compounding bonus</span>
            <span className="text-right tabular-nums">
              +{data.score.components.compounding_bonus}
            </span>
            <span>Trust adjustments</span>
            <span className="text-right tabular-nums">
              {data.score.components.trust_adjustments}
            </span>
            <span className="font-medium text-text">Final</span>
            <span className="text-right font-medium tabular-nums">
              {data.score.components.final_clamped}
            </span>
          </div>
        </div>
        <div className="rounded-md border border-border bg-surface px-7 py-6">
          <h3 className="mb-4 text-[16px]">Signals</h3>
          {data.signals.fired.length === 0 &&
          data.signals.trust_signals.length === 0 ? (
            <p className="text-[13px] text-text-3">No signals fired.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {data.signals.fired.map((s) => (
                <SignalRow key={s.name} sig={s} />
              ))}
              {data.signals.trust_signals.map((s) => (
                <SignalRow key={s.name} sig={s} />
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mb-5 rounded-md border border-border bg-surface px-7 py-6">
        <h3 className="mb-4 text-[16px]">Checks run</h3>
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="text-left text-[12px] text-text-2">
              <th className="py-2 font-medium">Check</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium">Result</th>
              <th className="py-2 text-right font-medium">Duration</th>
            </tr>
          </thead>
          <tbody>
            {data.checks.run.map((c, i) => (
              <tr key={i} className="border-t border-border">
                <td className="py-[10px] font-mono">{c.name}</td>
                <td className="py-[10px]">
                  <StatusPill s={c.status} />
                </td>
                <td className="py-[10px] text-text-2">{c.result ?? "—"}</td>
                <td className="py-[10px] text-right tabular-nums text-text-2">
                  {c.duration_ms.toFixed(1)}ms
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.checks.path_explanation && (
          <p className="mt-4 text-[12px] text-text-3">
            {data.checks.path_explanation}
          </p>
        )}
      </section>
    </>
  );
}

function CodeExamples() {
  const [tab, setTab] = useState<"curl" | "node" | "python">("curl");
  const samples = {
    curl: `curl -X POST https://api.verifymail.dev/v1/check \\
  -H "X-API-Key: $VERIFYMAIL_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "test@example.com"}'`,
    node: `const res = await fetch("https://api.verifymail.dev/v1/check", {
  method: "POST",
  headers: {
    "X-API-Key": process.env.VERIFYMAIL_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ email: "test@example.com" }),
});
const result = await res.json();`,
    python: `import os, httpx

r = httpx.post(
    "https://api.verifymail.dev/v1/check",
    headers={"X-API-Key": os.environ["VERIFYMAIL_KEY"]},
    json={"email": "test@example.com"},
)
result = r.json()`,
  };
  return (
    <section className="mb-5 rounded-md border border-border bg-surface px-7 py-6">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h3 className="text-[16px]">Equivalent API call</h3>
        <div className="flex gap-1 rounded-full bg-bg-alt p-1">
          {(["curl", "node", "python"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                tab === t
                  ? "bg-surface text-text shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                  : "text-text-2 hover:text-text"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <pre className="overflow-x-auto rounded-sm bg-[#0f172a] p-4 font-mono text-[12px] leading-[1.6] text-[#e2e8f0]">
        <code>{samples[tab]}</code>
      </pre>
    </section>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <span className="text-text-2">{label}</span>
      <span>{children}</span>
    </>
  );
}

function SignalRow({ sig }: { sig: Signal }) {
  const isTrust = sig.direction === "trust";
  const weight = (sig.weight > 0 ? "+" : "") + sig.weight;
  return (
    <li className="flex items-start justify-between gap-3 border-t border-border pt-2 first:border-t-0 first:pt-0">
      <div className="min-w-0">
        <div className="font-mono text-[12px] text-text">{sig.name}</div>
        <div className="text-[12px] leading-[1.4] text-text-3">
          {sig.description}
        </div>
      </div>
      <span
        className={`shrink-0 rounded-full px-2 py-[2px] font-mono text-[11px] tabular-nums ${
          isTrust
            ? "bg-[#ecfdf5] text-ok"
            : sig.weight >= 50
              ? "bg-[#fef2f2] text-risk"
              : "bg-[#fff7ed] text-warn"
        }`}
      >
        {weight}
      </span>
    </li>
  );
}

function RecommendationBadge({
  rec,
}: {
  rec: CheckResponse["verdict"]["recommendation"];
}) {
  const cls =
    rec === "block"
      ? "bg-[#fef2f2] text-risk"
      : rec === "verify_manually" || rec === "allow_with_flag"
        ? "bg-[#fff7ed] text-warn"
        : "bg-[#ecfdf5] text-ok";
  return (
    <span
      className={`rounded-full px-3 py-[4px] font-mono text-[12px] uppercase tracking-[0.08em] ${cls}`}
    >
      {rec.replace(/_/g, " ")}
    </span>
  );
}

function StatusPill({ s }: { s: string }) {
  const ok = s === "passed" || s === "completed" || s === "checked";
  return (
    <span
      className={`rounded-full px-2 py-[2px] font-mono text-[11px] ${
        ok
          ? "bg-[#ecfdf5] text-ok"
          : s === "failed"
            ? "bg-[#fef2f2] text-risk"
            : "bg-bg-alt text-text-3"
      }`}
    >
      {s}
    </span>
  );
}

function ScoreBar({
  value,
  blockAt,
  flagAt,
}: {
  value: number;
  blockAt: number;
  flagAt: number;
}) {
  const pct = Math.min(100, Math.max(0, value));
  const fill =
    value >= blockAt
      ? "bg-risk"
      : value >= flagAt
        ? "bg-warn"
        : "bg-ok";
  return (
    <div className="relative h-2 rounded-full bg-bg-alt">
      <div
        className={`h-full rounded-full ${fill}`}
        style={{ width: `${pct}%` }}
      />
      <div
        className="absolute top-[-2px] h-3 w-[2px] bg-text-3"
        style={{ left: `${flagAt}%` }}
        title={`flag at ${flagAt}`}
      />
      <div
        className="absolute top-[-2px] h-3 w-[2px] bg-risk"
        style={{ left: `${blockAt}%` }}
        title={`block at ${blockAt}`}
      />
    </div>
  );
}
