import Link from "next/link";
import { usage, type DomainsQuery } from "@/lib/backend";
import { getSession } from "@/lib/session";
import { addToListAction, removeFromListAction } from "@/app/actions";

type Search = {
  recommendation?: string;
  since?: string;
  list?: string;
  q?: string;
  page?: string;
};

const PAGE_SIZE = 50;

export default async function DomainsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const token = (await getSession()) as string;

  const recommendation = isRec(sp.recommendation) ? sp.recommendation : undefined;
  const since_days = sp.since ? Math.max(1, Math.min(365, Number(sp.since))) : 30;
  const in_list = isInList(sp.list) ? sp.list : undefined;
  const q = (sp.q ?? "").trim() || undefined;
  const page = Math.max(1, Number(sp.page ?? "1"));
  const offset = (page - 1) * PAGE_SIZE;

  const data = await usage.domains(token, {
    recommendation,
    since_days,
    in_list,
    q,
    limit: PAGE_SIZE,
    offset,
  } as DomainsQuery);

  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));

  return (
    <>
      <h2 className="mb-2 text-[28px] leading-[1.2] tracking-[-0.02em]">
        Domain Activity
      </h2>
      <p className="mb-6 max-w-[720px] text-[14px] text-text-2">
        Per-domain rollup of your check history. Click <span className="font-mono">Trust</span> or{" "}
        <span className="font-mono">Block</span> to add the domain to your custom list — future
        signups skip the engine entirely.
      </p>

      <Filters
        recommendation={recommendation}
        sinceDays={since_days}
        inList={in_list}
        q={q ?? ""}
      />

      <section className="mt-5 rounded-md border border-border bg-surface">
        <table className="w-full border-collapse text-[14px]">
          <thead>
            <tr className="text-left text-[12px] text-text-2">
              <th className="px-5 py-3 font-medium">Domain</th>
              <th className="px-5 py-3 text-right font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Breakdown</th>
              <th className="px-5 py-3 font-medium">Last seen</th>
              <th className="px-5 py-3 font-medium">List</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-[13px] text-text-3">
                  No domains match this filter.
                </td>
              </tr>
            ) : (
              data.items.map((row) => (
                <tr key={row.domain} className="border-t border-border">
                  <td className="px-5 py-[10px] font-mono">{row.domain}</td>
                  <td className="px-5 py-[10px] text-right tabular-nums">
                    {row.total.toLocaleString()}
                  </td>
                  <td className="px-5 py-[10px]">
                    <Breakdown b={row.breakdown} total={row.total} />
                  </td>
                  <td className="px-5 py-[10px] text-[13px] text-text-2">
                    {formatRelative(row.last_seen)}
                  </td>
                  <td className="px-5 py-[10px]">
                    {row.in_allow_list && <ListBadge kind="allow" />}
                    {row.in_block_list && <ListBadge kind="block" />}
                    {!row.in_allow_list && !row.in_block_list && (
                      <span className="text-text-3">—</span>
                    )}
                  </td>
                  <td className="px-5 py-[10px] text-right">
                    <RowActions
                      domain={row.domain}
                      inAllow={row.in_allow_list}
                      inBlock={row.in_block_list}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {totalPages > 1 && (
        <Pagination current={page} total={totalPages} sp={sp} />
      )}
    </>
  );
}

function isRec(v: string | undefined): v is DomainsQuery["recommendation"] {
  return (
    v === "allow" ||
    v === "allow_with_flag" ||
    v === "verify_manually" ||
    v === "block"
  );
}

function isInList(v: string | undefined): v is "allow" | "block" | "none" {
  return v === "allow" || v === "block" || v === "none";
}

function Filters({
  recommendation,
  sinceDays,
  inList,
  q,
}: {
  recommendation?: string;
  sinceDays: number;
  inList?: string;
  q: string;
}) {
  return (
    <form
      method="GET"
      className="flex flex-wrap items-end gap-3 rounded-md border border-border bg-surface p-4"
    >
      <FilterField label="Recommendation">
        <select
          name="recommendation"
          defaultValue={recommendation ?? ""}
          className="h-9 rounded-sm border border-border-strong bg-surface px-2 text-[13px] text-text"
        >
          <option value="">All</option>
          <option value="verify_manually">Verify manually</option>
          <option value="block">Block</option>
          <option value="allow_with_flag">Allow with flag</option>
          <option value="allow">Allow</option>
        </select>
      </FilterField>
      <FilterField label="Time">
        <select
          name="since"
          defaultValue={String(sinceDays)}
          className="h-9 rounded-sm border border-border-strong bg-surface px-2 text-[13px] text-text"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </FilterField>
      <FilterField label="In list">
        <select
          name="list"
          defaultValue={inList ?? ""}
          className="h-9 rounded-sm border border-border-strong bg-surface px-2 text-[13px] text-text"
        >
          <option value="">Any</option>
          <option value="allow">Allow</option>
          <option value="block">Block</option>
          <option value="none">Neither</option>
        </select>
      </FilterField>
      <FilterField label="Search">
        <input
          name="q"
          defaultValue={q}
          placeholder="domain substring"
          className="h-9 w-[180px] rounded-sm border border-border-strong bg-surface px-2 text-[13px] text-text"
        />
      </FilterField>
      <button type="submit" className="btn btn-primary btn-sm">
        Apply
      </button>
    </form>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-[12px] text-text-2">
      {label}
      {children}
    </label>
  );
}

function Breakdown({
  b,
  total,
}: {
  b: { blocks: number; verify_manually: number; allow_with_flag: number; allows: number };
  total: number;
}) {
  if (total === 0) return <span className="text-text-3">—</span>;
  const segs: { count: number; cls: string; label: string }[] = [
    { count: b.blocks, cls: "bg-risk", label: "block" },
    { count: b.verify_manually, cls: "bg-warn", label: "verify" },
    { count: b.allow_with_flag, cls: "bg-warn/60", label: "flag" },
    { count: b.allows, cls: "bg-ok", label: "allow" },
  ].filter((s) => s.count > 0);
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-[8px] w-[140px] overflow-hidden rounded-full bg-bg-alt">
        {segs.map((s) => (
          <div
            key={s.label}
            className={s.cls}
            style={{ width: `${(s.count / total) * 100}%` }}
            title={`${s.label}: ${s.count}`}
          />
        ))}
      </div>
      <div className="font-mono text-[11px] tabular-nums text-text-2">
        {b.blocks > 0 && <span className="mr-2 text-risk">{b.blocks}b</span>}
        {b.verify_manually > 0 && (
          <span className="mr-2 text-warn">{b.verify_manually}v</span>
        )}
        {b.allow_with_flag > 0 && (
          <span className="mr-2 text-warn">{b.allow_with_flag}f</span>
        )}
        {b.allows > 0 && <span className="text-ok">{b.allows}a</span>}
      </div>
    </div>
  );
}

function ListBadge({ kind }: { kind: "allow" | "block" }) {
  const cls =
    kind === "allow"
      ? "bg-[#ecfdf5] text-[#047857]"
      : "bg-[#fef2f2] text-[#b91c1c]";
  return (
    <span
      className={`rounded-full px-2 py-[2px] font-mono text-[10px] uppercase tracking-[0.08em] ${cls}`}
    >
      {kind}
    </span>
  );
}

function RowActions({
  domain,
  inAllow,
  inBlock,
}: {
  domain: string;
  inAllow: boolean;
  inBlock: boolean;
}) {
  return (
    <div className="flex justify-end gap-2">
      {inAllow ? (
        <form action={removeFromListAction}>
          <input type="hidden" name="kind" value="allow" />
          <input type="hidden" name="domain" value={domain} />
          <button type="submit" className="btn btn-ghost btn-sm">
            Remove from allow
          </button>
        </form>
      ) : (
        <form action={addToListAction}>
          <input type="hidden" name="kind" value="allow" />
          <input type="hidden" name="domain" value={domain} />
          <button type="submit" className="btn btn-ghost btn-sm text-ok">
            Trust
          </button>
        </form>
      )}
      {inBlock ? (
        <form action={removeFromListAction}>
          <input type="hidden" name="kind" value="block" />
          <input type="hidden" name="domain" value={domain} />
          <button type="submit" className="btn btn-ghost btn-sm">
            Remove from block
          </button>
        </form>
      ) : (
        <form action={addToListAction}>
          <input type="hidden" name="kind" value="block" />
          <input type="hidden" name="domain" value={domain} />
          <button type="submit" className="btn btn-ghost btn-sm text-risk">
            Block
          </button>
        </form>
      )}
    </div>
  );
}

function Pagination({
  current,
  total,
  sp,
}: {
  current: number;
  total: number;
  sp: Search;
}) {
  const params = (page: number) => {
    const p = new URLSearchParams();
    if (sp.recommendation) p.set("recommendation", sp.recommendation);
    if (sp.since) p.set("since", sp.since);
    if (sp.list) p.set("list", sp.list);
    if (sp.q) p.set("q", sp.q);
    p.set("page", String(page));
    return `?${p.toString()}`;
  };
  return (
    <nav className="mt-4 flex items-center justify-between text-[13px] text-text-2">
      <div>
        Page {current} of {total}
      </div>
      <div className="flex gap-2">
        {current > 1 && (
          <Link href={params(current - 1)} className="btn btn-ghost btn-sm">
            ← Previous
          </Link>
        )}
        {current < total && (
          <Link href={params(current + 1)} className="btn btn-ghost btn-sm">
            Next →
          </Link>
        )}
      </div>
    </nav>
  );
}

function formatRelative(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const m = Math.floor(diffMs / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return d.toISOString().slice(0, 10);
}
