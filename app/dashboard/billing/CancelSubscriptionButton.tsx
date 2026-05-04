"use client";

import { useState, useTransition } from "react";
import { cancelSubscriptionAction } from "@/app/actions";

export function CancelSubscriptionButton() {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="btn btn-ghost text-[14px]"
      >
        Switch back to bundles
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-bg-alt px-4 py-3">
      <p className="text-[13px] leading-[1.5] text-text-2">
        We&apos;ll schedule the cancellation for the end of your current
        billing period. You&apos;ll be invoiced for the metered usage
        accumulated this period, then auto-revert to bundles. You keep
        metered access until then. Continue?
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await cancelSubscriptionAction();
              if (!result.ok) {
                setError(result.error);
              } else {
                setConfirming(false);
                setError(null);
              }
            })
          }
          className="btn btn-primary text-[13px]"
        >
          {pending ? "Scheduling…" : "Schedule cancellation"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setConfirming(false);
            setError(null);
          }}
          className="btn btn-ghost text-[13px]"
        >
          Keep subscription
        </button>
      </div>
      {error && (
        <p className="text-[13px] text-[#b91c1c]">{error}</p>
      )}
    </div>
  );
}
