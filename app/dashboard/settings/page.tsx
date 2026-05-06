import { redirect } from "next/navigation";
import { auth, BackendCallError } from "@/lib/backend";
import { getSession } from "@/lib/session";
import { DeleteAccountCard } from "./DeleteAccountCard";

export default async function SettingsPage() {
  const token = await getSession();
  if (!token) redirect("/login");

  let email = "";
  try {
    const user = await auth.me(token);
    email = user.email;
  } catch (err) {
    if (err instanceof BackendCallError && err.status === 401) {
      redirect("/login");
    }
    throw err;
  }

  return (
    <>
      <h2 className="mb-7 text-[28px] leading-[1.2] tracking-[-0.02em]">Settings</h2>

      <section className="mb-5 rounded-md border border-border bg-surface px-7 py-6">
        <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.1em] text-text-2">
          Account
        </div>
        <div className="text-[16px] break-all">{email}</div>
        <p className="mt-2 text-[13px] text-text-2">
          To change the email associated with your account, contact{" "}
          <a
            href="mailto:support@verifymailapi.com"
            className="text-accent underline underline-offset-2"
          >
            support@verifymailapi.com
          </a>
          .
        </p>
      </section>

      <section className="rounded-md border border-[#fecaca] bg-[#fef2f2] px-7 py-6">
        <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.1em] text-[#b91c1c]">
          Danger zone
        </div>
        <h3 className="mb-1 text-[18px]">Delete account</h3>
        <p className="mb-5 text-[14px] text-text-2">
          Permanently removes your account, API keys, and sessions. Any
          remaining bundle credits are forfeited. Past check-history rows are
          retained anonymously (no email or personal data) for our
          domain-reputation pipeline. This action cannot be undone.
        </p>
        <DeleteAccountCard email={email} />
      </section>
    </>
  );
}
