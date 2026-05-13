import Link from "next/link";
import { billing, keys, usage } from "@/lib/backend";
import { getSession } from "@/lib/session";

export default async function DashboardOverview() {
  const token = (await getSession()) as string;
  const [summary, keyList, balance, domainsRollup, byDay] = await Promise.all([
    usage.summary(token),
    keys.list(token),
    billing.balance(token),
    // Tiny rollup just to read the `counts` object — items list is unused.
    usage.domains(token, { since_days: 30, limit: 1 }),
    usage.byDay(token, 14),
  ]);

  const activeKeys = keyList.filter((k) => !k.revoked_at);
  const creditsRemaining = balance.credit_balance_checks;
  const used = summary.checks_this_period;
  const needsReview = domainsRollup.counts.need_review;

  return (
    <>
      <h2 className="mb-7 text-[28px] leading-[1.2] tracking-[-0.02em] max-[640px]:text-[22px]">
        Overview
      </h2>

      <div className="mb-8 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <Stat
          label="Credits remaining"
          value={creditsRemaining.toLocaleString()}
          sub={
            <Link href="/dashboard/billing" className="text-accent">
              Buy more →
            </Link>
          }
        />
        <Stat
          label="Checks this period"
          value={used.toLocaleString()}
          sub="Since the 1st of the month"
        />
        <Stat
          label="Blocks"
          value={summary.blocks.toLocaleString()}
          sub="Fake signups caught"
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
        <Stat
          label="Active keys"
          value={activeKeys.length}
          sub={
            <Link href="/dashboard/keys" className="text-accent">
              Manage →
            </Link>
          }
        />
      </div>

      <div className="mb-5 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
        <NeedsReviewCard count={needsReview} />
        <DailyVolumeCard buckets={byDay.buckets} />
      </div>

      <Panel>
        <PanelHead
          title="API keys"
          sub="Use these in your app to call the check API."
          action={
            <Link href="/dashboard/keys" className="btn btn-primary">
              Manage keys
            </Link>
          }
        />
        {activeKeys.length === 0 ? (
          <Empty>No active keys. Create one to start calling the API.</Empty>
        ) : (
          <div>
            {activeKeys.slice(0, 3).map((k) => (
              <div
                key={k.id}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border py-[14px] first:border-t-0"
              >
                <div className="min-w-0">
                  <div className="font-medium">{k.name}</div>
                  <div className="truncate font-mono text-[12px] text-text-2">
                    {k.prefix}…
                  </div>
                </div>
                <span className="font-mono text-[12px] text-text-2">
                  Created {new Date(k.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}

function NeedsReviewCard({ count }: { count: number }) {
  const href = "/dashboard/domains?recommendation=allow_with_flag&list=none";
  if (count === 0) {
    return (
      <Panel>
        <div className="flex items-start gap-4">
          <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#ecfdf5] text-[#047857] text-[18px]">
            ✓
          </div>
          <div>
            <h3 className="text-[18px]">All caught up</h3>
            <p className="mt-1 text-[14px] text-text-2">
              No domains awaiting review. Flagged signups will appear here.
            </p>
            <Link
              href="/dashboard/domains"
              className="mt-3 inline-block text-[13px] text-accent"
            >
              Open Domain Activity →
            </Link>
          </div>
        </div>
      </Panel>
    );
  }
  return (
    <Panel>
      <div className="flex items-start gap-4">
        <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#fff7ed] font-mono text-[14px] font-semibold text-warn">
          {count > 99 ? "99+" : count}
        </div>
        <div>
          <h3 className="text-[18px]">Needs review</h3>
          <p className="mt-1 text-[14px] text-text-2">
            {count === 1
              ? "1 domain is flagged and hasn't been decided."
              : `${count.toLocaleString()} domains are flagged and haven't been decided.`}
          </p>
          <Link
            href={href}
            className="mt-3 inline-block text-[13px] text-accent"
          >
            Triage now →
          </Link>
        </div>
      </div>
    </Panel>
  );
}

function DailyVolumeCard({
  buckets,
}: {
  buckets: { date: string; total: number; blocks: number }[];
}) {
  const today = new Date();
  const days: { date: string; total: number; blocks: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const found = buckets.find((b) => b.date === iso);
    days.push(found ?? { date: iso, total: 0, blocks: 0 });
  }
  const max = Math.max(1, ...days.map((d) => d.total));
  const totalChecks = days.reduce((acc, d) => acc + d.total, 0);

  return (
    <Panel>
      <PanelHead
        title="Daily volume"
        sub={`Last 14 days · ${totalChecks.toLocaleString()} checks`}
        action={
          <Link href="/dashboard/usage" className="text-[13px] text-accent">
            Full chart →
          </Link>
        }
      />
      {totalChecks === 0 ? (
        <Empty>No activity yet. Run a few checks and come back.</Empty>
      ) : (
        <div className="flex h-[80px] items-end gap-[3px]">
          {days.map((d) => {
            const heightPct = (d.total / max) * 100;
            const blocksPct = d.total === 0 ? 0 : (d.blocks / d.total) * 100;
            return (
              <div
                key={d.date}
                className="flex flex-1 flex-col justify-end"
                style={{ height: "100%" }}
                title={`${d.date}: ${d.total} checks (${d.blocks} blocks)`}
              >
                <div
                  className="w-full rounded-t-[2px] bg-accent"
                  style={{
                    height: `${heightPct}%`,
                    minHeight: d.total > 0 ? "2px" : "0",
                  }}
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
      )}
    </Panel>
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

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <section className="mb-5 rounded-md border border-border bg-surface px-7 py-6 max-[640px]:px-4 max-[640px]:py-5">
      {children}
    </section>
  );
}

function PanelHead({
  title,
  sub,
  action,
}: {
  title: string;
  sub: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div>
        <h3 className="mb-1 text-[18px]">{title}</h3>
        <p className="text-[14px] text-text-2">{sub}</p>
      </div>
      {action}
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
