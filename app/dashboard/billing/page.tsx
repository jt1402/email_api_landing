import Link from "next/link";
import { billing } from "@/lib/backend";
import { getSession } from "@/lib/session";
import { BundleButtons } from "./BundleButtons";

type Search = Promise<{ checkout?: string }>;

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const { checkout } = await searchParams;
  const token = (await getSession()) as string;
  const balance = await billing.balance(token);

  return (
    <>
      <h2 className="mb-7 text-[28px] leading-[1.2] tracking-[-0.02em]">Billing</h2>

      {checkout === "success" && (
        <div className="mb-5 rounded-xs border border-[#a7f3d0] bg-[#ecfdf5] px-3 py-[10px] text-[13px] leading-[1.5] text-[#047857]">
          Bundle purchased. Credits have been added to your account.
        </div>
      )}
      {checkout === "cancelled" && (
        <div className="mb-5 rounded-xs border border-border bg-bg-alt px-3 py-[10px] text-[13px] leading-[1.5] text-text-2">
          Checkout cancelled. No charge was made.
        </div>
      )}

      <section className="mb-5 rounded-md border border-border bg-surface px-7 py-6">
        <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.1em] text-text-2">
          Credits remaining
        </div>
        <div className="text-[40px] font-semibold leading-none tracking-[-0.02em] tabular-nums">
          {balance.credit_balance_checks.toLocaleString()}
        </div>
        <p className="mt-3 text-[14px] text-text-2">
          Every successful <span className="font-mono">/v1/check</span> call consumes one credit.
          When you run out, the API returns a <span className="font-mono">quota_exceeded</span> error
          until you buy a bundle. Credits never expire.
        </p>
      </section>

      <section className="mb-5 rounded-md border border-border bg-surface px-7 py-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h3 className="mb-1 text-[18px]">Buy a bundle</h3>
            <p className="text-[14px] text-text-2">
              One-time purchase. No subscription. Credits stack on top of what you have.
            </p>
          </div>
        </div>
        <BundleButtons />
      </section>

      <p className="text-[13px] text-text-3">
        Need something custom?{" "}
        <a href="mailto:sales@verifymail.dev" className="text-accent underline underline-offset-2">
          Contact sales
        </a>{" "}
        for volume pricing, SSO, or dedicated infrastructure.{" "}
        <Link href="/pricing" className="text-accent underline underline-offset-2">
          See all plans
        </Link>
        .
      </p>
    </>
  );
}
