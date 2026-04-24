import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — VerifyMail",
  description: "What VerifyMail collects, why, and what we don't.",
};

const LAST_UPDATED = "April 24, 2026";

export default function PrivacyPage() {
  return (
    <section className="py-20">
      <div className="container-page">
        <article className="mx-auto max-w-[760px]">
          <div className="mb-3 font-mono text-[12px] tracking-[0.05em] text-text-3">
            LEGAL
          </div>
          <h1 className="mb-3 text-[40px] font-semibold leading-[1.1] tracking-[-0.025em]">
            Privacy Policy
          </h1>
          <p className="mb-12 text-[14px] text-text-3">Last updated: {LAST_UPDATED}</p>

          <P>
            This policy explains what VerifyMail collects, why, and what we
            don&apos;t. We try to be specific about what happens to the email
            addresses you submit, because that&apos;s the question every
            customer asks us first.
          </P>

          <H2>TL;DR</H2>
          <List>
            <li>Email addresses submitted to <Code>/v1/check</Code> are processed in memory and <strong>not persisted</strong>.</li>
            <li>We store the <em>domain</em> portion of checked emails for aggregate analytics and auto-blocklist promotion.</li>
            <li>We never sell your data. We never use your data to train third-party models.</li>
            <li>Payment info is handled by Stripe — we only store an opaque customer ID.</li>
          </List>

          <H2>1. What we collect</H2>

          <H3>Account data</H3>
          <P>
            When you sign up we collect your email address, a hashed session
            token, and a Stripe customer ID. We keep this as long as the
            account exists.
          </P>

          <H3>API check traffic</H3>
          <P>
            When you call <Code>/v1/check</Code> we receive the raw email
            address in the request body. The address is used in memory to
            compute a verdict and is discarded on response. We persist:
          </P>
          <List>
            <li>The <strong>domain</strong> portion (for aggregate statistics and the auto-blocklist pipeline)</li>
            <li>The risk score, recommendation, and latency of the check</li>
            <li>A reference to which API key made the call</li>
          </List>
          <P>
            We do <strong>not</strong> persist the full email address, the
            local-part of the address, or any per-request payload beyond the
            domain and metadata above.
          </P>

          <H3>Payment data</H3>
          <P>
            Payment details (card number, billing address) are handled by{" "}
            <A href="https://stripe.com/privacy">Stripe</A> and never touch our
            servers. We store an opaque Stripe customer ID to look up your
            subscription, purchase history, and receipts.
          </P>

          <H3>Operational logs</H3>
          <P>
            Our infrastructure providers (Railway, Vercel, Cloudflare) retain
            short-lived request logs — IP addresses, user agents, timing — for
            up to 30 days for debugging and abuse prevention. These logs do
            <strong> not</strong> contain email payloads, since request bodies
            are excluded from application logs.
          </P>

          <H2>2. How we use it</H2>
          <List>
            <li><strong>Provide the Service.</strong> Authenticate your account, issue API keys, run checks, bill you.</li>
            <li><strong>Improve detection.</strong> Domain-level aggregates feed our auto-blocklist and catch-all model.</li>
            <li><strong>Prevent abuse.</strong> Identify and block bad actors attempting to resell or misuse the Service.</li>
            <li><strong>Communicate.</strong> Send magic-link sign-in emails and transactional notices (never marketing without your consent).</li>
          </List>

          <H2>3. Third parties we use</H2>
          <P>
            We share the minimum data needed to operate with a small set of
            sub-processors:
          </P>
          <List>
            <li><strong>Stripe</strong> — payment processing; receives your billing email + card info you enter.</li>
            <li><strong>Resend</strong> — magic-link email delivery; receives your email address + sign-in URL.</li>
            <li><strong>Unkey</strong> — API key management; stores the API key secrets themselves.</li>
            <li><strong>Railway</strong> — hosting for the API.</li>
            <li><strong>Vercel</strong> — hosting for the dashboard and marketing site.</li>
            <li><strong>Cloudflare</strong> — DNS + CDN for <Code>verifymailapi.com</Code>.</li>
          </List>
          <P>
            None of these sub-processors receive the <em>email addresses you
            submit to</em> <Code>/v1/check</Code> — those never leave our
            request handler.
          </P>

          <H2>4. Your rights</H2>
          <P>
            Depending on your jurisdiction (GDPR, CCPA, UK GDPR, etc.) you
            have rights to access, correct, export, or delete your personal
            data. To exercise any of these, email{" "}
            <A href="mailto:privacy@verifymailapi.com">privacy@verifymailapi.com</A>{" "}
            from the email on file. We&apos;ll respond within 30 days.
          </P>
          <P>
            Account deletion removes your profile, API keys, and personal
            identifiers. Domain-level aggregates that cannot be linked back to
            you are retained to preserve the accuracy of the detection model.
          </P>

          <H2>5. Data retention</H2>
          <List>
            <li><strong>Account data:</strong> until you delete the account.</li>
            <li><strong>Check log (domain + metadata):</strong> up to 24 months, then aggregated and anonymized.</li>
            <li><strong>Magic-link tokens:</strong> expire after 15 minutes; single-use.</li>
            <li><strong>Sessions:</strong> 30-day TTL, rotated on sign-in.</li>
          </List>

          <H2>6. Security</H2>
          <P>
            All traffic is served over TLS 1.2+. Secrets are stored in the
            hosting provider&apos;s secret manager, never in source control.
            API key secrets are held by Unkey and never by us — we only store
            the prefix for display. Session tokens are hashed at rest.
          </P>

          <H2>7. International transfers</H2>
          <P>
            Our primary infrastructure is hosted in the United States. Data
            you submit is processed in the US. By using the Service you
            consent to this transfer.
          </P>

          <H2>8. Children</H2>
          <P>
            VerifyMail is a B2B API and is not intended for users under 16.
            We do not knowingly collect data from children.
          </P>

          <H2>9. Changes to this policy</H2>
          <P>
            We may update this policy periodically. Material changes will be
            emailed to the account owner at least 14 days before taking
            effect. The &ldquo;Last updated&rdquo; date at the top of this
            page always reflects the current version.
          </P>

          <H2>10. Contact</H2>
          <P>
            Questions or requests:{" "}
            <A href="mailto:privacy@verifymailapi.com">privacy@verifymailapi.com</A>.
          </P>
        </article>
      </div>
    </section>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 mb-3 text-[22px] font-semibold tracking-[-0.015em]">
      {children}
    </h2>
  );
}
function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-6 mb-2 text-[16px] font-semibold tracking-[-0.01em]">
      {children}
    </h3>
  );
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-[15.5px] leading-[1.7] text-text-2">{children}</p>;
}
function List({ children }: { children: React.ReactNode }) {
  return (
    <ul className="mb-4 list-disc pl-6 text-[15.5px] leading-[1.7] text-text-2 [&>li]:mb-[6px]">
      {children}
    </ul>
  );
}
function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-sm border border-border bg-bg-alt px-[6px] py-[1px] font-mono text-[0.9em] text-text">
      {children}
    </code>
  );
}
function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-accent underline underline-offset-2 hover:text-accent-hover"
    >
      {children}
    </a>
  );
}
