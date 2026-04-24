import Link from "next/link";
import { DocsToc } from "@/components/DocsToc";

export default function DocsPage() {
  return (
    <section className="pt-4">
      <div className="container-page">
        <div className="grid grid-cols-[240px_1fr] items-start gap-14 max-[900px]:grid-cols-1 max-[900px]:gap-8">
          <DocsToc />

          <article className="min-w-0 max-w-[760px]">
            <div className="mb-4 font-mono text-[12px] tracking-[0.05em] text-text-3">
              DOCS · v2026-04
            </div>
            <h1 className="mb-4 text-[38px] font-semibold leading-[1.15] tracking-[-0.025em]">
              VerifyMail API
            </h1>
            <p className="mb-10 text-[17px] leading-[1.65] text-text-2">
              A single endpoint that tells you whether the person behind an email is real.
              Confidence-weighted risk scores, explainable signals, and catch-all detection built in.
            </p>

            <Section id="introduction">
              <H2>Introduction</H2>
              <P>
                VerifyMail identifies throwaway, disposable, catch-all, and abusive email addresses
                at signup. Instead of a boolean &ldquo;valid/invalid&rdquo; flag, every call to{" "}
                <Code>/v1/check</Code> returns a <strong>5-block response</strong> —{" "}
                <Code>meta</Code>, <Code>verdict</Code>, <Code>score</Code>, <Code>signals</Code>,
                and <Code>checks</Code> — so you can make nuanced policy decisions from a single
                request.
              </P>
              <P>
                The entire API is intentionally small. One endpoint handles 99% of traffic.
                Supporting endpoints let you report false positives, monitor usage, and subscribe
                to async webhooks.
              </P>
              <Callout>
                <strong>Positioning:</strong> Email verification tells you the address exists.
                VerifyMail tells you whether the person behind it is real.
              </Callout>
            </Section>

            <Section id="quickstart">
              <H2>Quickstart</H2>
              <P>Install the SDK for your language and make your first check in under 60 seconds.</P>

              <H3>1. Install</H3>
              <CodeBlock label="terminal">
{`# Node
npm install verifymail

# Python
pip install verifymail`}
              </CodeBlock>

              <H3>2. Make your first check</H3>
              <CodeBlock label="first_check.py">
{`from verifymail import VerifyMail

client = VerifyMail(api_key="vm_live_...")
result = client.check("user@mailinator.com")

print(result.verdict.recommendation)  # -> "block"
print(result.score.value)             # -> 100
print(result.score.confidence)        # -> 1.0`}
              </CodeBlock>

              <H3>3. Switch on the recommendation</H3>
              <CodeBlock label="signup.js">
{`switch (result.verdict.recommendation) {
  case 'block':           throw new Error(result.verdict.summary);
  case 'verify_manually': queueForReview(email, result); break;
  case 'allow_with_flag': logSuspicious(email, result.signals.fired); break;
  case 'allow':           break;
}`}
              </CodeBlock>
            </Section>

            <Section id="authentication">
              <H2>Authentication</H2>
              <P>
                Every request requires an API key, sent as the <Code>X-API-Key</Code> header. Keys
                are environment-scoped: <Code>vm_live_*</Code> for production,{" "}
                <Code>vm_test_*</Code> for staging and tests.
              </P>
              <CodeBlock label="shell">
{`export VERIFYMAIL_KEY="vm_live_..."

curl -H "X-API-Key: $VERIFYMAIL_KEY" \\
  https://api.verifymailapi.com/v1/check?email=test@example.com`}
              </CodeBlock>
              <P>
                Rotate keys freely from the{" "}
                <DocsLink href="/dashboard/keys">dashboard</DocsLink> — previous keys remain valid
                for 24 hours to give you a grace window.
              </P>
            </Section>

            <Section id="rate-limits">
              <H2>Rate limits</H2>
              <P>
                Default limit is <strong>100 requests / second</strong> per API key, bursting to
                500 with token-bucket smoothing. Requests over the limit return <Code>429</Code>{" "}
                with a <Code>Retry-After</Code> header. For higher volume, contact support.
              </P>
            </Section>

            <Section id="check">
              <H2>POST /v1/check</H2>
              <P>
                The single core endpoint. Accepts an email, returns a full 5-block scored response.
              </P>

              <H3>Request</H3>
              <CodeBlock label="request">
{`POST https://api.verifymailapi.com/v1/check
X-API-Key: vm_live_...
X-Risk-Profile: balanced   # optional — strict | balanced | permissive
Content-Type: application/json

{ "email": "user@myagency-solutions.com" }`}
              </CodeBlock>

              <H3>Response — catch-all fraud example</H3>
              <CodeBlock label="200 OK · application/json">
{`{
  "meta": {
    "request_id": "req_8d4b3e2f1a6c",
    "email": "user@myagency-solutions.com",
    "domain": "myagency-solutions.com",
    "checked_at": "2026-04-21T10:24:12.391Z",
    "latency_ms": 94,
    "api_version": "2026-04",
    "path_taken": "standard",
    "cached": false
  },
  "verdict": {
    "recommendation": "block",
    "risk_level": "critical",
    "disposable": false,
    "catch_all": true,
    "safe_to_send": false,
    "summary": "Domain is 14 days old, configured as catch-all, and matches known fraud infrastructure."
  },
  "score": {
    "value": 94,
    "confidence": 0.91,
    "confidence_level": "high",
    "thresholds": {
      "block_at": 70,
      "flag_at": 45,
      "your_profile": "balanced"
    },
    "catch_all_detail": {
      "detected": true,
      "probability": 0.97,
      "confidence": 0.94,
      "type": "confirmed"
    }
  },
  "signals": {
    "fired": [
      { "name": "catch_all_confirmed",  "direction": "risk", "weight": 55 },
      { "name": "domain_age_14_days",   "direction": "risk", "weight": 42 },
      { "name": "mx_shared_with_9_domains", "direction": "risk", "weight": 35 }
    ]
  }
}`}
              </CodeBlock>
            </Section>

            <Section id="report">
              <H2>POST /v1/report</H2>
              <P>
                Report a false positive or false negative to tune VerifyMail against your
                workload. Reports feed the network-effect model and are shared (de-identified)
                across customers.
              </P>
              <CodeBlock label="request">
{`POST /v1/report
{ "request_id": "req_8d4b3e2f1a6c",
  "correct_verdict": "allow",
  "notes": "Customer converted and paid." }`}
              </CodeBlock>
            </Section>

            <Section id="usage">
              <H2>GET /v1/usage</H2>
              <P>
                Returns your current-period usage, credit balance, and next billing window.
                Useful for dashboards and budget guards.
              </P>
            </Section>

            <Section id="schema">
              <H2>The 5-block structure</H2>
              <P>Every response has the same top-level shape. Each block has a single purpose:</P>
              <Table
                head={["Block", "Purpose"]}
                rows={[
                  [<Code key="c">meta</Code>, "Request fingerprint: request_id, email, timing, API version, cache hit flag."],
                  [<Code key="c">verdict</Code>, <>The single actionable field: <Code>recommendation</Code> + human-readable <Code>summary</Code> + high-level booleans (<Code>disposable</Code>, <Code>catch_all</Code>).</>],
                  [<Code key="c">score</Code>, "Quantitative output: 0–100 risk score, confidence 0–1, applied thresholds, catch-all probability detail."],
                  [<Code key="c">signals</Code>, "Every signal that fired, its direction (risk/trust) and weight. The \"why\" behind the verdict."],
                  [<Code key="c">checks</Code>, "Which physical probes ran (DNS, SMTP, blocklist) and how long each took. Useful for debugging latency."],
                ]}
              />
            </Section>

            <Section id="recommendations">
              <H2>The 4 recommendation values</H2>
              <P>
                The <Code>verdict.recommendation</Code> field is always one of exactly four
                strings — switch on it directly without parsing thresholds.
              </P>
              <Table
                head={["Value", "Meaning", "Suggested action"]}
                rows={[
                  [<span key="v" className="font-mono text-risk">block</span>, "High confidence this is abuse or a dead address.", "Refuse signup. Show a generic error."],
                  [<span key="v" className="font-mono text-warn">verify_manually</span>, "Suspicious but ambiguous — could be legitimate.", "Send a confirmation email; hold pending click-through."],
                  [<span key="v" className="font-mono text-[#0f766e]">allow_with_flag</span>, "Mostly trusted but some risk signals present.", "Allow signup, tag for post-hoc review or rate-limited onboarding."],
                  [<span key="v" className="font-mono text-ok">allow</span>, "Clean. No material risk signals.", "Proceed normally."],
                ]}
              />
            </Section>

            <Section id="risk-profiles">
              <H2>Risk profiles</H2>
              <P>
                Three built-in profiles control the block/flag thresholds applied to the raw 0–100
                score. Send <Code>X-Risk-Profile: strict | balanced | permissive</Code> per
                request, or set an account default.
              </P>
              <Table
                head={["Profile", "block_at", "flag_at", "Best for"]}
                rows={[
                  [<strong key="p">strict</strong>, "55", "35", "Payment or financial services — false positives acceptable."],
                  [<span key="p"><strong>balanced</strong> <span className="ml-1 rounded-full bg-[#eef2ff] px-2 py-[2px] font-mono text-[10px] text-[#4f46e5]">default</span></span>, "70", "50", "SaaS signup, marketing tools, most B2B."],
                  [<strong key="p">permissive</strong>, "85", "65", "Consumer apps with high-funnel priority — minimize friction."],
                ]}
              />
            </Section>

            <Section id="catch-all">
              <H2>Catch-all detection</H2>
              <P>
                Catch-all domains accept mail for any address, which defeats naive SMTP probes.
                VerifyMail combines four evidence sources into a single Bayesian probability:
              </P>
              <ol className="mb-4 list-decimal pl-5 text-[15.5px] leading-[1.7] text-text-2">
                <li className="mb-[6px]"><strong>SMTP probe result</strong> — response to a random-UUID recipient.</li>
                <li className="mb-[6px]"><strong>Infrastructure signals</strong> — MX configuration, WHOIS age, ASN reputation.</li>
                <li className="mb-[6px]"><strong>Behavioral history</strong> — delivery/bounce patterns from past traffic.</li>
                <li className="mb-[6px]"><strong>Cross-customer network data</strong> — correlation with confirmed fraud on shared infrastructure.</li>
              </ol>

              <H3>Worked example A — fraud catch-all</H3>
              <P>
                Domain registered 14 days ago, MX shared with 9 other domains (7 confirmed
                disposable), SMTP accepts UUID addresses:
              </P>
              <CodeBlock label="summary">
{`catch_all.probability       =  0.97
catch_all.confidence        =  0.94
catch_all.type              =  "confirmed"
verdict.recommendation      =  "block"`}
              </CodeBlock>

              <H3>Worked example B — legitimate catch-all</H3>
              <P>
                Domain registered 6 years ago, SPF/DMARC aligned, healthy delivery history, SMTP
                accepts UUID addresses:
              </P>
              <CodeBlock label="summary">
{`catch_all.probability            =  0.88
catch_all.legitimate_use_likely  =  true
catch_all.type                   =  "legitimate"
verdict.recommendation           =  "allow_with_flag"`}
              </CodeBlock>
            </Section>

            <Section id="signals-ref">
              <H2>Signals reference</H2>
              <P>
                A representative slice of what VerifyMail evaluates, with balanced-profile
                weights. Risk signals add to the score, trust signals subtract.
              </P>
              <div className="max-h-[560px] overflow-auto rounded-sm border border-border">
                <table className="w-full min-w-[720px] border-collapse text-[13.5px]">
                  <thead className="sticky top-0 bg-bg-alt">
                    <tr>
                      <TH>Signal</TH>
                      <TH>Category</TH>
                      <TH>Dir.</TH>
                      <TH>Weight</TH>
                      <TH>Description</TH>
                    </tr>
                  </thead>
                  <tbody>
                    <SignalRow name="malformed_local_part" cat="structural" dir="risk" weight="20" desc="Local part contains disallowed characters or invalid encoding." />
                    <SignalRow name="typo_of_popular_domain" cat="structural" dir="risk" weight="15" desc={<>Likely typo of a major provider (e.g. <Code>gmial.com</Code>).</>} />
                    <SignalRow name="role_address" cat="structural" dir="risk" weight="12" desc="Generic role address (admin@, info@, noreply@)." />
                    <SignalRow name="known_disposable_domain" cat="blocklist" dir="risk" weight="100" desc="Domain on confirmed disposable blocklist." />
                    <SignalRow name="domain_age_under_30_days" cat="domain" dir="risk" weight="42" desc="Recently-registered domain. Fraud domains are almost always fresh." />
                    <SignalRow name="no_mx_records" cat="domain" dir="risk" weight="70" desc="Domain has no MX records — cannot receive mail." />
                    <SignalRow name="domain_parking" cat="domain" dir="risk" weight="50" desc="Domain resolves to a parking / for-sale page." />
                    <SignalRow name="free_domain_tld" cat="domain" dir="risk" weight="18" desc="Uses a free or high-abuse TLD (.tk, .ml, .ga, etc)." />
                    <SignalRow name="mx_shared_with_fraud" cat="infra" dir="risk" weight="35" desc="MX infrastructure shared with confirmed fraud domains." />
                    <SignalRow name="asn_high_abuse" cat="infra" dir="risk" weight="22" desc="MX host on an ASN with high historical abuse rate." />
                    <SignalRow name="catch_all_confirmed" cat="smtp" dir="risk" weight="55" desc="SMTP returned 250 for a random UUID recipient." />
                    <SignalRow name="smtp_greeting_suspicious" cat="smtp" dir="risk" weight="12" desc="SMTP banner matches known fraud-tool signatures." />
                    <SignalRow name="mailbox_does_not_exist" cat="smtp" dir="risk" weight="80" desc="SMTP 550 — mailbox explicitly rejected." />
                    <SignalRow name="abuse_history_network" cat="behav" dir="risk" weight="40" desc="Cross-customer signal: this address or domain has abused other accounts." />
                    <SignalRow name="high_bounce_history" cat="behav" dir="risk" weight="28" desc="Domain has elevated historical bounce rate." />
                    <SignalRow name="signup_velocity_spike" cat="behav" dir="risk" weight="18" desc="Domain involved in recent signup velocity anomaly." />
                    <SignalRow name="major_provider_gmail" cat="trust" dir="trust" weight="-30" desc="Gmail / Workspace address with valid MX." />
                    <SignalRow name="major_provider_outlook" cat="trust" dir="trust" weight="-28" desc="Outlook / Microsoft 365 address with valid MX." />
                    <SignalRow name="domain_age_over_2_years" cat="trust" dir="trust" weight="-18" desc="Domain registered over 2 years ago." />
                    <SignalRow name="dmarc_aligned" cat="trust" dir="trust" weight="-14" desc="Domain publishes aligned SPF / DMARC policy." />
                    <SignalRow name="healthy_delivery_history" cat="trust" dir="trust" weight="-22" desc="Past deliveries to domain have high engagement and low bounce." />
                    <SignalRow name="corporate_domain" cat="trust" dir="trust" weight="-12" desc="Domain has WHOIS registered to a verifiable organization." />
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-[13px] text-text-3">
                Above: 22 representative signals. The full reference includes 80+ signals across
                all categories.
              </p>
            </Section>

            <Section id="sdks">
              <H2>SDKs</H2>
              <P>Official clients for four languages, with full types for every response field.</P>
              <H3>Python</H3>
              <P>
                Install via <Code>pip install verifymail</Code>. The client is sync by default;
                import <Code>AsyncVerifyMail</Code> for asyncio support.
              </P>
              <H3>Node.js</H3>
              <P>
                Install via <Code>npm install verifymail</Code>. Ships with full TypeScript types
                for every field in the response.
              </P>
              <H3>PHP</H3>
              <P>
                Install via <Code>composer require verifymail/verifymail</Code>. PHP 8.1+; uses
                readonly properties for the response object.
              </P>
              <H3>Go</H3>
              <P>
                Install via <Code>go get github.com/verifymail/verifymail-go</Code>. Context-aware,
                zero external dependencies beyond the stdlib.
              </P>
            </Section>

            <Section id="webhooks">
              <H2>Webhooks</H2>
              <P>
                Deep checks run async when latency budget would exceed 300ms. Subscribe to{" "}
                <Code>check.completed</Code> events to receive the full response when the
                background job finishes. Preliminary response is returned synchronously.
              </P>
            </Section>

            <Section id="errors">
              <H2>Errors</H2>
              <P>All errors return a consistent shape:</P>
              <CodeBlock label="error response">
{`{
  "error": {
    "code": "invalid_email",
    "message": "Email failed syntax validation.",
    "request_id": "req_..."
  }
}`}
              </CodeBlock>
              <Table
                head={["HTTP", "Code", "Meaning"]}
                rows={[
                  ["400", <Code key="c">invalid_email</Code>, "Email failed syntax validation."],
                  ["401", <Code key="c">invalid_api_key</Code>, "API key missing or unknown."],
                  ["403", <Code key="c">key_scope_denied</Code>, "Key does not have permission for this environment."],
                  ["429", <Code key="c">rate_limited</Code>, <>Rate limit exceeded. See <Code>Retry-After</Code>.</>],
                  ["402", <Code key="c">quota_exceeded</Code>, "No credits remaining. Buy a bundle to keep going."],
                  ["500", <Code key="c">internal_error</Code>, "Transient server error. Safe to retry with backoff."],
                  ["503", <Code key="c">deep_check_unavailable</Code>, "Deep check service temporarily unavailable — fast-path result returned."],
                ]}
              />
            </Section>

            <Section id="versioning" last>
              <H2>Versioning</H2>
              <P>
                API versions use <Code>YYYY-MM</Code> format. Pin a version with the{" "}
                <Code>API-Version</Code> header:
              </P>
              <CodeBlock label="header">
{`API-Version: 2026-04`}
              </CodeBlock>
              <P>
                Breaking changes release on a new dated version. We support <strong>6 months</strong>{" "}
                of deprecation for every version before removal, with migration guides published 3
                months in advance. Unversioned requests use the oldest supported version to guarantee
                stability.
              </P>
            </Section>
          </article>
        </div>
      </div>
    </section>
  );
}

function Section({
  id,
  last,
  children,
}: {
  id: string;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`pb-14 mb-14 ${last ? "" : "border-b border-border"}`}>
      {children}
    </section>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-[26px] font-semibold leading-[1.2] tracking-[-0.02em]">
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-8 mb-3 text-[18px] font-semibold tracking-[-0.015em]">
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-[15.5px] leading-[1.7] text-text-2">{children}</p>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-sm border border-border bg-bg-alt px-[6px] py-[1px] font-mono text-[0.9em] text-text">
      {children}
    </code>
  );
}

function DocsLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-accent underline underline-offset-2 hover:text-accent-hover"
    >
      {children}
    </Link>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-r-lg border-l-[3px] border-accent bg-accent-soft px-[18px] py-[14px] text-[14.5px] leading-[1.6] text-text">
      {children}
    </div>
  );
}

function CodeBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 overflow-hidden rounded-lg border border-code-border bg-code-bg">
      <div className="flex items-center justify-between border-b border-code-border bg-[#13161d] px-[14px] py-[10px] font-mono text-[11px] tracking-[0.04em] text-[#9aa3b5]">
        <span>{label}</span>
      </div>
      <pre className="m-0 overflow-x-auto px-[18px] py-4 font-mono text-[13px] leading-[1.7] text-[#e4e6eb]">
        <code>{children}</code>
      </pre>
    </div>
  );
}

function Table({
  head,
  rows,
}: {
  head: React.ReactNode[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="mb-6 overflow-x-auto">
      <table className="w-full border-collapse overflow-hidden rounded-lg border border-border text-[14px]">
        <thead>
          <tr>
            {head.map((h, i) => (
              <TH key={i}>{h}</TH>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="even:bg-[#fbfbf9]">
              {r.map((c, j) => (
                <td
                  key={j}
                  className="border-b border-border px-[14px] py-[10px] align-top leading-[1.55] text-text-2 last:[&_*]:text-text-2"
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TH({ children }: { children: React.ReactNode }) {
  return (
    <th className="border-b border-border bg-bg-alt px-[14px] py-[10px] text-left text-[13px] font-semibold text-text">
      {children}
    </th>
  );
}

const CAT_STYLES: Record<string, string> = {
  structural: "bg-[#eef2ff] text-[#4f46e5]",
  domain: "bg-[#ecfdf5] text-[#047857]",
  infra: "bg-[#fef3c7] text-[#92400e]",
  smtp: "bg-[#fef2f2] text-[#b91c1c]",
  behav: "bg-[#fce7f3] text-[#9d174d]",
  trust: "bg-[#f0fdfa] text-[#0f766e]",
  blocklist: "bg-[#fee2e2] text-[#991b1b]",
};

function SignalRow({
  name,
  cat,
  dir,
  weight,
  desc,
}: {
  name: string;
  cat: keyof typeof CAT_STYLES;
  dir: "risk" | "trust";
  weight: string;
  desc: React.ReactNode;
}) {
  return (
    <tr className="even:bg-[#fbfbf9]">
      <td className="border-b border-border px-[14px] py-[10px] align-top">
        <code className="font-mono text-[12.5px] text-text">{name}</code>
      </td>
      <td className="border-b border-border px-[14px] py-[10px] align-top">
        <span
          className={`inline-block rounded-full px-[8px] py-[2px] font-mono text-[10.5px] tracking-[0.02em] ${CAT_STYLES[cat]}`}
        >
          {cat}
        </span>
      </td>
      <td
        className={`border-b border-border px-[14px] py-[10px] align-top font-mono text-[12px] font-medium ${
          dir === "risk" ? "text-risk" : "text-ok"
        }`}
      >
        {dir}
      </td>
      <td className="border-b border-border px-[14px] py-[10px] align-top font-mono text-[13px] tabular-nums text-text">
        {weight}
      </td>
      <td className="border-b border-border px-[14px] py-[10px] align-top text-[13.5px] leading-[1.55] text-text-2">
        {desc}
      </td>
    </tr>
  );
}
