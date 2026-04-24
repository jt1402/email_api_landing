import Link from "next/link";
import { keys, usage } from "@/lib/backend";
import { getSession } from "@/lib/session";

export default async function DashboardOverview() {
  const token = (await getSession()) as string;
  const [summary, keyList, recent] = await Promise.all([
    usage.summary(token),
    keys.list(token),
    usage.recent(token, 5),
  ]);

  const activeKeys = keyList.filter((k) => !k.revoked_at);
  const freeLimit = 500;
  const used = summary.checks_this_period;
  const pct = Math.min(100, Math.round((used / freeLimit) * 100));

  return (
    <>
      <h2 className="mb-7 text-[28px] leading-[1.2] tracking-[-0.02em]">
        Overview
      </h2>

      <div className="mb-8 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <Stat
          label="Checks this period"
          value={used.toLocaleString()}
          sub={`${pct}% of ${freeLimit.toLocaleString()} free-tier limit`}
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

      <Panel>
        <PanelHead
          title="Recent checks"
          sub="Latest calls your keys made — domains only, no emails."
          action={
            <Link href="/dashboard/usage" className="btn btn-ghost">
              View all
            </Link>
          }
        />
        {recent.items.length === 0 ? (
          <Empty>
            No checks yet. Run your first one from the{" "}
            <Link href="/docs" className="text-accent">
              docs
            </Link>
            .
          </Empty>
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
      </Panel>

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
                className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-t border-border py-[14px] first:border-t-0"
              >
                <div>
                  <div className="font-medium">{k.name}</div>
                  <div className="font-mono text-[12px] text-text-2">
                    {k.prefix}…
                  </div>
                </div>
                <KeyTier>{k.tier}</KeyTier>
                <span className="font-mono text-[12px] text-text-2">
                  Created {new Date(k.created_at).toLocaleDateString()}
                </span>
                <span />
              </div>
            ))}
          </div>
        )}
      </Panel>
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

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <section className="mb-5 rounded-md border border-border bg-surface px-7 py-6">
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
    <div className="mb-5 flex items-start justify-between gap-3">
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
function KeyTier({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-accent-soft px-2 py-[3px] font-mono text-[11px] uppercase tracking-[0.08em] text-accent">
      {children}
    </span>
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
