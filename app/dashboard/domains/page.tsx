import Link from "next/link";
import { usage, type DomainsQuery } from "@/lib/backend";
import { getSession } from "@/lib/session";
import { addToListAction, removeFromListAction } from "@/app/actions";
import { DomainDrawer } from "./DomainDrawer";

type Search = {
  recommendation?: string;
  since?: string;
  list?: string;
  q?: string;
  page?: string;
  per?: string;
  domain?: string;
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, 200] as const;
const DEFAULT_PAGE_SIZE = 10;

function parsePageSize(raw: string | undefined): number {
  const n = Number(raw);
  return PAGE_SIZE_OPTIONS.includes(n as (typeof PAGE_SIZE_OPTIONS)[number])
    ? n
    : DEFAULT_PAGE_SIZE;
}

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
  const pageSize = parsePageSize(sp.per);
  const page = Math.max(1, Number(sp.page ?? "1"));
  const offset = (page - 1) * pageSize;

  const [data, drawerData] = await Promise.all([
    usage.domains(token, {
      recommendation,
      since_days,
      in_list,
      q,
      limit: pageSize,
      offset,
    } as DomainsQuery),
    sp.domain ? usage.domainHistory(token, sp.domain).catch(() => null) : Promise.resolve(null),
  ]);

  const totalPages = Math.max(1, Math.ceil(data.total / pageSize));
  const baseQuery: Search = {
    recommendation: sp.recommendation,
    since: sp.since,
    list: sp.list,
    q: sp.q,
    page: sp.page,
    per: sp.per,
  };

  return (
    <>
      <div className="mb-2 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[28px] leading-[1.2] tracking-[-0.02em]">Domain Activity</h2>
          <p className="mt-1 max-w-[640px] text-[14px] text-text-2">
            Triage flagged signups, manage trust/block lists, mark reviewed domains as
            decided. Click any row for the full history.
          </p>
        </div>
      </div>

      <PresetPills counts={data.counts} active={presetFor(sp)} base={baseQuery} />

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
              data.items.map((row) => {
                const drawerHref =
                  "?" +
                  new URLSearchParams({
                    ...stripUndef(baseQuery),
                    domain: row.domain,
                  }).toString();
                return (
                  <tr key={row.domain} className="border-t border-border hover:bg-bg-alt">
                    <td className="px-5 py-[10px] font-mono">
                      <Link href={drawerHref} className="block hover:text-accent">
                        {row.domain}
                      </Link>
                    </td>
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
                );
              })
            )}
          </tbody>
        </table>
      </section>

      <PaginationBar
        current={page}
        totalPages={totalPages}
        totalItems={data.total}
        pageSize={pageSize}
        sp={sp}
      />
      <ShowMore current={pageSize} totalItems={data.total} sp={sp} />


      {sp.domain && drawerData && (
        <DomainDrawer data={drawerData} closeHref={"?" + new URLSearchParams(stripUndef(baseQuery)).toString()} />
      )}
    </>
  );
}

function isRec(v: string | undefined): v is DomainsQuery["recommendation"] {
  return v === "allow" || v === "allow_with_flag" || v === "block";
}

function isInList(v: string | undefined): v is "allow" | "block" | "none" {
  return v === "allow" || v === "block" || v === "none";
}

function stripUndef(o: Record<string, string | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(o)) if (v) out[k] = v;
  return out;
}

function presetFor(sp: Search): "review" | "blocked" | "trusted" | "all" {
  if (sp.recommendation === "allow_with_flag" && sp.list === "none") return "review";
  if (sp.list === "block") return "blocked";
  if (sp.list === "allow") return "trusted";
  return "all";
}

function PresetPills({
  counts,
  active,
  base,
}: {
  counts: { need_review: number; blocked: number; trusted: number };
  active: "review" | "blocked" | "trusted" | "all";
  base: Search;
}) {
  const presets = [
    {
      key: "review" as const,
      label: "Needs review",
      count: counts.need_review,
      tone: "warn" as const,
      params: { recommendation: "allow_with_flag", list: "none" },
    },
    {
      key: "blocked" as const,
      label: "Blocked",
      count: counts.blocked,
      tone: "risk" as const,
      params: { list: "block" },
    },
    {
      key: "trusted" as const,
      label: "Trusted",
      count: counts.trusted,
      tone: "ok" as const,
      params: { list: "allow" },
    },
    {
      key: "all" as const,
      label: "All",
      count: null,
      tone: "neutral" as const,
      params: {},
    },
  ];
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {presets.map((p) => {
        const isActive = active === p.key;
        const merged: Record<string, string> = {
          ...(p.key === "all" ? {} : { since: base.since ?? "30" }),
          ...(p.params as Record<string, string>),
          ...(base.q ? { q: base.q } : {}),
        };
        const params = new URLSearchParams(merged);
        const href = `?${params.toString()}`;
        const toneCls = isActive
          ? p.tone === "warn"
            ? "bg-warn text-white"
            : p.tone === "risk"
            ? "bg-risk text-white"
            : p.tone === "ok"
            ? "bg-ok text-white"
            : "bg-text text-surface"
          : "bg-surface text-text border border-border-strong";
        return (
          <Link
            key={p.key}
            href={href}
            className={`rounded-full px-3 py-1 text-[13px] font-medium transition-colors ${toneCls}`}
          >
            {p.label}
            {p.count !== null && (
              <span
                className={`ml-2 rounded-full px-1.5 py-[1px] text-[11px] tabular-nums ${
                  isActive ? "bg-white/20" : "bg-bg-alt text-text-2"
                }`}
              >
                {p.count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
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
  b: { blocks: number; allow_with_flag: number; allows: number };
  total: number;
}) {
  if (total === 0) return <span className="text-text-3">—</span>;
  const segs: { count: number; cls: string; label: string }[] = [
    { count: b.blocks, cls: "bg-risk", label: "block" },
    { count: b.allow_with_flag, cls: "bg-warn", label: "flag" },
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

function buildHref(sp: Search, overrides: Record<string, string | undefined>): string {
  const p = new URLSearchParams();
  const merged: Record<string, string | undefined> = {
    recommendation: sp.recommendation,
    since: sp.since,
    list: sp.list,
    q: sp.q,
    page: sp.page,
    per: sp.per,
    ...overrides,
  };
  for (const [k, v] of Object.entries(merged)) {
    if (v) p.set(k, v);
  }
  return `?${p.toString()}`;
}

function PaginationBar({
  current,
  totalPages,
  totalItems,
  pageSize,
  sp,
}: {
  current: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  sp: Search;
}) {
  const from = totalItems === 0 ? 0 : (current - 1) * pageSize + 1;
  const to = Math.min(totalItems, current * pageSize);
  return (
    <nav className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[13px] text-text-2">
      <div className="flex items-center gap-3">
        <span>
          {totalItems === 0
            ? "No results"
            : `${from}–${to} of ${totalItems.toLocaleString()}`}
        </span>
        <span className="text-text-3">·</span>
        <PerPageSelector current={pageSize} sp={sp} />
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-text-3">
            Page {current} of {totalPages}
          </span>
          <Link
            href={buildHref(sp, { page: String(current - 1) })}
            className={`btn btn-ghost btn-sm ${current <= 1 ? "pointer-events-none opacity-40" : ""}`}
            aria-disabled={current <= 1}
          >
            ← Previous
          </Link>
          <Link
            href={buildHref(sp, { page: String(current + 1) })}
            className={`btn btn-ghost btn-sm ${current >= totalPages ? "pointer-events-none opacity-40" : ""}`}
            aria-disabled={current >= totalPages}
          >
            Next →
          </Link>
        </div>
      )}
    </nav>
  );
}

function PerPageSelector({ current, sp }: { current: number; sp: Search }) {
  return (
    <span className="flex items-center gap-2">
      <span>Per page:</span>
      <span className="flex gap-[2px] rounded-sm border border-border-strong p-[2px]">
        {PAGE_SIZE_OPTIONS.map((n) => {
          const isActive = n === current;
          // Reset to page 1 whenever per-page changes — otherwise the user
          // could land beyond the new page count.
          const href = buildHref(sp, { per: String(n), page: "1" });
          return (
            <Link
              key={n}
              href={href}
              className={`rounded-[3px] px-2 py-[2px] text-[12px] tabular-nums ${
                isActive
                  ? "bg-text text-surface"
                  : "text-text-2 hover:text-text"
              }`}
            >
              {n}
            </Link>
          );
        })}
      </span>
    </span>
  );
}

function ShowMore({
  current,
  totalItems,
  sp,
}: {
  current: number;
  totalItems: number;
  sp: Search;
}) {
  // Pick the next bigger page size that's still useful given total items.
  // If we're already showing everything (or at the cap), no link.
  const next = PAGE_SIZE_OPTIONS.find((n) => n > current && n <= Math.max(totalItems, current));
  if (!next || totalItems <= current) return null;
  return (
    <div className="mt-2 text-center">
      <Link
        href={buildHref(sp, { per: String(next), page: "1" })}
        className="text-[13px] text-accent hover:underline"
      >
        Show more ({next} per page) →
      </Link>
    </div>
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
