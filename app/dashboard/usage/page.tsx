import Link from "next/link";
import { usage, billing } from "@/lib/backend";
import { getSession } from "@/lib/session";

export default async function UsagePage() {
  const token = (await getSession()) as string;
  const [summary, balance, byDay] = await Promise.all([
    usage.summary(token),
    billing.balance(token),
    usage.byDay(token, 30),
  ]);

  const total =
    summary.blocks + summary.allow_with_flag + summary.allows;
  const breakdown = [
    { label: "Blocks", value: summary.blocks, tone: "risk" as const },
    { label: "Allow with flag", value: summary.allow_with_flag, tone: "warn" as const },
    { label: "Allow", value: summary.allows, tone: "ok" as const },
  ];

  return (
    <>
      <h2 className="mb-7 text-[28px] leading-[1.2] tracking-[-0.02em] max-[640px]:text-[22px]">Usage</h2>

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

      <section className="mb-5 rounded-md border border-border bg-surface px-7 py-6 max-[640px]:px-4 max-[640px]:py-5">
        <h3 className="mb-1 text-[18px]">Breakdown by recommendation</h3>
        <p className="mb-5 text-[14px] text-text-2">
          How your checks are split across the four verdict values, this period.
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
                  className="grid grid-cols-[140px_1fr_80px] items-center gap-3 max-[640px]:grid-cols-[1fr_80px] max-[640px]:gap-y-1"
                >
                  <div className="font-mono text-[12px] text-text-2 max-[640px]:col-span-2">{row.label}</div>
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

      <section className="mb-5 rounded-md border border-border bg-surface px-7 py-6 max-[640px]:px-4 max-[640px]:py-5">
        <h3 className="mb-1 text-[18px]">Daily volume</h3>
        <p className="mb-5 text-[14px] text-text-2">Checks per day for the last 30 days. Blocks shown in red.</p>
        <DailyChart buckets={byDay.buckets} />
      </section>

      <section className="mb-5 rounded-md border border-border bg-surface px-7 py-6 max-[640px]:px-4 max-[640px]:py-5">
        <h3 className="mb-1 text-[18px]">Domain Activity</h3>
        <p className="mb-3 text-[14px] text-text-2">
          Per-domain rollups, signal drill-down, and one-click allow/block live on their own page.
        </p>
        <Link href="/dashboard/domains" className="btn btn-ghost btn-sm">
          Open Domain Activity →
        </Link>
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
    <div className="rounded-md border border-border bg-surface p-[22px] max-[640px]:p-4">
      <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.1em] text-text-2">
        {label}
      </div>
      <div className="text-[28px] font-semibold tracking-[-0.02em] tabular-nums max-[640px]:text-[24px]">
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

function DailyChart({
  buckets,
}: {
  buckets: { date: string; total: number; blocks: number }[];
}) {
  // Backend returns rows only for days with activity; pad to 30 with zeros so
  // the bar chart shows continuous days even on sparse usage.
  const today = new Date();
  const days: { date: string; total: number; blocks: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const found = buckets.find((b) => b.date === iso);
    days.push(found ?? { date: iso, total: 0, blocks: 0 });
  }
  const max = Math.max(1, ...days.map((d) => d.total));
  if (max <= 1) {
    return (
      <Empty>No activity yet. Run a few checks and come back.</Empty>
    );
  }
  return (
    <div className="flex h-[140px] items-end gap-[3px]">
      {days.map((d) => {
        const heightPct = (d.total / max) * 100;
        const blocksPct = d.total === 0 ? 0 : (d.blocks / d.total) * 100;
        return (
          <div
            key={d.date}
            className="group relative flex flex-1 flex-col justify-end"
            style={{ height: "100%" }}
            title={`${d.date}: ${d.total} checks (${d.blocks} blocks)`}
          >
            <div
              className="w-full rounded-t-[2px] bg-accent transition-colors group-hover:bg-accent-hover"
              style={{ height: `${heightPct}%`, minHeight: d.total > 0 ? "2px" : "0" }}
            >
              <div
                className="rounded-t-[2px] bg-risk"
                style={{ height: `${blocksPct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
