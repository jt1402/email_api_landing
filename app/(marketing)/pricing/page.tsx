import Link from "next/link";

export default function PricingPage() {
  return (
    <>
      <section className="relative overflow-hidden py-24 pb-10 text-center before:pointer-events-none before:absolute before:inset-0 before:content-[''] before:[background:radial-gradient(60%_50%_at_50%_0%,rgba(46,111,158,0.08),transparent_60%)]">
        <div className="container-page relative">
          <div className="mb-[18px] inline-block font-mono text-[12px] font-medium uppercase tracking-[0.22em] text-text-2">
            Fair · Predictable · Simple
          </div>
          <h1 className="mx-auto max-w-[960px] text-balance">
            Pay for exactly what you use,<br />
            <span className="text-accent">no subscriptions.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-[1.55] text-text-2 text-pretty">
            <span className="font-semibold text-accent">First 100 checks are free.</span>{" "}
            Buy credits in bundles and save up to 43% — credits never expire, no monthly minimum, no seat fees.
          </p>
        </div>
      </section>

      <section className="pb-20 pt-2">
        <div className="container-page">
          <div className="mx-auto max-w-[880px] overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
            <PriceRow checks="10,000" price="$25" rate="$0.0025 / check" />
            <PriceRow checks="25,000" price="$55" rate="$0.0022 / check" save="Save 27%" />
            <PriceRow checks="50,000" price="$95" rate="$0.0019 / check" save="Save 37%" />
            <PriceRow checks="100,000" price="$170" rate="$0.0017 / check" save="Save 43%" />
            <ContactRow />
          </div>
          <div className="mt-6 text-center font-mono text-[13px] tracking-[0.02em] text-text-3">
            ✓ Credits never expire &nbsp;·&nbsp; ✓ Cached responses count as half a check
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-page">
          <div className="mx-auto max-w-[720px] rounded-lg border border-border bg-surface px-10 py-12 text-center shadow-sm">
            <svg
              className="mx-auto mb-5 h-8 w-8 text-accent opacity-60"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M3 17a4 4 0 0 1 4-4v-3a7 7 0 0 0-7 7v3h7v-3H3zm14 0a4 4 0 0 1 4-4v-3a7 7 0 0 0-7 7v3h7v-3h-4z" />
            </svg>
            <blockquote className="mb-7 text-[22px] italic leading-[1.45] tracking-[-0.01em] text-text text-pretty">
              &ldquo;VerifyMail has saved us a huge chunk of our budget without any loss in accuracy. Simpler and cheaper than everything we tried before.&rdquo;
            </blockquote>
            <div className="text-left text-[14px] font-semibold leading-[1.2]">
              Cameron Dawson
            </div>
            <div className="text-left text-[13px] leading-[1.2] text-text-2">
              Founder, Rivver Studios
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page">
          <div className="mb-12 text-center">
            <h2 className="mx-auto max-w-[720px] text-balance text-[clamp(26px,3vw,34px)]">
              Frequently asked questions
            </h2>
            <p className="mx-auto mt-3 max-w-[560px] text-[16px] text-text-2">
              Everything you need to know about the product and billing.
            </p>
          </div>
          <div className="mx-auto flex max-w-[760px] flex-col">
            <Faq q="Is there a free trial available?">
              Yes. Every new account gets 100 free checks. No credit card required. No time limit —
              use them when you need them.
            </Faq>
            <Faq q="What counts as a check?">
              Any successful call to <code className="font-mono">/v1/check</code> where we return a full scored
              response. Failed requests (timeouts, 5xx errors, invalid input) do not count against your
              credits.
            </Faq>
            <Faq q="Do cached responses count?">
              Cached responses cost you half a credit. Caching saves you money and latency — the API
              returns <code className="font-mono">meta.cached: true</code> so you always know what you&apos;re paying for.
            </Faq>
            <Faq q="Do credits expire?">
              No. Credits purchased through bundles never expire.
            </Faq>
            <Faq q="What happens if I run out of credits?">
              The API returns <code className="font-mono">402 quota_exceeded</code> with a clear error message and a
              link to your billing page. Buy another bundle and credits stack on top instantly — there&apos;s
              no subscription to renew, no prorations, no surprises.
            </Faq>
            <Faq q="What payment methods do you accept?">
              Card via Stripe (all major cards). Bank transfer for bundles over $100. Invoice billing
              for enterprise accounts.
            </Faq>
            <Faq q="Can I get a refund on unused credits?">
              Yes, within 30 days of purchase. After that, credits still don&apos;t expire — you can use
              them any time.
            </Faq>
            <Faq q="Is there an enterprise plan?">
              For over 100,000 checks/month or custom SLAs, contact{" "}
              <a href="mailto:sales@verifymailapi.com" className="font-mono text-accent">sales@verifymailapi.com</a>.
              We offer volume pricing, dedicated support, and custom risk profiles.
            </Faq>
          </div>
          <div className="mx-auto mt-12 max-w-[600px] border-t border-border pt-7 text-center">
            <div className="mb-[6px] text-[16px] font-semibold">Still have questions?</div>
            <p className="mb-4 text-[14px] text-text-2">
              Can&apos;t find the answer you&apos;re looking for? Chat with our team.
            </p>
            <a href="mailto:sales@verifymailapi.com" className="btn btn-ghost">
              Get in touch
            </a>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container-page">
          <div className="relative mx-auto max-w-[920px] overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-surface to-[#f6f6f3] px-6 py-18 text-center before:pointer-events-none before:absolute before:inset-0 before:content-[''] before:[background:radial-gradient(50%_60%_at_50%_0%,rgba(46,111,158,0.08),transparent_70%)] [&>*]:relative">
            <h3 className="mx-auto mb-7 max-w-[640px] text-balance text-[clamp(28px,3.4vw,38px)] leading-[1.15] tracking-[-0.025em]">
              Ready to stop fake signups?
            </h3>
            <Link href="/signup" className="btn btn-primary btn-lg">
              Get an API key
            </Link>
            <div className="mt-[14px] text-[13px] text-text-3">
              *No credit card needed. 100 checks free to start.
            </div>
          </div>
        </div>
      </section>
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

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group border-b border-border first:border-t first:border-t-border">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-[22px] text-[16px] font-medium text-text transition-colors hover:text-accent [&::-webkit-details-marker]:hidden">
        {q}
        <svg
          className="shrink-0 text-text-2 transition-transform duration-200 group-open:rotate-180 group-open:text-accent"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </summary>
      <div className="max-w-[680px] pb-6 text-[15px] leading-[1.65] text-text-2">
        {children}
      </div>
    </details>
  );
}
