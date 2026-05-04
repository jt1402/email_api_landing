"use client";

import { useTransition } from "react";
import { subscribeMeteredAction } from "@/app/actions";

export function MeteredCard() {
  const [isPending, startTransition] = useTransition();
  return (
    <form
      action={() => startTransition(() => subscribeMeteredAction())}
      className="grid grid-cols-[1fr_auto] items-center gap-5 rounded-md border border-border bg-bg-alt px-6 py-5 max-[720px]:grid-cols-1"
    >
      <div>
        <div className="text-[20px] font-semibold tracking-[-0.02em]">
          $0.003 <span className="text-[14px] font-normal text-text-2">/ check</span>
        </div>
        <p className="mt-1 text-[14px] text-text-2">
          Billed monthly for what you use. Cancel anytime.
        </p>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="btn btn-primary max-[720px]:w-full"
      >
        {isPending ? "Redirecting…" : "Subscribe"}
      </button>
    </form>
  );
}
