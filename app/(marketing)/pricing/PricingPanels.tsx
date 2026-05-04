"use client";

import Link from "next/link";
import { useState } from "react";

type Mode = "metered" | "credits";

export function PricingPanels() {
  const [mode, setMode] = useState<Mode>("credits");

  return (
    <>
      <div className="mb-12 flex justify-center">
        <div
          role="tablist"
          aria-label="Pricing mode"
          className="inline-flex items-center rounded-full border border-border bg-surface p-1 shadow-sm"
        >
          <ToggleButton
            active={mode === "metered"}
            onClick={() => setMode("metered")}
          >
            Metered billing
          </ToggleButton>
          <ToggleButton
            active={mode === "credits"}
            onClick={() => setMode("credits")}
          >
            Pay as you go
            <span
              className={`ml-2 rounded-full px-[8px] py-[2px] font-mono text-[10px] font-semibold uppercase tracking-[0.04em] transition-colors ${
                mode === "credits"
                  ? "bg-white/22 text-white"
                  : "bg-accent-soft text-accent"
              }`}
            >
              Save 43%
            </span>
          </ToggleButton>
        </div>
      </div>

      {mode === "metered" ? <MeteredPanel /> : <CreditsPanel />}
    </>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      onClick={onClick}
      aria-selected={active}
      className={`inline-flex items-center gap-2 rounded-full px-[22px] py-[10px] text-[14px] font-medium transition-colors ${
        active
          ? "bg-accent text-white shadow-[0_2px_6px_rgba(46,111,158,0.3)]"
          : "text-text-2 hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}

function MeteredPanel() {
  return (
    <div className="mx-auto max-w-[640px] overflow-hidden rounded-lg border border-border bg-surface px-10 py-12 text-center shadow-sm">
      <div className="mb-2 inline-block rounded-xs bg-accent/10 px-2 py-[3px] font-mono text-[10px] uppercase tracking-[0.12em] text-accent">
        Metered
      </div>
      <div className="mb-2 text-[56px] font-semibold leading-none tracking-[-0.03em]">
        $0.003
      </div>
      <div className="mb-6 text-[16px] text-text-2">/ check</div>
      <p className="mx-auto mb-8 max-w-[440px] text-[15px] leading-[1.6] text-text-2">
        Billed monthly for exactly what you sent. Zero usage = zero charge.
        100 free checks on signup. Cancel anytime.
      </p>
      <Link href="/signup" className="btn btn-primary btn-lg">
        Sign up free →
      </Link>
      <div className="mt-4 text-[13px] text-text-3">
        No credit card needed to start.
      </div>
    </div>
  );
}

function CreditsPanel() {
  return (
    <>
      <div className="mx-auto max-w-[880px] overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
        <PriceRow checks="5,000" price="$15" rate="$0.0030 / check" />
        <PriceRow checks="10,000" price="$25" rate="$0.0025 / check" save="Save 17%" />
        <PriceRow checks="25,000" price="$55" rate="$0.0022 / check" save="Save 27%" />
        <PriceRow checks="50,000" price="$95" rate="$0.0019 / check" save="Save 37%" />
        <PriceRow checks="100,000" price="$170" rate="$0.0017 / check" save="Save 43%" />
        <ContactRow />
      </div>
      <div className="mt-6 text-center font-mono text-[13px] tracking-[0.02em] text-text-3">
        ✓ Credits never expire &nbsp;·&nbsp; ✓ Cached responses count as half a check
      </div>
    </>
  );
}

function PriceRow({
  checks,
  price,
  rate,
  save,
}: {
  checks: string;
  price: string;
  rate: string;
  save?: string;
}) {
  return (
    <div className="grid grid-cols-[1.6fr_0.9fr_1.3fr_1fr_auto] items-center gap-5 border-b border-border px-7 py-[22px] transition-colors hover:bg-bg-alt max-[720px]:grid-cols-[1fr_1fr] max-[720px]:gap-x-4 max-[720px]:gap-y-[6px] max-[720px]:px-5">
      <div className="text-[17px] font-medium tabular-nums tracking-[-0.01em] text-text max-[720px]:col-span-2 max-[720px]:text-[15px] max-[720px]:font-semibold">
        {checks} checks
      </div>
      <div className="text-[20px] font-semibold tabular-nums tracking-[-0.02em] text-text max-[720px]:text-[17px]">
        {price}
      </div>
      <div className="font-mono text-[14px] tabular-nums text-text-2 max-[720px]:justify-self-end max-[720px]:text-[13px]">
        {rate}
      </div>
      <div className="text-[14px] font-medium text-ok max-[720px]:justify-self-start max-[720px]:text-[13px]">
        {save}
      </div>
      <Link
        href="/signup"
        className="btn btn-primary h-10 max-[720px]:col-span-2 max-[720px]:mt-2 max-[720px]:w-full"
      >
        Buy now
      </Link>
    </div>
  );
}

function ContactRow() {
  return (
    <div className="grid grid-cols-[1.6fr_1fr] items-center gap-5 bg-bg-alt px-7 py-[22px] max-[720px]:grid-cols-1 max-[720px]:text-center">
      <div className="text-[17px] font-medium tracking-[-0.01em]">100,000+ checks</div>
      <a
        href="mailto:sales@verifymailapi.com"
        className="btn btn-primary h-11 justify-self-end max-[720px]:w-full max-[720px]:justify-self-center"
      >
        Contact us for custom pricing →
      </a>
    </div>
  );
}
