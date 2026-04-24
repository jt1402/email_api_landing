import Link from "next/link";
import { SDKTabs } from "@/components/SDKTabs";

export default function LandingPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden py-24 pb-10 text-center before:pointer-events-none before:absolute before:inset-0 before:content-[''] before:[background:radial-gradient(60%_50%_at_50%_0%,rgba(46,111,158,0.08),transparent_60%),radial-gradient(40%_30%_at_80%_15%,rgba(16,185,129,0.06),transparent_70%)]">
        <div className="container-page relative">
          <h1 className="mx-auto max-w-[900px]">
            Stop fake signups with a<br />
            <span className="text-accent">single API call</span>
          </h1>
          <p className="mx-auto mt-6 mb-8 max-w-[580px] text-[18px] leading-[1.55] text-text-2 text-pretty">
            Detect disposable, catch-all, and abusive email addresses at the moment of
            registration — with explainable signals, not a boolean.
          </p>
          <div className="inline-flex flex-col items-center gap-[10px]">
            <Link href="/signup" className="btn btn-primary btn-lg">
              Get 100 checks for free →
            </Link>
            <span className="text-[13px] text-text-3">
              No credit card · Credits never expire · p99 under 28ms
            </span>
          </div>
        </div>

        <div className="relative mx-auto mt-14 max-w-[960px] px-3">
          <div className="overflow-hidden rounded-[14px] border border-[#1f222a] bg-[#0b0d12] text-left shadow-[0_32px_60px_-20px_rgba(10,10,15,0.25),0_12px_24px_-8px_rgba(10,10,15,0.12),0_0_0_1px_rgba(46,111,158,0.06)]">
            <div className="flex items-center gap-3 border-b border-[#1f222a] bg-[#13161d] px-[14px] py-3">
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="block h-[11px] w-[11px] rounded-full bg-[#ff5f57]" />
                <span className="block h-[11px] w-[11px] rounded-full bg-[#febc2e]" />
                <span className="block h-[11px] w-[11px] rounded-full bg-[#28c840]" />
              </div>
              <div className="flex flex-1 items-center gap-2 overflow-hidden whitespace-nowrap rounded-lg border border-[#1f222a] bg-[#0b0d12] px-3 py-[6px] font-mono text-[12px] text-[#9aa3b5]">
                <svg
                  className="text-ok"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
                <span className="mr-1 rounded bg-accent/20 px-2 py-[2px] text-[11px] font-semibold text-[#a5b4fc]">
                  POST
                </span>
                https://api.verifymailapi.com/v1/check
              </div>
            </div>
            <div className="grid grid-cols-[38px_1fr] font-mono text-[13px] leading-[1.7]">
              <div
                className="select-none border-r border-[#1a1d24] bg-[#0a0c11] py-4 text-right text-[#3b414f]"
                aria-hidden="true"
              >
                {Array.from({ length: 22 }, (_, i) => (
                  <span className="block pr-[10px]" key={i}>
                    {i + 1}
                  </span>
                ))}
              </div>
              <pre className="m-0 overflow-x-auto px-[18px] py-4 text-[#e4e6eb]">
{`{
  "meta": {
    "request_id": "req_7f3a2c1b4e5d",
    "domain": "mailinator.com",
    "latency_ms": 4,
    "path_taken": "fast"
  },
  "verdict": {
    "recommendation": "block",
    "risk_level": "critical",
    "disposable": true,
    "summary": "Domain is a confirmed disposable email provider."
  },
  "score": {
    "value": 100,
    "confidence": 1.0,
    "confidence_level": "high"
  },
  "signals": {
    "fired": [
      { "name": "known_disposable_domain", "weight": 100 }
    ]
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-bg-alt py-28">
        <div className="container-page">
          <div className="mb-16 text-center">
            <h2 className="mx-auto max-w-[720px] text-balance">
              It&apos;s simple and it&apos;s fast.<br />
              Here&apos;s how it works.
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-6 max-[820px]:grid-cols-1">
            <Step num="01" title="Sign up" icon={<IconUser />}>
              Get 100 free checks on signup. Then buy credits — bundles from $0.0016/check. No subscriptions, no monthly minimums.
            </Step>
            <Step num="02" title="Call our API" icon={<IconBolt />}>
              Send a single HTTP request with the email. Get back a confidence-scored risk verdict in under 100ms.
            </Step>
            <Step num="03" title="Block fake signups" icon={<IconShield />}>
              Switch on the recommendation value — block / verify / flag / allow — and stop trial abuse before it starts.
            </Step>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-28">
        <div className="container-page">
          <div className="mb-16 text-center">
            <h2 className="mx-auto max-w-[720px] text-balance">You get responses that are…</h2>
          </div>

          <Feature tag="01 — SCORED" title="Confidence-scored, not boolean">
            <FeatureCopy>
              A 0–100 risk score paired with a confidence value between 0 and 1. The verdict
              recommendation is always one of four values —{" "}
              <span className="font-mono">block</span>,{" "}
              <span className="font-mono">verify_manually</span>,{" "}
              <span className="font-mono">allow_with_flag</span>,{" "}
              <span className="font-mono">allow</span> — so you can switch on it in code without
              parsing thresholds.
            </FeatureCopy>
            <JsonCard>
{`"score": {
  "value": 94,
  "confidence": 0.91,
  "confidence_level": "high"
},
"verdict": {
  "recommendation": "block",
  "risk_level": "critical"
}`}
            </JsonCard>
          </Feature>

          <Feature reverse tag="02 — EXPLAINABLE" title="Every signal, every weight">
            <FeatureCopy>
              Every response includes a <span className="font-mono">signals</span> array listing
              which signals fired, their direction (risk or trust), their weight, and why.
              Debug false positives in 10 seconds instead of opening a support ticket.
            </FeatureCopy>
            <JsonCard>
{`"fired": [
  { "name": "catch_all_confirmed",
    "direction": "risk", "weight": 55 },
  { "name": "domain_age_14_days",
    "direction": "risk", "weight": 42 },
  { "name": "mx_shared_with_9_domains",
    "direction": "risk", "weight": 35 }
]`}
            </JsonCard>
          </Feature>

          <Feature tag="03 — CATCH-ALL AWARE" title="Catch-all detection built in">
            <FeatureCopy>
              A Bayesian confidence model catches rotating catch-alls that defeat naive SMTP
              probes — combining infrastructure signals, behavioral history, and cross-customer
              network data into a single probability.
            </FeatureCopy>
            <div className="rounded-md border border-border bg-surface p-7 shadow-md">
              <div className="mb-5 font-mono text-[11px] uppercase tracking-[0.12em] text-text-3">
                Evidence → Probability
              </div>
              <div className="mb-5 grid grid-cols-2 gap-[10px]">
                <EvidenceItem>SMTP probe</EvidenceItem>
                <EvidenceItem>Infrastructure</EvidenceItem>
                <EvidenceItem>Behavioral history</EvidenceItem>
                <EvidenceItem>Network data</EvidenceItem>
              </div>
              <div
                className="relative h-6 overflow-hidden rounded-md [background:linear-gradient(to_right,var(--color-accent)_0%_97%,var(--color-border)_97%_100%)] after:absolute after:inset-0 after:flex after:items-center after:justify-center after:font-mono after:text-[12px] after:font-medium after:text-white after:content-['P(catch-all)_=_0.97']"
                role="img"
                aria-label="Catch-all probability 0.97"
              />
            </div>
          </Feature>

          <Feature reverse last tag="04 — FAST" title="Fast by design">
            <FeatureCopy>
              85% of traffic resolves from in-memory caches in under 5ms. Weighted p99 latency
              across all checks is under 28ms. Async-with-preliminary path for deep checks so
              your signup flow never waits.
            </FeatureCopy>
            <div className="rounded-md border border-border bg-surface p-7 shadow-md">
              <div className="mb-5 font-mono text-[11px] uppercase tracking-[0.12em] text-text-3">
                Latency distribution
              </div>
              <LatRow label="cache hit" pct={85} val="<5ms" />
              <LatRow label="fast path" pct={12} val="<150ms" />
              <LatRow label="deep check" pct={3} val="<800ms" last />
            </div>
          </Feature>
        </div>
      </section>

      {/* SDKs */}
      <section className="bg-bg-alt py-28">
        <div className="container-page">
          <div className="mb-16 text-center">
            <h2 className="mx-auto max-w-[720px] text-balance">Powerful SDKs</h2>
            <p className="mx-auto mt-4 max-w-[580px] text-[17px] text-text-2">
              Use VerifyMail with your favorite language or framework.
            </p>
          </div>
          <SDKTabs />
        </div>
      </section>

      {/* SIGNAL CATALOG */}
      <section className="py-28">
        <div className="container-page">
          <div className="mb-16 text-center">
            <div className="mb-3 inline-block font-mono text-[12px] font-medium uppercase tracking-[0.18em] text-text-2">
              Signal catalog
            </div>
            <h2 className="mx-auto max-w-[720px] text-balance text-[clamp(26px,2.8vw,34px)]">
              Every verdict is built from real signals.
            </h2>
            <p className="mx-auto mt-4 max-w-[580px] text-[17px] text-text-2">
              A preview of what the API actually checks — grouped by category, each with a weight in the score.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-5 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
            <SigGroup title="Blocklist" tone="risk" items={[
              ["known_disposable_domain", "+100"],
              ["mx_on_abuse_list", "+80"],
              ["asn_known_bad", "+60"],
            ]} />
            <SigGroup title="Infrastructure" tone="risk" items={[
              ["catch_all_confirmed", "+55"],
              ["domain_age_under_30d", "+42"],
              ["mx_shared_with_n_domains", "+35"],
              ["spf_missing", "+18"],
            ]} />
            <SigGroup title="Pattern" tone="risk" items={[
              ["random_localpart", "+38"],
              ["plus_addressing_suspicious", "+22"],
              ["role_based_address", "+15"],
              ["gmail_dot_trick", "+12"],
            ]} />
            <SigGroup title="Behavioral" tone="risk" items={[
              ["signup_velocity_high", "+45"],
              ["seen_across_n_tenants", "+30"],
              ["first_seen_within_hours", "+20"],
            ]} />
            <SigGroup title="Trust" tone="trust" items={[
              ["corporate_domain", "−40"],
              ["domain_age_over_5y", "−25"],
              ["reputable_mx_provider", "−20"],
            ]} />
            <div className="flex flex-col rounded-md border border-border bg-gradient-to-b from-surface to-bg-alt p-[22px] pb-5 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-[14px] inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-text-2">
                <span className="inline-block h-2 w-2 rounded-full bg-text-3" />
                And more
              </div>
              <p className="text-[14px] leading-[1.55] text-text-2">
                40+ signals across 6 categories. Every one returned in the{" "}
                <span className="font-mono">signals.fired[]</span> array with name, direction, and weight.
                Full list in the{" "}
                <Link
                  href="/docs"
                  className="border-b border-accent-soft text-accent hover:border-accent"
                >
                  docs
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-10">
        <div className="container-page">
          <div className="relative mx-auto max-w-[920px] overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-surface to-[#f6f6f3] px-6 py-18 text-center before:pointer-events-none before:absolute before:inset-0 before:content-[''] before:[background:radial-gradient(50%_60%_at_50%_0%,rgba(46,111,158,0.08),transparent_70%)] [&>*]:relative">
            <h3 className="mx-auto mb-7 max-w-[640px] text-balance text-[clamp(28px,3.4vw,38px)] leading-[1.15] tracking-[-0.025em]">
              Test out the API in seconds to see if it&apos;s a fit for you.
            </h3>
            <div className="mx-auto mb-8 max-w-[520px] border-l-2 border-accent px-6 py-4 text-left text-[16px] italic text-text-2">
              &quot;It took 5 minutes and just worked. Cheapest option that actually gets catch-alls right.&quot;
              <cite className="mt-2 block text-[14px] not-italic text-text-3">— Brad Henderson</cite>
            </div>
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

function Step({
  num,
  title,
  icon,
  children,
}: {
  num: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative rounded-md border border-border bg-surface px-7 py-8 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute right-7 top-7 font-mono text-[13px] text-text-3">
        {num}
      </div>
      <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-[10px] bg-accent-soft text-accent">
        {icon}
      </div>
      <h3 className="mb-2 text-[19px]">{title}</h3>
      <p className="text-[15px] leading-[1.55] text-text-2">{children}</p>
    </div>
  );
}

function Feature({
  reverse,
  last,
  tag,
  title,
  children,
}: {
  reverse?: boolean;
  last?: boolean;
  tag: string;
  title: string;
  children: React.ReactNode;
}) {
  const kids = Array.isArray(children) ? children : [children];
  const [text, vis] = kids;
  return (
    <div
      className={`grid grid-cols-2 items-center gap-[72px] ${
        last ? "" : "mb-28"
      } max-[880px]:grid-cols-1 max-[880px]:gap-10 max-[880px]:mb-20`}
    >
      <div className={reverse ? "order-2 max-[880px]:order-1" : ""}>
        <span className="mb-4 inline-block rounded-full bg-accent-soft px-[10px] py-1 font-mono text-[11px] tracking-[0.05em] text-accent">
          {tag}
        </span>
        <h3 className="mb-4 text-balance text-[28px] leading-[1.2] tracking-[-0.02em]">
          {title}
        </h3>
        {text}
      </div>
      <div className={reverse ? "order-1 max-[880px]:order-2" : ""}>{vis}</div>
    </div>
  );
}

function FeatureCopy({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[16px] leading-[1.6] text-text-2">{children}</p>
  );
}

function JsonCard({ children }: { children: React.ReactNode }) {
  return (
    <pre className="m-0 overflow-x-auto whitespace-pre rounded-md border border-code-border bg-code-bg px-[22px] py-5 font-mono text-[13px] leading-[1.75] text-[#e4e6eb] shadow-md">
      {children}
    </pre>
  );
}

function EvidenceItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-[10px] text-[13px] text-text-2">
      <span className="h-2 w-2 rounded-full bg-accent" />
      {children}
    </div>
  );
}

function LatRow({
  label,
  pct,
  val,
  last,
}: {
  label: string;
  pct: number;
  val: string;
  last?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[100px_1fr_56px] items-center gap-3 ${
        last ? "" : "mb-3"
      }`}
    >
      <div className="font-mono text-[12px] text-text-2">{label}</div>
      <div className="h-[10px] overflow-hidden rounded-full bg-bg-alt">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-right font-mono text-[12px] tabular-nums text-text">
        {val}
      </div>
    </div>
  );
}

function SigGroup({
  title,
  tone,
  items,
}: {
  title: string;
  tone: "risk" | "trust";
  items: [string, string][];
}) {
  const dotColor =
    tone === "risk" ? "bg-risk" : tone === "trust" ? "bg-ok" : "bg-text-3";
  return (
    <div className="rounded-md border border-border bg-surface px-[22px] pb-5 pt-[22px] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-[14px] inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-text-2">
        <span className={`inline-block h-2 w-2 rounded-full ${dotColor}`} />
        {title}
      </div>
      <ul className="m-0 flex list-none flex-col gap-[2px] p-0">
        {items.map(([name, weight], i) => (
          <li
            key={name}
            className={`flex items-center justify-between gap-3 py-2 text-[13px] ${
              i === 0 ? "" : "border-t border-border"
            }`}
          >
            <code className="overflow-hidden text-ellipsis whitespace-nowrap bg-transparent font-mono text-[12.5px] text-text">
              {name}
            </code>
            <span className="font-mono text-[12px] tabular-nums text-text-2">
              {weight}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function IconUser() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  );
}
function IconBolt() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
