import Link from "next/link";
import { SDKTabs } from "@/components/SDKTabs";
import { DocsToc } from "@/components/DocsToc";

export default function DocsPage() {
  return (
    <>
      <section className="pt-4">
        <div className="container-page">
          <div className="grid grid-cols-[220px_1fr] items-start gap-14 max-[900px]:grid-cols-1 max-[900px]:gap-8">
            <DocsToc />

            <article className="min-w-0 max-w-[760px]">
              <DocsSection id="quickstart">
                <DocsH2>Quickstart</DocsH2>
                <DocsP>Three steps to your first verdict.</DocsP>

                <ol className="m-0 mb-6 flex list-decimal flex-col gap-[10px] pl-5 text-[15px] leading-[1.65] text-text">
                  <li>
                    <strong>Sign up.</strong>{" "}
                    Get <DocsLink href="/signup">100 checks free</DocsLink> on signup.
                    Then $0.003/check or save with credit bundles. No card required.
                  </li>
                  <li>
                    <strong>Call our API.</strong>{" "}
                    Send a single HTTP request with the email. Get back a confidence-scored
                    risk verdict in under 100ms.
                  </li>
                  <li>
                    <strong>Block fake signups.</strong>{" "}
                    Switch on the <span className="font-mono">recommendation</span> value —
                    block / verify / flag / allow — and stop trial abuse before it starts.
                  </li>
                </ol>

                <DocsCode>
{`curl -X POST https://api.verifymail.dev/v1/check \\
  -H "X-API-Key: vm_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"email":"user@mailinator.com"}'`}
                </DocsCode>
              </DocsSection>

              <DocsSection id="auth">
                <DocsH2>Authentication</DocsH2>
                <DocsP>
                  Every request requires an API key in the <span className="font-mono">X-API-Key</span> header.
                  Keys start with <span className="font-mono">vm_live_</span>, are scoped to one account, and can
                  be rotated or revoked anytime from the{" "}
                  <DocsLink href="/dashboard/keys">dashboard</DocsLink>.
                </DocsP>
                <div className="my-4 rounded-xs border-l-[3px] border-accent bg-accent-soft px-[18px] py-[14px] text-[14px] leading-[1.6] text-text">
                  <strong>Never</strong> embed <span className="font-mono">vm_live_</span> keys in client-side code.
                  For browser calls, proxy through your own backend.
                </div>
              </DocsSection>

              <DocsSection id="check">
                <DocsH2>The /check endpoint</DocsH2>
                <DocsP>One endpoint, one verb.</DocsP>

                <div className="mb-6 inline-flex items-center gap-3 rounded-sm border border-code-border bg-code-bg px-4 py-3 font-mono text-[13px] text-[#e6e9ef]">
                  <span className="rounded bg-accent px-[9px] py-[3px] text-[11px] font-semibold tracking-[0.06em] text-white">
                    POST
                  </span>
                  <span className="font-mono">https://api.verifymail.dev/v1/check</span>
                </div>

                <DocsH3>Request body</DocsH3>
                <DocsTable
                  head={["Field", "Type", "Description"]}
                  rows={[
                    [<span key="k" className="font-mono">email</span>, <span key="t" className="font-mono">string</span>, "The email address to score. Required."],
                    [<span key="k" className="font-mono">deep</span>, <span key="t" className="font-mono">boolean</span>, <>Force deep checks (SMTP probe, catch-all). Default <span className="font-mono">false</span>.</>],
                    [<span key="k" className="font-mono">context</span>, <span key="t" className="font-mono">object</span>, <>Optional signals for behavioral scoring: <span className="font-mono">ip</span>, <span className="font-mono">user_agent</span>.</>],
                  ]}
                />
              </DocsSection>

              <DocsSection id="response">
                <DocsH2>Response schema</DocsH2>
                <DocsP>
                  Every response includes <span className="font-mono">meta</span>, <span className="font-mono">verdict</span>,{" "}
                  <span className="font-mono">score</span>, and <span className="font-mono">signals</span>.
                  The score is a 0–100 risk value paired with a confidence between 0 and 1.
                </DocsP>

                <DocsCode>
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
                </DocsCode>
              </DocsSection>

              <DocsSection id="recommendation">
                <DocsH2>Recommendation</DocsH2>
                <DocsP>
                  <span className="font-mono">verdict.recommendation</span> is always one of four values — so you
                  can switch on it in code without parsing thresholds.
                </DocsP>

                <DocsTable
                  head={["Value", "What it means"]}
                  rows={[
                    [<span key="k" className="font-mono">block</span>, "High-confidence risk. Reject the signup."],
                    [<span key="k" className="font-mono">verify_manually</span>, "Ambiguous. Send a verification email before granting access."],
                    [<span key="k" className="font-mono">allow_with_flag</span>, "Suspicious but not blocking. Let them in, log for review."],
                    [<span key="k" className="font-mono">allow</span>, "Safe to proceed."],
                  ]}
                />
              </DocsSection>

              <DocsSection id="signals">
                <DocsH2>Signals</DocsH2>
                <DocsP>
                  Every response includes a <span className="font-mono">signals</span> array listing which signals
                  fired, their direction (risk or trust), their weight, and why. Debug false positives in
                  10 seconds instead of opening a support ticket.
                </DocsP>

                <DocsCode>
{`"fired": [
  { "name": "catch_all_confirmed",
    "direction": "risk", "weight": 55 },
  { "name": "domain_age_14_days",
    "direction": "risk", "weight": 42 },
  { "name": "mx_shared_with_9_domains",
    "direction": "risk", "weight": 35 }
]`}
                </DocsCode>

                <p className="mt-6 mb-5 text-[15.5px] leading-[1.65] text-text-2">
                  40+ signals across 6 categories. A preview of what the API actually checks:
                </p>

                <DocsTable
                  head={["Category", "Signal", "Weight"]}
                  rows={[
                    [<strong key="c">Blocklist</strong>, <span key="s" className="font-mono">known_disposable_domain</span>, "+100"],
                    ["", <span key="s" className="font-mono">mx_on_abuse_list</span>, "+80"],
                    ["", <span key="s" className="font-mono">asn_known_bad</span>, "+60"],
                    [<strong key="c">Infrastructure</strong>, <span key="s" className="font-mono">catch_all_confirmed</span>, "+55"],
                    ["", <span key="s" className="font-mono">domain_age_under_30d</span>, "+42"],
                    ["", <span key="s" className="font-mono">mx_shared_with_n_domains</span>, "+35"],
                    ["", <span key="s" className="font-mono">spf_missing</span>, "+18"],
                    [<strong key="c">Pattern</strong>, <span key="s" className="font-mono">random_localpart</span>, "+38"],
                    ["", <span key="s" className="font-mono">plus_addressing_suspicious</span>, "+22"],
                    ["", <span key="s" className="font-mono">role_based_address</span>, "+15"],
                    ["", <span key="s" className="font-mono">gmail_dot_trick</span>, "+12"],
                    [<strong key="c">Behavioral</strong>, <span key="s" className="font-mono">signup_velocity_high</span>, "+45"],
                    ["", <span key="s" className="font-mono">seen_across_n_tenants</span>, "+30"],
                    ["", <span key="s" className="font-mono">first_seen_within_hours</span>, "+20"],
                    [<strong key="c">Trust</strong>, <span key="s" className="font-mono">corporate_domain</span>, "−40"],
                    ["", <span key="s" className="font-mono">domain_age_over_5y</span>, "−25"],
                    ["", <span key="s" className="font-mono">reputable_mx_provider</span>, "−20"],
                  ]}
                />

                <DocsH3>Catch-all detection</DocsH3>
                <p className="mb-5 text-[15.5px] leading-[1.65] text-text-2">
                  A Bayesian confidence model catches rotating catch-alls that defeat naive SMTP probes —
                  combining infrastructure signals, behavioral history, and cross-customer network data into
                  a single probability.
                </p>
              </DocsSection>

              <DocsSection id="latency">
                <DocsH2>Latency</DocsH2>
                <DocsP>
                  85% of traffic resolves from in-memory caches in under 5ms. Weighted p99 across all checks
                  is under 28ms. Async-with-preliminary path for deep checks so your signup flow never waits.
                </DocsP>

                <DocsTable
                  head={["Path", "Share of traffic", "Latency"]}
                  rows={[
                    ["Cache hit", "85%", <>&lt; 5ms</>],
                    ["Fast path", "12%", <>&lt; 150ms</>],
                    ["Deep check", "3%", <>&lt; 800ms</>],
                  ]}
                />
                <p className="mb-5 text-[15.5px] leading-[1.65] text-text-2">
                  The path taken is returned in <span className="font-mono">meta.path_taken</span>, so you can
                  observe your own traffic mix.
                </p>
              </DocsSection>

              <DocsSection id="errors">
                <DocsH2>Errors</DocsH2>
                <DocsP>
                  Every error response is a JSON object with <span className="font-mono">code</span>,{" "}
                  <span className="font-mono">message</span>, and where applicable,{" "}
                  <span className="font-mono">docs_url</span>, <span className="font-mono">reset_at</span>, or{" "}
                  <span className="font-mono">upgrade_url</span>.
                </DocsP>

                <DocsTable
                  head={["Status", "Code", "Meaning"]}
                  rows={[
                    ["400", <span key="c" className="font-mono">invalid_email</span>, "Email failed syntax validation."],
                    ["401", <span key="c" className="font-mono">missing_api_key</span>, <><span className="font-mono">X-API-Key</span> header not set.</>],
                    ["403", <span key="c" className="font-mono">invalid_api_key</span>, "Key is revoked or unknown."],
                    ["429", <span key="c" className="font-mono">rate_limited</span>, <>Over your plan&apos;s rate limit. Retry after <span className="font-mono">reset_at</span>.</>],
                    ["402", <span key="c" className="font-mono">quota_exceeded</span>, <>Out of credits. See <span className="font-mono">upgrade_url</span>.</>],
                    ["503", <span key="c" className="font-mono">upstream_timeout</span>, <>Deep check timed out. Retry with <span className="font-mono">deep: false</span>.</>],
                  ]}
                />
              </DocsSection>

              <DocsSection id="sdks" last>
                <DocsH2>SDKs</DocsH2>
                <DocsP>Use VerifyMail with your favorite language or framework.</DocsP>
                <SDKTabs />
              </DocsSection>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}

function DocsSection({
  id,
  last,
  children,
}: {
  id: string;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={`pb-14 mb-14 ${last ? "" : "border-b border-border"}`}
    >
      {children}
    </section>
  );
}
function DocsH2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-[28px] tracking-[-0.02em]">{children}</h2>
  );
}
function DocsH3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-7 mb-3 text-[16px] font-semibold tracking-[-0.01em]">
      {children}
    </h3>
  );
}
function DocsP({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-5 text-[15.5px] leading-[1.65] text-text-2">{children}</p>
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
function DocsCode({ children }: { children: React.ReactNode }) {
  return (
    <pre className="m-0 mb-4 overflow-x-auto rounded-sm border border-code-border bg-code-bg px-5 py-[18px] font-mono text-[13px] leading-[1.7] text-[#e6e9ef]">
      {children}
    </pre>
  );
}
function DocsTable({
  head,
  rows,
}: {
  head: React.ReactNode[];
  rows: React.ReactNode[][];
}) {
  return (
    <table className="mb-4 w-full border-collapse text-[14px]">
      <thead>
        <tr>
          {head.map((h, i) => (
            <th
              key={i}
              className="border-b border-border bg-bg-alt px-[14px] py-3 text-left align-top text-[12px] font-medium uppercase tracking-[0.06em] text-text-2"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((c, j) => (
              <td
                key={j}
                className="border-b border-border px-[14px] py-3 align-top leading-[1.55] text-text"
              >
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
