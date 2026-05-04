import Link from "next/link";
import { billing } from "@/lib/backend";
import { getSession } from "@/lib/session";
import { BundleButtons } from "./BundleButtons";
import { MeteredCard } from "./MeteredCard";
import { RefreshAfterCheckout } from "./RefreshAfterCheckout";

type Search = Promise<{ checkout?: string; plan?: string }>;

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const { checkout, plan } = await searchParams;
  const token = (await getSession()) as string;
  const balance = await billing.balance(token);
  const isMetered = balance.billing_mode === "metered";

  return (
    <>
      <h2 className="mb-7 text-[28px] leading-[1.2] tracking-[-0.02em]">Billing</h2>

      {checkout === "success" && (
        <>
          <RefreshAfterCheckout />
          <div className="mb-5 rounded-xs border border-[#a7f3d0] bg-[#ecfdf5] px-3 py-[10px] text-[13px] leading-[1.5] text-[#047857]">
            {plan === "metered"
              ? "Metered subscription active. You'll be invoiced monthly for usage."
              : "Bundle purchased. Credits have been added to your account."}
          </div>
        </>
      )}
      {checkout === "cancelled" && (
        <div className="mb-5 rounded-xs border border-border bg-bg-alt px-3 py-[10px] text-[13px] leading-[1.5] text-text-2">
          Checkout cancelled. No charge was made.
        </div>
      )}

      <section className="mb-5 rounded-md border border-border bg-surface px-7 py-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-2">
            {isMetered ? "Current plan" : "Credits remaining"}
          </span>
          {isMetered && (
            <span className="rounded-xs bg-accent/10 px-2 py-[2px] font-mono text-[10px] uppercase tracking-[0.08em] text-accent">
              metered
            </span>
          )}
        </div>
        {isMetered ? (
          <>
            <div className="text-[28px] font-semibold leading-tight tracking-[-0.02em]">
              Pay-as-you-go &middot; $0.003 / check
            </div>
            <p className="mt-3 text-[14px] text-text-2">
              You're on the metered plan. Each successful check is invoiced at
              the end of the month. Cancel anytime from the customer portal.
              Any remaining bundle credits ({balance.credit_balance_checks.toLocaleString()})
              are preserved.
            </p>
          </>
        ) : (
          <>
            <div className="text-[40px] font-semibold leading-none tracking-[-0.02em] tabular-nums">
              {balance.credit_balance_checks.toLocaleString()}
            </div>
            <p className="mt-3 text-[14px] text-text-2">
              Every successful <span className="font-mono">/v1/check</span> call consumes one credit.
              When you run out, the API returns a <span className="font-mono">quota_exceeded</span> error
              until you buy a bundle. Credits never expire.
            </p>
          </>
        )}
      </section>

      {!isMetered && (
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
      )}

      {!isMetered && (
        <section className="mb-5 rounded-md border border-border bg-surface px-7 py-6">
          <div className="mb-4">
            <h3 className="mb-1 text-[18px]">Or switch to metered</h3>
            <p className="text-[14px] text-text-2">
              Pay $0.003 per check, billed monthly. No upfront commitment, no
              quota errors. Best for steady or unpredictable volume.
            </p>
          </div>
          <MeteredCard />
        </section>
      )}

      <p className="text-[13px] text-text-3">
        Need something custom?{" "}
        <a href="mailto:sales@verifymailapi.com" className="text-accent underline underline-offset-2">
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
