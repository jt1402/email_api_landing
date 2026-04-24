import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — VerifyMail",
  description: "The terms that govern your use of VerifyMail.",
};

const LAST_UPDATED = "April 24, 2026";

export default function TermsPage() {
  return (
    <section className="py-20">
      <div className="container-page">
        <article className="mx-auto max-w-[760px]">
          <div className="mb-3 font-mono text-[12px] tracking-[0.05em] text-text-3">
            LEGAL
          </div>
          <h1 className="mb-3 text-[40px] font-semibold leading-[1.1] tracking-[-0.025em]">
            Terms of Service
          </h1>
          <p className="mb-12 text-[14px] text-text-3">Last updated: {LAST_UPDATED}</p>

          <P>
            These Terms govern your access to and use of VerifyMail (the
            &ldquo;Service&rdquo;), operated from <strong>verifymailapi.com</strong>.
            By creating an account or calling the API you agree to these Terms.
            If you don&apos;t agree, don&apos;t use the Service.
          </P>

          <H2>1. The Service</H2>
          <P>
            VerifyMail is a programmatic email-risk-scoring API. We return a
            confidence-weighted verdict for any email you submit. We do not
            send email on your behalf, we do not store raw email addresses in
            persistent storage, and we do not sell customer data to third parties.
          </P>

          <H2>2. Your account</H2>
          <P>
            You must provide a valid email address and be legally able to enter
            into this agreement. You are responsible for keeping your API keys
            secret and for all activity under your account. Rotate or revoke a
            key from the dashboard if you suspect it is compromised.
          </P>

          <H2>3. Acceptable use</H2>
          <P>You agree not to:</P>
          <List>
            <li>Resell, sublicense, or expose the raw API responses to unauthenticated third parties.</li>
            <li>Use the Service to harass, enumerate, or validate email lists you did not obtain lawfully.</li>
            <li>Circumvent rate limits, key caps, or credit balances by creating multiple accounts.</li>
            <li>Reverse-engineer, scrape, or replicate the Service.</li>
            <li>Use the Service for any unlawful, deceptive, or harmful activity.</li>
          </List>
          <P>
            We may suspend or terminate your account without notice if we
            reasonably believe you have violated this section.
          </P>

          <H2>4. Credits, billing, and refunds</H2>
          <P>
            Credits are one-time prepaid purchases processed by Stripe. Credits
            never expire. Per-check consumption is detailed in the{" "}
            <A href="/pricing">pricing page</A> and <A href="/docs">docs</A>.
          </P>
          <List>
            <li><strong>Free credits:</strong> new accounts receive 100 free checks on signup. The free grant is one-time per customer.</li>
            <li><strong>Refunds:</strong> we issue refunds on unused credits within 30 days of purchase on request. After 30 days, credits remain usable indefinitely.</li>
            <li><strong>Chargebacks:</strong> accounts with open chargebacks may be suspended until the dispute is resolved.</li>
          </List>

          <H2>5. Rate limits and fair use</H2>
          <P>
            Default is 100 requests per second per API key with 500-burst token-bucket
            smoothing. We reserve the right to throttle traffic that threatens
            the Service or violates acceptable use. High-volume customers can
            request a raised ceiling.
          </P>

          <H2>6. Data handling</H2>
          <P>
            The email address you submit is processed in memory to compute a
            risk verdict and never persisted to our databases. We do store the{" "}
            <em>domain</em> portion for aggregate analytics and auto-blocklist
            promotion. See our <A href="/privacy">Privacy Policy</A> for full
            detail.
          </P>

          <H2>7. Service availability</H2>
          <P>
            We target 99.9% monthly uptime. We do not offer service credits on
            standard accounts. Enterprise customers can negotiate an SLA with
            credits as part of a separate agreement.
          </P>

          <H2>8. Warranty and liability</H2>
          <P>
            The Service is provided &ldquo;as is&rdquo; without warranty of any
            kind. To the maximum extent permitted by law, our aggregate
            liability for any claim arising out of or related to the Service is
            limited to the amount you paid us in the 12 months preceding the
            claim. We are not liable for indirect, consequential, or punitive
            damages.
          </P>
          <P>
            Our verdicts are probabilistic. Do not use them as the sole factor
            in high-stakes decisions such as denying critical services to real
            people. Always combine the score with your own business context.
          </P>

          <H2>9. Changes to these Terms</H2>
          <P>
            We may update these Terms from time to time. Material changes will
            be emailed to the account owner at least 14 days before taking
            effect. Continued use after the effective date constitutes
            acceptance.
          </P>

          <H2>10. Termination</H2>
          <P>
            You may close your account at any time from the dashboard. Unused
            credits purchased within the last 30 days are eligible for refund;
            older credits are forfeit on account closure. We may terminate your
            account for breach of these Terms with or without notice.
          </P>

          <H2>11. Governing law</H2>
          <P>
            These Terms are governed by the laws of your local jurisdiction
            unless superseded by a separate signed enterprise agreement.
            Disputes will be resolved in the courts of that jurisdiction.
          </P>

          <H2>12. Contact</H2>
          <P>
            Questions about these Terms? Email{" "}
            <A href="mailto:support@verifymailapi.com">support@verifymailapi.com</A>.
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
