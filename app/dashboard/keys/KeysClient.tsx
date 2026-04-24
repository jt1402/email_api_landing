"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import {
  createKeyAction,
  revokeKeyAction,
  type CreateKeyResult,
} from "@/app/actions";
import type { ApiKeyRow, CreatedKey } from "@/lib/backend";

type Props = { initialKeys: ApiKeyRow[]; hasPurchased: boolean };

export function KeysClient({ initialKeys, hasPurchased }: Props) {
  const [state, formAction, pending] = useActionState<
    CreateKeyResult | null,
    FormData
  >(createKeyAction, null);
  const [dismissedId, setDismissedId] = useState<number | null>(null);

  const revealed: CreatedKey | null =
    state?.ok && state.created.id !== dismissedId ? state.created : null;

  const active = initialKeys.filter((k) => !k.revoked_at);
  const revoked = initialKeys.filter((k) => k.revoked_at);
  const freeLimitReached = !hasPurchased && active.length >= 1;

  return (
    <>
      <h2 className="mb-7 text-[28px] leading-[1.2] tracking-[-0.02em]">
        API keys
      </h2>

      {revealed && (
        <SecretBanner
          created={revealed}
          onDismiss={() => setDismissedId(revealed.id)}
        />
      )}

      <Panel>
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h3 className="mb-1 text-[18px]">Create a key</h3>
            <p className="text-[14px] text-text-2">
              Name something descriptive like &quot;Production&quot; or &quot;Staging&quot;. The full
              secret is shown only once — store it in your secret manager.
            </p>
          </div>
        </div>
        {freeLimitReached && (
          <div className="mb-[14px] flex items-center justify-between gap-3 rounded-xs border border-[#fed7aa] bg-[#fff7ed] px-3 py-[10px] text-[13px] leading-[1.5] text-[#9a3412]">
            <span>
              Free accounts are limited to one API key. Buy a bundle to unlock
              additional keys.
            </span>
            <Link href="/dashboard/billing" className="btn btn-ghost h-8">
              Buy credits
            </Link>
          </div>
        )}
        {state && !state.ok && (
          <div className="mb-[14px] rounded-xs border border-[#fecaca] bg-[#fef2f2] px-3 py-[10px] text-[13px] leading-[1.5] text-[#b91c1c]">
            {state.error}
          </div>
        )}
        <form action={formAction} className="flex gap-3">
          <input
            name="name"
            placeholder="e.g. Production"
            maxLength={80}
            required
            disabled={freeLimitReached}
            className="h-10 flex-1 rounded-sm border border-border-strong bg-surface px-3 text-[14px] text-text disabled:cursor-not-allowed disabled:bg-bg-alt disabled:text-text-3"
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={pending || freeLimitReached}
          >
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
              className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-t border-border py-[14px] first:border-t-0"
            >
              <div>
                <div className="font-medium text-text-3">{k.name}</div>
                <div className="font-mono text-[12px] text-text-2">
                  {k.prefix}…
                </div>
              </div>
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

function SecretBanner({
  created,
  onDismiss,
}: {
  created: CreatedKey;
  onDismiss: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(created.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — user can still select and copy manually */
    }
  };

  return (
    <section className="mb-5 rounded-md border border-[#a7f3d0] bg-[#ecfdf5] px-6 py-5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-semibold text-[#047857]">
          Key created — copy this now
        </h3>
        <button
          type="button"
          onClick={onDismiss}
          className="text-[13px] text-[#047857] underline-offset-2 hover:underline"
        >
          I&apos;ve saved it
        </button>
      </div>
      <p className="mb-3 text-[13px] leading-[1.5] text-[#047857]">
        This is the only time we show the full secret for{" "}
        <span className="font-medium">{created.name}</span>. Store it in your
        secret manager (Vercel / AWS / 1Password). If you lose it, revoke this
        key and create a new one.
      </p>
      <div className="flex gap-2">
        <input
          readOnly
          value={created.key}
          onFocus={(e) => e.currentTarget.select()}
          className="h-10 flex-1 rounded-sm border border-[#86efac] bg-surface px-3 font-mono text-[13px] text-text"
        />
        <button
          type="button"
          onClick={onCopy}
          className="btn btn-primary h-10 whitespace-nowrap"
        >
          {copied ? "Copied" : "Copy key"}
        </button>
      </div>
    </section>
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
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-t border-border py-[14px] first:border-t-0">
      <div>
        <div className="font-medium">{row.name}</div>
        <div className="font-mono text-[12px] text-text-2">
          {row.prefix}…
          {row.last_used_at && (
            <> · last used {new Date(row.last_used_at).toLocaleDateString()}</>
          )}
        </div>
      </div>
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
