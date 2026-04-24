import Link from "next/link";
import { usage, billing } from "@/lib/backend";
import { getSession } from "@/lib/session";

export default async function UsagePage() {
  const token = (await getSession()) as string;
  const [summary, recent, balance] = await Promise.all([
    usage.summary(token),
    usage.recent(token, 50),
    billing.balance(token),
  ]);

  const total =
    summary.blocks + summary.verify_manually + summary.allow_with_flag + summary.allows;
  const breakdown = [
    { label: "Blocks", value: summary.blocks, tone: "risk" as const },
    { label: "Verify manually", value: summary.verify_manually, tone: "warn" as const },
    { label: "Allow with flag", value: summary.allow_with_flag, tone: "warn" as const },
    { label: "Allow", value: summary.allows, tone: "ok" as const },
  ];

  // Top domains from the recent sample
  const topDomains = Object.entries(
    recent.items.reduce<Record<string, number>>((acc, r) => {
      acc[r.domain] = (acc[r.domain] ?? 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <>
      <h2 className="mb-7 text-[28px] leading-[1.2] tracking-[-0.02em]">Usage</h2>

      <div className="mb-8 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <Stat
          label="Credits remaining"
          value={balance.credit_balance_checks.toLocaleString()}
          sub={
            <Link href="/dashboard/billing" className="text-accent">
              Buy more →
            </Link>
          }
        />
        <Stat
          label="Checks this period"
          value={summary.checks_this_period.toLocaleString()}
          sub="Since the 1st of the month"
        />
        <Stat
          label="Total checks"
          value={summary.total_checks.toLocaleString()}
          sub="All time"
        />
        <Stat
          label="Avg latency"
          value={
            <>
              {Math.round(summary.avg_latency_ms)}
              <span className="text-[16px] font-normal text-text-3"> ms</span>
            </>
          }
          sub={`${Math.round(summary.cache_hit_rate * 100)}% from cache`}
        />
      </div>

      <section className="mb-5 rounded-md border border-border bg-surface px-7 py-6">
        <h3 className="mb-1 text-[18px]">Breakdown by recommendation</h3>
        <p className="mb-5 text-[14px] text-text-2">
          How your checks are split across the four verdict values.
        </p>
        {total === 0 ? (
          <Empty>
            No checks yet. Run your first one from the{" "}
            <Link href="/docs" className="text-accent">
              docs
            </Link>
            .
          </Empty>
        ) : (
          <div className="flex flex-col gap-3">
            {breakdown.map((row) => {
              const pct = total === 0 ? 0 : Math.round((row.value / total) * 100);
              return (
                <div
                  key={row.label}
                  className="grid grid-cols-[140px_1fr_80px] items-center gap-3"
                >
                  <div className="font-mono text-[12px] text-text-2">{row.label}</div>
                  <div className="h-[10px] overflow-hidden rounded-full bg-bg-alt">
                    <div
                      className={`h-full rounded-full ${
                        row.tone === "risk"
                          ? "bg-risk"
                          : row.tone === "warn"
                          ? "bg-warn"
                          : "bg-ok"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-right font-mono text-[12px] tabular-nums text-text">
                    {row.value.toLocaleString()} · {pct}%
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mb-5 rounded-md border border-border bg-surface px-7 py-6">
        <h3 className="mb-1 text-[18px]">Top domains checked</h3>
        <p className="mb-5 text-[14px] text-text-2">
          From your last 50 checks — domains only, no emails.
        </p>
        {topDomains.length === 0 ? (
          <Empty>No checks yet.</Empty>
        ) : (
          <table className="w-full border-collapse text-[14px]">
            <thead>
              <tr className="text-left text-[12px] text-text-2">
                <th className="py-2 font-medium">Domain</th>
                <th className="py-2 text-right font-medium">Checks</th>
              </tr>
            </thead>
            <tbody>
              {topDomains.map(([d, count]) => (
                <tr key={d} className="border-t border-border">
                  <td className="py-[10px] font-mono">{d}</td>
                  <td className="py-[10px] text-right tabular-nums">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="mb-5 rounded-md border border-border bg-surface px-7 py-6">
        <h3 className="mb-1 text-[18px]">Recent checks</h3>
        <p className="mb-5 text-[14px] text-text-2">Your latest 50 calls.</p>
        {recent.items.length === 0 ? (
          <Empty>No checks yet.</Empty>
        ) : (
          <table className="w-full border-collapse text-[14px]">
            <thead>
              <tr className="text-left text-[12px] text-text-2">
                <th className="py-2 font-medium">Domain</th>
                <th className="py-2 font-medium">Recommendation</th>
                <th className="py-2 font-medium">Score</th>
                <th className="py-2 text-right font-medium">Latency</th>
              </tr>
            </thead>
            <tbody>
              {recent.items.map((c, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="py-[10px] font-mono">{c.domain}</td>
                  <td className="py-[10px]">
                    <RecTag rec={c.recommendation} />
                  </td>
                  <td className="py-[10px] tabular-nums">{c.risk_score}</td>
                  <td className="py-[10px] text-right tabular-nums text-text-2">
                    {c.cached ? "cache" : `${c.latency_ms}ms`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-surface p-[22px]">
      <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.1em] text-text-2">
        {label}
      </div>
      <div className="text-[28px] font-semibold tracking-[-0.02em] tabular-nums">
        {value}
      </div>
      <div className="mt-[6px] text-[13px] text-text-3">{sub}</div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-dashed border-border py-8 text-center text-[14px] text-text-3">
      {children}
    </div>
  );
}

function RecTag({ rec }: { rec: string }) {
  let cls = "bg-accent-soft text-accent";
  if (rec === "block") cls = "bg-[#fef2f2] text-risk";
  else if (rec === "verify_manually" || rec === "allow_with_flag")
    cls = "bg-[#fff7ed] text-warn";
  return (
    <span
      className={`rounded-full px-2 py-[3px] font-mono text-[11px] uppercase tracking-[0.08em] ${cls}`}
    >
      {rec.replace(/_/g, " ")}
    </span>
  );
}
