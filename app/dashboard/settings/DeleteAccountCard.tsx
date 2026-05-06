"use client";

import { useState, useTransition } from "react";
import { deleteAccountAction } from "@/app/actions";

export function DeleteAccountCard({ email }: { email: string }) {
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="btn h-10 border border-[#b91c1c] bg-white text-[14px] text-[#b91c1c] hover:bg-[#fee2e2]"
      >
        Delete account
      </button>
    );
  }

  const matches = typed.trim().toLowerCase() === email.toLowerCase();

  return (
    <div className="flex flex-col gap-3 rounded-md border border-[#fecaca] bg-white px-4 py-4">
      <p className="text-[13px] leading-[1.5] text-text-2">
        Type{" "}
        <span className="font-mono text-text">{email}</span>{" "}
        below to confirm. This is irreversible.
      </p>
      <input
        type="text"
        autoFocus
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        placeholder={email}
        autoComplete="off"
        spellCheck={false}
        className="w-full rounded-sm border border-border bg-surface px-3 py-2 font-mono text-[13px] outline-none focus:border-accent"
      />
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!matches || pending}
          onClick={() =>
            startTransition(async () => {
              const result = await deleteAccountAction();
              if (result && !result.ok) {
                setError(result.error);
              }
            })
          }
          className="btn h-9 border border-[#b91c1c] bg-[#b91c1c] text-[13px] text-white hover:bg-[#991b1b] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#b91c1c]"
        >
          {pending ? "Deleting…" : "Delete forever"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setConfirming(false);
            setTyped("");
            setError(null);
          }}
          className="btn btn-ghost h-9 text-[13px]"
        >
          Cancel
        </button>
      </div>
      {error && (
        <p className="text-[13px] text-[#b91c1c]">{error}</p>
      )}
    </div>
  );
}
