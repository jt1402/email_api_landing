import Link from "next/link";

export default function PricingPage() {
  return (
    <>
      <section className="relative overflow-hidden py-24 pb-6 text-center before:pointer-events-none before:absolute before:inset-0 before:content-[''] before:[background:radial-gradient(60%_50%_at_50%_0%,rgba(46,111,158,0.08),transparent_60%)]">
        <div className="container-page relative">
          <div className="mb-[18px] inline-block font-mono text-[12px] font-medium uppercase tracking-[0.18em] text-text-2">
            Pricing
          </div>
          <h1 className="mx-auto max-w-[900px]">
            Start free.<br />
            <span className="text-accent">Pay for what you use.</span>
          </h1>
          <p className="mx-auto mt-6 mb-8 max-w-[580px] text-[18px] leading-[1.55] text-text-2 text-pretty">
            100 checks free on signup. Then buy credits in bundles — from $0.0025 per check.
            No subscriptions, no seats, no monthly minimums. Credits never expire.
          </p>
        </div>
      </section>

      <section className="py-28 pt-10">
        <div className="container-page">
          <div className="grid grid-cols-3 items-stretch gap-5 max-[820px]:grid-cols-1">
            <PriceCard
              name="Free"
              value="$0"
              unit="forever"
              desc="Kick the tires. No credit card required."
              items={[
                "100 checks on signup",
                "Full signal array in every response",
                "1 API key",
                "Community support",
              ]}
              cta={<Link href="/signup" className="btn btn-ghost btn-block">Get started</Link>}
            />
            <PriceCard
              featured
              name="Credits"
              value="$0.0025"
              unit="/ check"
              desc="Buy credits in bundles. Use them as you go, credits never expire."
              items={[
                "Everything in Free",
                "Unlimited volume",
                "Catch-all detection",
                "Unlimited API keys",
                "99.9% uptime SLA",
                "Email support",
              ]}
              cta={<Link href="/signup" className="btn btn-primary btn-block">Start free</Link>}
            />
            <PriceCard
              name="Enterprise"
              value="Custom"
              desc="For teams running millions of checks a month."
              items={[
                "Volume discounts",
                "Dedicated infrastructure",
                "99.99% uptime SLA",
                "SSO + audit logs",
                "Slack-shared support channel",
                "Custom signals + allowlists",
              ]}
              cta={
                <a href="mailto:sales@verifymail.dev" className="btn btn-ghost btn-block">
                  Contact sales
                </a>
              }
            />
          </div>
        </div>
      </section>

      <section className="bg-bg-alt py-28">
        <div className="container-page">
          <div className="mb-16 text-center">
            <div className="mb-3 inline-block font-mono text-[12px] font-medium uppercase tracking-[0.18em] text-text-2">
              Credit bundles
            </div>
            <h2 className="mx-auto max-w-[720px] text-balance text-[clamp(26px,2.8vw,34px)]">
              Prepay and save.
            </h2>
            <p className="mx-auto mt-4 max-w-[580px] text-[17px] text-text-2">
              Buy credits up front and lock in a lower per-check rate. Credits never expire.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 max-[820px]:grid-cols-1">
            <Bundle checks="10,000" price="$25" effective="$0.0025" save="17%" />
            <Bundle checks="50,000" price="$99" effective="$0.00198" save="34%" featured />
            <Bundle checks="250,000" price="$399" effective="$0.0016" save="47%" />
          </div>
        </div>
      </section>

      <section className="py-28">
        <div className="container-page">
          <div className="mb-16 text-center">
            <h2 className="mx-auto max-w-[720px] text-balance text-[clamp(26px,2.8vw,34px)]">
              Questions
            </h2>
          </div>
          <div className="mx-auto flex max-w-[760px] flex-col gap-2">
            <Faq q="What counts as a check?">
              Every API call to <span className="font-mono">/v1/check</span> that returns a verdict.
              Cached responses and 4xx validation errors are free.
            </Faq>
            <Faq q="Do credits expire?">
              No. Prepaid credits stay on your account until you use them. Pay-as-you-go overages
              roll into your next invoice.
            </Faq>
            <Faq q="What happens when I run out of credits?">
              The API returns a <span className="font-mono">402 quota_exceeded</span> error with a
              link to your billing page. Buy another bundle and credits stack on top instantly —
              there&apos;s no subscription to renew, no prorations, no surprises.
            </Faq>
            <Faq q="How fast is the API?">
              85% of traffic resolves from in-memory cache in under 5ms. Weighted p99 is under 28ms.
              Deep checks run async so your signup flow never blocks.
            </Faq>
            <Faq q="Is there a free tier forever?">
              The 100-check signup credit is one-time. For ongoing use, start with the 10K bundle
              at $25 — no subscription, no monthly minimum, and credits carry over until you use them.
            </Faq>
          </div>
        </div>
      </section>

      <section className="py-10">
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

function PriceCard({
  featured,
  name,
  value,
  unit,
  desc,
  items,
  cta,
}: {
  featured?: boolean;
  name: string;
  value: string;
  unit?: string;
  desc: string;
  items: string[];
  cta: React.ReactNode;
}) {
  return (
    <div
      className={`relative flex flex-col rounded-lg border bg-surface px-7 py-8 ${
        featured
          ? "border-accent shadow-[var(--shadow-md),0_0_0_1px_var(--color-accent)]"
          : "border-border shadow-sm"
      }`}
    >
      {featured && (
        <div className="absolute left-1/2 top-[-11px] -translate-x-1/2 rounded-full bg-accent px-3 py-[5px] font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-white shadow-[0_2px_6px_rgba(46,111,158,0.28)]">
          Most popular
        </div>
      )}
      <div className="mb-6">
        <div className="mb-[14px] font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-text-2">
          {name}
        </div>
        <div className="mb-3 flex items-baseline gap-2">
          <span className="text-[40px] font-semibold leading-none tracking-[-0.025em] text-text">
            {value}
          </span>
          {unit && <span className="text-[14px] text-text-2">{unit}</span>}
        </div>
        <p className="text-[14px] leading-[1.5] text-text-2">{desc}</p>
      </div>
      <ul className="m-0 mb-7 flex flex-1 list-none flex-col gap-[10px] p-0">
        {items.map((t) => (
          <li key={t} className="flex items-start gap-[10px] text-[14px] text-text">
            <CheckIcon />
            {t}
          </li>
        ))}
      </ul>
      {cta}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      className="mt-[2px] shrink-0 text-ok"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Bundle({
  checks,
  price,
  effective,
  save,
  featured,
}: {
  checks: string;
  price: string;
  effective: string;
  save: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`rounded-md border p-6 text-center ${
        featured ? "border-accent bg-accent-soft" : "border-border bg-surface"
      }`}
    >
      <div className="mb-3 font-mono text-[12px] uppercase tracking-[0.12em] text-text-2">
        {checks} checks
      </div>
      <div className="mb-[6px] text-[32px] font-semibold tracking-[-0.02em] text-text">
        {price}
      </div>
      <div className="mb-[10px] text-[13px] text-text-2">
        <span className="font-mono">{effective}</span> / check
      </div>
      <div className="inline-block rounded-full bg-ok px-[10px] py-[3px] font-mono text-[11px] font-medium tracking-[0.06em] text-white">
        Save {save}
      </div>
    </div>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group overflow-hidden rounded-sm border border-border bg-surface">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-[22px] py-[18px] text-[15px] font-medium text-text [&::-webkit-details-marker]:hidden">
        {q}
        <svg
          className="shrink-0 text-text-3 transition-transform duration-200 group-open:rotate-180"
          width="16"
          height="16"
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
      <div className="px-[22px] pb-5 text-[14px] leading-[1.65] text-text-2">
        {children}
      </div>
    </details>
  );
}
