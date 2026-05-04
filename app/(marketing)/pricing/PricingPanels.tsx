import Link from "next/link";

export function PricingPanels() {
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
