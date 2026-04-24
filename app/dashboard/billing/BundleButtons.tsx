"use client";

import { useTransition } from "react";
import { buyBundleAction } from "@/app/actions";

type Bundle = {
  id: "10k" | "50k" | "250k";
  checks: string;
  price: string;
  effective: string;
  save?: string;
  featured?: boolean;
};

const bundles: Bundle[] = [
  { id: "10k", checks: "10,000", price: "$25", effective: "$0.0025" },
  { id: "50k", checks: "50,000", price: "$99", effective: "$0.00198", save: "34%", featured: true },
  { id: "250k", checks: "250,000", price: "$399", effective: "$0.0016", save: "47%" },
];

export function BundleButtons() {
  return (
    <div className="grid grid-cols-3 gap-4 max-[820px]:grid-cols-1">
      {bundles.map((b) => (
        <BundleCard key={b.id} bundle={b} />
      ))}
    </div>
  );
}

function BundleCard({ bundle }: { bundle: Bundle }) {
  const [isPending, startTransition] = useTransition();
  return (
    <form
      action={(fd) => {
        fd.set("bundle", bundle.id);
        startTransition(() => {
          buyBundleAction(fd);
        });
      }}
      className={`rounded-md border p-6 text-center transition-transform ${
        bundle.featured
          ? "border-accent bg-accent-soft"
          : "border-border bg-surface hover:-translate-y-0.5 hover:shadow-md"
      }`}
    >
      <div className="mb-3 font-mono text-[12px] uppercase tracking-[0.12em] text-text-2">
        {bundle.checks} checks
      </div>
      <div className="mb-[6px] text-[32px] font-semibold tracking-[-0.02em] text-text">
        {bundle.price}
      </div>
      <div className="mb-4 text-[13px] text-text-2">
        <span className="font-mono">{bundle.effective}</span> / check
      </div>
      {bundle.save && (
        <div className="mb-4 inline-block rounded-full bg-ok px-[10px] py-[3px] font-mono text-[11px] font-medium tracking-[0.06em] text-white">
          Save {bundle.save}
        </div>
      )}
      <button
        type="submit"
        disabled={isPending}
        className={`btn btn-block ${bundle.featured ? "btn-primary" : "btn-ghost"}`}
      >
        {isPending ? "Redirecting…" : "Buy bundle"}
      </button>
    </form>
  );
}
