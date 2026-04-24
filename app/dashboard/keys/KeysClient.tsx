"use client";

import { useActionState, useState, useTransition } from "react";
import { createKeyAction, revokeKeyAction, type ActionResult } from "@/app/actions";
import type { ApiKeyRow } from "@/lib/backend";

type Props = { initialKeys: ApiKeyRow[] };

export function KeysClient({ initialKeys }: Props) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    createKeyAction,
    null
  );
  const active = initialKeys.filter((k) => !k.revoked_at);
  const revoked = initialKeys.filter((k) => k.revoked_at);

  return (
    <>
      <h2 className="mb-7 text-[28px] leading-[1.2] tracking-[-0.02em]">
        API keys
      </h2>

      <Panel>
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h3 className="mb-1 text-[18px]">Create a key</h3>
            <p className="text-[14px] text-text-2">
              Name something descriptive like &quot;Production&quot; or &quot;Staging&quot;. You&apos;ll see the
              full secret once — store it safely.
            </p>
          </div>
        </div>
        {state && !state.ok && (
          <div className="mb-[14px] rounded-xs border border-[#fecaca] bg-[#fef2f2] px-3 py-[10px] text-[13px] leading-[1.5] text-[#b91c1c]">
            {state.error}
          </div>
        )}
        {state?.ok && (
          <div className="mb-[14px] rounded-xs border border-[#a7f3d0] bg-[#ecfdf5] px-3 py-[10px] text-[13px] leading-[1.5] text-[#047857]">
            Key created. Copy the full secret from the row it just appeared in — we won&apos;t show it again.
          </div>
        )}
        <form action={formAction} className="flex gap-3">
          <input
            name="name"
            placeholder="e.g. Production"
            maxLength={80}
            required
            className="h-10 flex-1 rounded-sm border border-border-strong bg-surface px-3 text-[14px] text-text"
          />
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Creating…" : "Create key"}
          </button>
        </form>
      </Panel>

      <Panel>
        <h3 className="mb-4 text-[18px]">Active keys</h3>
        {active.length === 0 ? (
          <Empty>No active keys.</Empty>
        ) : (
          active.map((k) => <KeyRow key={k.id} row={k} />)
        )}
      </Panel>

      {revoked.length > 0 && (
        <Panel>
          <h3 className="mb-4 text-[18px]">Revoked</h3>
          {revoked.map((k) => (
            <div
              key={k.id}
              className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-t border-border py-[14px] first:border-t-0"
            >
              <div>
                <div className="font-medium text-text-3">{k.name}</div>
                <div className="font-mono text-[12px] text-text-2">
                  {k.prefix}…
                </div>
              </div>
              <span className="rounded-full bg-bg-alt px-2 py-[3px] font-mono text-[11px] uppercase tracking-[0.08em] text-text-3">
                {k.tier}
              </span>
              <span className="text-[12px] italic text-text-3">
                revoked {new Date(k.revoked_at as string).toLocaleDateString()}
              </span>
              <span />
            </div>
          ))}
        </Panel>
      )}
    </>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <section className="mb-5 rounded-md border border-border bg-surface px-7 py-6">
      {children}
    </section>
  );
}
function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-dashed border-border py-8 text-center text-[14px] text-text-3">
      {children}
    </div>
  );
}

function KeyRow({ row }: { row: ApiKeyRow }) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const onRevoke = () => {
    const fd = new FormData();
    fd.set("id", String(row.id));
    startTransition(() => {
      void revokeKeyAction(fd);
    });
  };

  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-t border-border py-[14px] first:border-t-0">
      <div>
        <div className="font-medium">{row.name}</div>
        <div className="font-mono text-[12px] text-text-2">
          {row.prefix}…
          {row.last_used_at && (
            <> · last used {new Date(row.last_used_at).toLocaleDateString()}</>
          )}
        </div>
      </div>
      <span className="rounded-full bg-accent-soft px-2 py-[3px] font-mono text-[11px] uppercase tracking-[0.08em] text-accent">
        {row.tier}
      </span>
      <span className="font-mono text-[12px] text-text-2">
        Created {new Date(row.created_at).toLocaleDateString()}
      </span>
      {confirming ? (
        <span className="flex gap-2">
          <button
            className="btn btn-danger"
            onClick={onRevoke}
            disabled={isPending}
          >
            {isPending ? "Revoking…" : "Confirm"}
          </button>
          <button
            className="btn btn-text"
            onClick={() => setConfirming(false)}
            disabled={isPending}
          >
            Cancel
          </button>
        </span>
      ) : (
        <button className="btn btn-ghost" onClick={() => setConfirming(true)}>
          Revoke
        </button>
      )}
    </div>
  );
}
