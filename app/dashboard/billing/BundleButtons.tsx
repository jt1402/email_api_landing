"use client";

import { useTransition } from "react";
import { buyBundleAction } from "@/app/actions";

type Bundle = {
  id: "5k" | "10k" | "25k" | "50k" | "100k";
  checks: string;
  price: string;
  effective: string;
  save?: string;
};

const bundles: Bundle[] = [
  { id: "5k", checks: "5,000", price: "$15", effective: "$0.0030" },
  { id: "10k", checks: "10,000", price: "$25", effective: "$0.0025", save: "17%" },
  { id: "25k", checks: "25,000", price: "$55", effective: "$0.0022", save: "27%" },
  { id: "50k", checks: "50,000", price: "$95", effective: "$0.0019", save: "37%" },
  { id: "100k", checks: "100,000", price: "$170", effective: "$0.0017", save: "43%" },
];

export function BundleButtons() {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface">
      {bundles.map((b, i) => (
        <BundleRow key={b.id} bundle={b} last={i === bundles.length - 1} />
      ))}
    </div>
  );
}

function BundleRow({ bundle, last }: { bundle: Bundle; last: boolean }) {
  const [isPending, startTransition] = useTransition();
  return (
    <form
      action={(fd) => {
        fd.set("bundle", bundle.id);
        startTransition(() => {
          buyBundleAction(fd);
        });
      }}
      className={`grid grid-cols-[1.6fr_0.9fr_1.3fr_1fr_auto] items-center gap-5 px-7 py-5 transition-colors hover:bg-bg-alt max-[720px]:grid-cols-[1fr_1fr] max-[720px]:gap-2 ${
        last ? "" : "border-b border-border"
      }`}
    >
      <div className="font-medium tabular-nums max-[720px]:col-span-2 max-[720px]:text-[15px] max-[720px]:font-semibold">
        {bundle.checks} checks
      </div>
      <div className="text-[20px] font-semibold tabular-nums tracking-[-0.02em]">
        {bundle.price}
      </div>
      <div className="font-mono text-[14px] tabular-nums text-text-2">
        {bundle.effective} / check
      </div>
      <div className="text-[14px] font-medium text-ok">
        {bundle.save && `Save ${bundle.save}`}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="btn btn-primary max-[720px]:col-span-2 max-[720px]:mt-2 max-[720px]:w-full"
      >
        {isPending ? "Redirecting…" : "Buy now"}
      </button>
    </form>
  );
}
