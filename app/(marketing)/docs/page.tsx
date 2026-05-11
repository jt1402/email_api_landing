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
              <P>
                Get an API key from the{" "}
                <DocsLink href="/dashboard/keys">dashboard</DocsLink> and make your first check in
                under 60 seconds. Official SDKs are on the way; the API is plain HTTP + JSON in
                the meantime.
              </P>

              <H3>1. Make a check</H3>
              <CodeBlock label="curl">
{`curl -X POST https://api.verifymailapi.com/v1/check \\
  -H "X-API-Key: $VERIFYMAIL_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "test@mailinator.com"}'`}
              </CodeBlock>

              <H3>2. Branch on the recommendation</H3>
              <CodeBlock label="signup.js">
{`const res = await fetch("https://api.verifymailapi.com/v1/check", {
  method: "POST",
  headers: { "X-API-Key": process.env.VERIFYMAIL_KEY, "Content-Type": "application/json" },
  body: JSON.stringify({ email }),
});
const result = await res.json();

switch (result.verdict.recommendation) {
  case "block":
    return reject("This email cannot be used.");
  case "allow_with_flag":
    // Suspicious — route through your verification step.
    user.requires_email_verification = true;
    await sendVerificationEmail(user);
    break;
  case "allow":
    // Clean — proceed normally.
    break;
}`}
              </CodeBlock>

              <Callout>
                <strong>The canonical handler.</strong> Map{" "}
                <Code>allow_with_flag</Code> to <Code>requires_verification: true</Code> on your
                user record, then force the user through your existing email-verification or
                friction step. Most apps already have one — the flag costs you zero new code.
              </Callout>
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
                Default ceiling is <strong>600 requests / minute</strong> per API key. Every
                response includes three headers so your client can back off before hitting the
                wall:
              </P>
              <CodeBlock label="response headers">
{`X-RateLimit-Limit: 600
X-RateLimit-Remaining: 412
X-RateLimit-Reset: 1746920460`}
              </CodeBlock>
              <P>
                Over-limit requests return <Code>429 Too Many Requests</Code> with{" "}
                <Code>Retry-After: &lt;seconds&gt;</Code> and{" "}
                <Code>error.code = &quot;too_many_requests&quot;</Code>. A simple back-off:
              </P>
              <CodeBlock label="retry on 429">
{`if (res.status === 429) {
  const wait = Number(res.headers.get("Retry-After") ?? 1) * 1000;
  await new Promise(r => setTimeout(r, wait));
  return retry(req);
}`}
              </CodeBlock>
              <P>
                Need a higher ceiling? Contact support — per-key limits are configurable.
              </P>
            </Section>

            <Section id="idempotency">
              <H2>Idempotency</H2>
              <P>
                Every credit-debiting POST endpoint accepts an <Code>Idempotency-Key</Code> header.
                Replay the same key within 24 hours and you get the cached response back, with no
                duplicate charge. Reusing the same key with a different request body returns{" "}
                <Code>409 invalid_idempotency_key</Code>.
              </P>
              <CodeBlock label="idempotent check">
{`POST /v1/check
Idempotency-Key: 2c4f9e1a-7b88-4a3d-9c0f-1e3a5b7c8d9e
X-API-Key: $VERIFYMAIL_KEY
Content-Type: application/json

{"email": "user@example.com"}`}
              </CodeBlock>
              <P>
                Use any opaque string (UUID v4 is conventional). Applies to{" "}
                <Code>/v1/check</Code>, <Code>/v1/check/domain</Code>,{" "}
                <Code>/v1/check/bulk</Code>, and <Code>/v1/check/async</Code>. The streaming
                bulk variant deliberately does not support idempotency.
              </P>
              <Callout>
                <strong>When to use it:</strong> any time a network retry could double-charge —
                browser-side fetches that timeout, queue workers with at-least-once delivery,
                CI/CD scripts that may be re-run.
              </Callout>
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

            <Section id="check-domain">
              <H2>POST /v1/check/domain</H2>
              <P>
                Use when you already have a domain (not an email) and don&apos;t need us to
                syntax-validate an address. Same engine, same 1-credit cost.{" "}
                <Code>meta.email</Code> is blanked in the response.
              </P>
              <CodeBlock label="request">
{`POST /v1/check/domain
X-API-Key: $VERIFYMAIL_KEY
Content-Type: application/json

{"domain": "example.com"}`}
              </CodeBlock>
            </Section>

            <Section id="check-bulk">
              <H2>POST /v1/check/bulk</H2>
              <P>
                Submit up to <strong>100 emails per request</strong>. Charges N credits up front
                (all-or-nothing — if your balance is below N, the request 402s without a partial
                debit). Internally bounded to 10 concurrent checks, so a 100-row batch finishes in
                roughly 10× a single check rather than 100×.
              </P>
              <CodeBlock label="request">
{`POST /v1/check/bulk
X-API-Key: $VERIFYMAIL_KEY
Content-Type: application/json

{"emails": ["a@example.com", "b@example.com", "c@example.com"]}`}
              </CodeBlock>
              <CodeBlock label="200 OK · response">
{`{
  "items": [ /* CheckResponse, CheckResponse, ... */ ],
  "summary": {
    "total": 3,
    "credits_charged": 3,
    "credits_remaining": 8742,
    "elapsed_ms": 327
  }
}`}
              </CodeBlock>
              <P>
                Order is preserved — <Code>items[i]</Code> matches <Code>emails[i]</Code>.
                Invalid-syntax emails produce a <Code>CheckResponse</Code> with{" "}
                <Code>recommendation: &quot;block&quot;</Code>; individual rows never error.
              </P>
            </Section>

            <Section id="check-bulk-stream">
              <H2>POST /v1/check/bulk/stream</H2>
              <P>
                Same input as <Code>/v1/check/bulk</Code>, but emits one JSON line per row as it
                finishes. Use for large batches (5k–100k addresses) when you want to start
                processing results before the full job completes.
              </P>
              <CodeBlock label="response · application/x-ndjson">
{`{"index": 4, "result": { /* CheckResponse */ }}
{"index": 0, "result": { /* CheckResponse */ }}
{"index": 1, "result": { /* CheckResponse */ }}
{"index": 2, "result": { /* CheckResponse */ }}
{"index": 3, "result": { /* CheckResponse */ }}
{"event": "summary", "total": 5, "credits_charged": 5, "credits_remaining": 8737, "elapsed_ms": 612}`}
              </CodeBlock>
              <P>
                Results stream in finish-order, not input-order — correlate via the{" "}
                <Code>index</Code> field. The final line is always a{" "}
                <Code>{`{event: "summary"}`}</Code> object.
              </P>
              <CodeBlock label="consume in Node">
{`const res = await fetch(url, { method: "POST", headers, body });
const reader = res.body!.getReader();
const decoder = new TextDecoder();
let buf = "";
while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  buf += decoder.decode(value, { stream: true });
  const lines = buf.split("\\n");
  buf = lines.pop()!;
  for (const line of lines) {
    if (!line) continue;
    const evt = JSON.parse(line);
    if (evt.event === "summary") console.log("done", evt);
    else processRow(evt.index, evt.result);
  }
}`}
              </CodeBlock>
            </Section>

            <Section id="check-async">
              <H2>POST /v1/check/async</H2>
              <P>
                Two-phase verification. Returns a 202 immediately with a preliminary verdict from
                the fast path, then runs the deep SMTP / catch-all probe in the background and
                POSTs the final result to your webhook.
              </P>
              <CodeBlock label="request">
{`POST /v1/check/async
X-API-Key: $VERIFYMAIL_KEY
Content-Type: application/json

{
  "email": "user@example.com",
  "webhook_url": "https://your-app.example/webhooks/verifymail",
  "webhook_secret": "whk_..."   // optional — signs the payload with HMAC-SHA256
}`}
              </CodeBlock>
              <CodeBlock label="202 Accepted">
{`{
  "request_id": "req_8d4b3e2f1a6c",
  "status": "pending",
  "preliminary": { /* CheckResponse from fast/standard layers */ },
  "webhook_url": "https://your-app.example/webhooks/verifymail",
  "estimated_completion_ms": 6000
}`}
              </CodeBlock>
              <P>
                When the deep path completes, we POST the final{" "}
                <Code>CheckResponse</Code> to your <Code>webhook_url</Code> with HMAC signature
                headers — see <DocsLink href="#webhooks">Webhook signatures</DocsLink>. The webhook
                URL must be HTTPS and resolve to a public IP; private addresses are rejected.
              </P>
            </Section>

            <Section id="lists">
              <H2>GET / POST / DELETE /v1/lists/{`{kind}`}</H2>
              <P>
                Per-account custom allow / block lists. Domains on the allow list always return{" "}
                <Code>allow</Code>; domains on the block list always return <Code>block</Code>.
                Both bypass the engine and the credit charge — verdicts come straight from Redis
                in &lt;2ms.
              </P>
              <CodeBlock label="manage your lists">
{`# List entries
GET    /v1/lists/allow
GET    /v1/lists/block

# Add an entry
POST   /v1/lists/allow   {"domain": "ourcustomerdomain.com"}
POST   /v1/lists/block   {"domain": "abusivedomain.shop"}

# Remove an entry
DELETE /v1/lists/allow/ourcustomerdomain.com`}
              </CodeBlock>
              <P>
                These endpoints are session-authed and live behind the dashboard. Allow takes
                precedence over block when a domain ends up on both.
              </P>
            </Section>

            <Section id="report">
              <H2>POST /v1/report</H2>
              <P>
                Tell us when a domain you saw turned out to be confirmed throwaway, confirmed
                legitimate, or suspected. Reports feed the network-effect model — your reports
                tune your future verdicts and (de-identified) help other customers.
              </P>
              <CodeBlock label="request">
{`POST /v1/report
X-API-Key: $VERIFYMAIL_KEY
Content-Type: application/json

{
  "domain": "weirddomain.shop",
  "outcome": "confirmed_throwaway",
  "notes": "User signed up, used trial, never paid, never returned."
}`}
              </CodeBlock>
            </Section>

            <Section id="usage-me">
              <H2>GET /v1/usage/me</H2>
              <P>
                Programmatic equivalent of the dashboard&apos;s Usage summary. Returns
                current-period totals plus the credit balance so your monitoring stack can read
                them without scraping the UI.
              </P>
              <CodeBlock label="200 OK">
{`{
  "total_checks": 41203,
  "checks_this_period": 9128,
  "period_start": "2026-05-01T00:00:00+00:00",
  "blocks": 612,
  "allow_with_flag": 240,
  "allows": 8276,
  "avg_latency_ms": 42.1,
  "cache_hit_rate": 0.71,
  "credit_balance_checks": 8742
}`}
              </CodeBlock>
            </Section>

            <Section id="status">
              <H2>GET /v1/status</H2>
              <P>
                Component-level health. Always returns <Code>200</Code> — read the per-component
                fields under <Code>components</Code> to diagnose. Distinct from <Code>/health</Code>,
                which is a binary liveness probe used by load balancers.
              </P>
              <CodeBlock label="200 OK">
{`{
  "status": "ok",            // or "degraded"
  "components": {
    "redis": "ok",
    "postgres": "ok",
    "dns": "ok"
  },
  "latency_ms": 18
}`}
              </CodeBlock>
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
              <H2>The 3 recommendation values</H2>
              <P>
                The <Code>verdict.recommendation</Code> field is always one of exactly three
                strings — switch on it directly without parsing thresholds.
              </P>
              <Table
                head={["Value", "Meaning", "Suggested action"]}
                rows={[
                  [<span key="v" className="font-mono text-risk">block</span>, "High confidence this is abuse or a dead address.", "Refuse signup. Show a generic error."],
                  [<span key="v" className="font-mono text-warn">allow_with_flag</span>, "Suspicious — could still be legitimate, but route through your friction layer.", "Force email verification or extra onboarding step before granting full access."],
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
                    <SignalRow name="random_local_part_pattern" cat="structural" dir="risk" weight="25" desc={<>Local part looks machine-generated — high entropy, low vowels, no separators (e.g. <Code>q9zk3v7x2m@</Code>).</>} />
                    <SignalRow name="unusual_local_chars" cat="structural" dir="risk" weight="18" desc={<>Local contains RFC-valid but vanishingly rare chars (<Code>!#$%&apos;*/=?^`{`{|}`}~</Code>).</>} />
                    <SignalRow name="impossible_address_on_legit_provider" cat="structural" dir="risk" weight="100" desc="Compound: unusual chars on a known major provider whose signup form rejects them. Forces allow_with_flag regardless of trust signals." />
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

            <Section id="webhooks">
              <H2>Webhook signatures</H2>
              <P>
                When you call <Code>/v1/check/async</Code> with a{" "}
                <Code>webhook_secret</Code>, the final <Code>check.completed</Code> event is
                signed with HMAC-SHA256 of the raw request body. Verify the signature in your
                handler before trusting the payload — anyone can POST to a public URL.
              </P>
              <H3>Headers we send</H3>
              <CodeBlock label="request headers (from us → you)">
{`Content-Type: application/json
User-Agent: VerifyMail-Webhook/1.0
X-VerifyMail-Request-Id: req_abc123
X-VerifyMail-Event: check.completed
X-VerifyMail-Signature: sha256=8c2a5b3e...`}
              </CodeBlock>

              <H3>Verifying in Node.js</H3>
              <CodeBlock label="verify-webhook.ts">
{`import crypto from "node:crypto";

function verify(rawBody: Buffer, signatureHeader: string, secret: string) {
  const expected = "sha256=" + crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  // timingSafeEqual avoids leaking secret length via timing.
  const a = Buffer.from(signatureHeader);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Express handler — use express.raw, NOT express.json, so rawBody is preserved.
app.post("/webhooks/verifymail", express.raw({ type: "application/json" }), (req, res) => {
  const sig = req.header("X-VerifyMail-Signature") ?? "";
  if (!verify(req.body, sig, process.env.VERIFYMAIL_WEBHOOK_SECRET!)) {
    return res.status(401).send("bad signature");
  }
  const event = JSON.parse(req.body.toString("utf8"));
  // event.result is the full CheckResponse.
  await handleCheckCompleted(event);
  res.status(200).end();
});`}
              </CodeBlock>

              <H3>Verifying in Python</H3>
              <CodeBlock label="verify_webhook.py">
{`import hmac, hashlib

def verify(raw_body: bytes, signature_header: str, secret: str) -> bool:
    expected = "sha256=" + hmac.new(
        secret.encode("utf-8"), raw_body, hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature_header)

# In FastAPI: use Request.body() — JSON parsing happens after verification.
@app.post("/webhooks/verifymail")
async def webhook(request: Request):
    raw = await request.body()
    sig = request.headers.get("X-VerifyMail-Signature", "")
    if not verify(raw, sig, os.environ["VERIFYMAIL_WEBHOOK_SECRET"]):
        raise HTTPException(status_code=401, detail="bad signature")
    event = json.loads(raw)
    await handle_check_completed(event)
    return {"ok": True}`}
              </CodeBlock>

              <H3>Retry policy</H3>
              <P>
                We retry non-2xx responses up to 3 times with exponential backoff (1s, 5s, 25s).
                4xx errors (except 408/429) are not retried — fix them on your side and we&apos;ll
                stop hammering you.
              </P>
            </Section>

            <Section id="errors">
              <H2>Error codes</H2>
              <P>All errors return a consistent envelope:</P>
              <CodeBlock label="error response">
{`{
  "error": {
    "code": "too_many_requests",
    "http_status": 429,
    "message": "Rate limit exceeded — over 600 req/min on this key. Retry after the window resets.",
    "request_id": "req_8d4b3e2f1a6c",
    "docs_url": "https://verifymailapi.com/docs/rate-limits",
    "limit": 600,
    "reset_at": "2026-05-11T14:30:00Z"
  }
}`}
              </CodeBlock>
              <Table
                head={["HTTP", "Code", "Meaning"]}
                rows={[
                  ["401", <Code key="c">invalid_api_key</Code>, "API key missing or unknown."],
                  ["401", <Code key="c">invalid_session</Code>, "Session expired or invalid (dashboard only)."],
                  ["402", <Code key="c">quota_exceeded</Code>, "No credits remaining. Buy a bundle to keep going."],
                  ["409", <Code key="c">invalid_idempotency_key</Code>, "Idempotency-Key reused with a different request body."],
                  ["422", <Code key="c">invalid_request</Code>, "Missing or malformed parameter (email, domain, etc.)."],
                  ["422", <Code key="c">validation_error</Code>, "Pydantic-level validation failed — see message."],
                  ["422", <Code key="c">invalid_webhook_url</Code>, "Webhook URL is not HTTPS or resolves to a private IP."],
                  ["429", <Code key="c">too_many_requests</Code>, <>Per-key rate limit. See <Code>Retry-After</Code> + <Code>X-RateLimit-*</Code> headers.</>],
                  ["429", <Code key="c">rate_limit_exceeded</Code>, "Monthly check ceiling (legacy — use too_many_requests for burst limits)."],
                  ["500", <Code key="c">internal_error</Code>, "Transient server error. Safe to retry with backoff."],
                  ["503", <Code key="c">service_degraded</Code>, "A component (Redis / Postgres / DNS) is degraded. Retry shortly."],
                  ["504", <Code key="c">dns_timeout</Code>, "DNS resolution timed out mid-check. Safe to retry."],
                ]}
              />
            </Section>

            <Section id="privacy">
              <H2>Privacy & data handling</H2>
              <P>
                VerifyMail is deliberately conservative about PII. The short version:{" "}
                <strong>we never store full email addresses</strong>, only the domain portion.
              </P>
              <Table
                head={["Data", "Stored?", "Where", "Retention"]}
                rows={[
                  ["Domain", "Yes", "Postgres (checks + domain_stats)", "Until you delete your account"],
                  ["Full email", "No", "In-memory only during the request", "Discarded on response"],
                  ["Verdict + signals fired", "Yes", "Postgres + Redis cache", "30-day Redis TTL; Postgres rows persist"],
                  ["IP address of the caller", "No", "—", "—"],
                  ["Webhook URL + secret", "Per-request", "Discarded after delivery", "Not stored at rest"],
                ]}
              />
              <P>
                When a verdict is returned, the full email is in the response{" "}
                <Code>meta.email</Code> field for your records, but our cache strips it before
                writing. Your account is the only one that ever sees it. We also do not log
                full emails to access logs — use <Code>POST /v1/check</Code> in production rather
                than the <Code>GET</Code> variant to keep emails out of query strings.
              </P>
              <Callout>
                <strong>GDPR posture.</strong> We act as a processor of the domain portion of
                signups your users provide you. Because emails are not stored, the data-subject
                deletion surface is limited to the domain history — request it from support and
                we&apos;ll purge.
              </Callout>
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
