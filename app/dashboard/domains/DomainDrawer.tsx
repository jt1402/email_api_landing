import Link from "next/link";
import type { DomainHistory } from "@/lib/backend";
import { addToListAction, removeFromListAction } from "@/app/actions";

export function DomainDrawer({
  data,
  closeHref,
}: {
  data: DomainHistory;
  closeHref: string;
}) {
  return (
    <>
      {/* Backdrop — close the drawer by navigating back to the list */}
      <Link
        href={closeHref}
        className="fixed inset-0 z-40 bg-black/30"
        aria-label="Close"
      />
      <aside className="fixed right-0 top-0 z-50 flex h-dvh w-[min(640px,100vw)] flex-col overflow-y-auto border-l border-border bg-surface shadow-xl">
        <header className="sticky top-0 flex items-start justify-between gap-4 border-b border-border bg-surface px-6 py-5">
          <div>
            <div className="font-mono text-[18px] text-text">{data.domain}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-text-2">
              <span>{data.total} total checks</span>
              {data.in_allow_list && <Pill tone="ok">In allow list</Pill>}
              {data.in_block_list && <Pill tone="risk">In block list</Pill>}
              {data.is_reviewed && <Pill tone="muted">Reviewed</Pill>}
            </div>
          </div>
          <Link href={closeHref} className="btn btn-ghost btn-sm">
            Close
          </Link>
        </header>

        <div className="flex flex-col gap-5 px-6 py-5">
          <ActionRow
            domain={data.domain}
            inAllow={data.in_allow_list}
            inBlock={data.in_block_list}
            isReviewed={data.is_reviewed}
          />

          <Section title="Most recent verdict — why it fired">
            <SignalsBlock
              fired={data.last_signals_fired}
              trust={data.last_signals_trust}
            />
          </Section>

          <Section title={`Per-call history (last ${data.history.length})`}>
            <HistoryTable rows={data.history} />
          </Section>
        </div>
      </aside>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-[14px] font-medium text-text">{title}</h3>
      {children}
    </section>
  );
}

function ActionRow({
  domain,
  inAllow,
  inBlock,
  isReviewed,
}: {
  domain: string;
  inAllow: boolean;
  inBlock: boolean;
  isReviewed: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2 rounded-md border border-border bg-bg-alt p-3">
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
            Trust this domain
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
            Block this domain
          </button>
        </form>
      )}
      {isReviewed ? (
        <form action={removeFromListAction}>
          <input type="hidden" name="kind" value="reviewed" />
          <input type="hidden" name="domain" value={domain} />
          <button type="submit" className="btn btn-ghost btn-sm">
            Unmark reviewed
          </button>
        </form>
      ) : (
        <form action={addToListAction}>
          <input type="hidden" name="kind" value="reviewed" />
          <input type="hidden" name="domain" value={domain} />
          <button type="submit" className="btn btn-ghost btn-sm">
            Mark reviewed
          </button>
        </form>
      )}
    </div>
  );
}

function SignalsBlock({
  fired,
  trust,
}: {
  fired: { name: string; weight: number; description: string }[];
  trust: { name: string; weight: number; description: string }[];
}) {
  if (fired.length === 0 && trust.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-border py-5 text-center text-[13px] text-text-3">
        No signals cached for this domain yet — try running a check from the
        playground or wait for the next live request.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-3 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
      {fired.length > 0 && (
        <SignalList title="Risk signals fired" tone="risk" items={fired} />
      )}
      {trust.length > 0 && (
        <SignalList title="Trust signals" tone="ok" items={trust} />
      )}
    </div>
  );
}

function SignalList({
  title,
  tone,
  items,
}: {
  title: string;
  tone: "risk" | "ok";
  items: { name: string; weight: number; description: string }[];
}) {
  const accent = tone === "risk" ? "text-risk" : "text-ok";
  return (
    <div className="rounded-md border border-border bg-bg-alt p-3">
      <div className={`mb-2 text-[12px] font-medium ${accent}`}>{title}</div>
      <ul className="flex flex-col gap-2">
        {items.map((s) => (
          <li key={s.name} className="text-[12px] leading-snug text-text-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-text">{s.name}</span>
              <span className={`font-mono tabular-nums ${accent}`}>
                {s.weight > 0 ? "+" : ""}
                {s.weight}
              </span>
            </div>
            <div className="mt-[2px] text-text-3">{s.description}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HistoryTable({
  rows,
}: {
  rows: DomainHistory["history"];
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-border py-5 text-center text-[13px] text-text-3">
        No history yet.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr className="text-left text-[11px] text-text-2">
            <th className="px-3 py-2 font-medium">When</th>
            <th className="px-3 py-2 font-medium">Verdict</th>
            <th className="px-3 py-2 font-medium">Risk</th>
            <th className="px-3 py-2 font-medium">Conf.</th>
            <th className="px-3 py-2 font-medium">Disp.</th>
            <th className="px-3 py-2 text-right font-medium">Score</th>
            <th className="px-3 py-2 text-right font-medium">Latency</th>
            <th className="px-3 py-2 font-medium">Path</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-border">
              <td className="px-3 py-2 text-text-2">{formatTime(r.checked_at)}</td>
              <td className="px-3 py-2"><RecPill rec={r.recommendation} /></td>
              <td className="px-3 py-2 text-text-2">{r.risk_level ?? "—"}</td>
              <td className="px-3 py-2 text-text-2">{r.confidence_level ?? "—"}</td>
              <td className="px-3 py-2 text-text-2">
                {r.disposable === null ? "—" : r.disposable ? "yes" : "no"}
              </td>
              <td className="px-3 py-2 text-right tabular-nums">{r.risk_score}</td>
              <td className="px-3 py-2 text-right tabular-nums text-text-2">
                {r.cached ? "cache" : `${r.latency_ms}ms`}
              </td>
              <td className="px-3 py-2 font-mono text-[11px] text-text-3">{r.path_taken}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecPill({ rec }: { rec: string }) {
  const cls =
    rec === "block"
      ? "bg-[#fef2f2] text-risk"
      : rec === "verify_manually" || rec === "allow_with_flag"
      ? "bg-[#fff7ed] text-warn"
      : "bg-accent-soft text-accent";
  return (
    <span
      className={`rounded-full px-2 py-[2px] font-mono text-[10px] uppercase tracking-[0.08em] ${cls}`}
    >
      {rec.replace(/_/g, " ")}
    </span>
  );
}

function Pill({ tone, children }: { tone: "ok" | "risk" | "muted"; children: React.ReactNode }) {
  const cls =
    tone === "ok"
      ? "bg-[#ecfdf5] text-[#047857]"
      : tone === "risk"
      ? "bg-[#fef2f2] text-[#b91c1c]"
      : "bg-bg-alt text-text-2";
  return (
    <span className={`rounded-full px-2 py-[2px] text-[11px] font-medium ${cls}`}>
      {children}
    </span>
  );
}

function formatTime(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.toISOString().slice(0, 10)} ${d.toISOString().slice(11, 19)}`;
}
