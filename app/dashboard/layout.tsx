import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { auth, billing, BackendCallError } from "@/lib/backend";
import { getSession } from "@/lib/session";
import { logoutAction } from "@/app/actions";
import { WelcomeKeyBanner } from "./WelcomeKeyBanner";

const LOW_BALANCE_THRESHOLD = 50;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getSession();
  if (!token) redirect("/login");

  let user;
  let balance: { credit_balance_checks: number } | null = null;
  try {
    [user, balance] = await Promise.all([
      auth.me(token),
      billing.balance(token).catch(() => null),
    ]);
  } catch (err) {
    if (err instanceof BackendCallError && err.status === 401) {
      redirect("/login");
    }
    throw err;
  }

  const credits = balance?.credit_balance_checks ?? null;
  const isOut = credits !== null && credits <= 0;
  const isLow = credits !== null && credits > 0 && credits < LOW_BALANCE_THRESHOLD;

  return (
    <div className="grid min-h-dvh grid-cols-[240px_1fr] bg-bg-alt max-[820px]:grid-cols-1">
      <aside className="sticky top-0 flex h-dvh flex-col border-r border-border bg-surface px-5 py-6 max-[820px]:static max-[820px]:h-auto max-[820px]:border-b max-[820px]:border-r-0">
        <div className="mb-7">
          <Logo />
        </div>
        <nav className="flex flex-1 flex-col gap-[2px]">
          <DashNavLink href="/dashboard">Overview</DashNavLink>
          <DashNavLink href="/dashboard/playground">Playground</DashNavLink>
          <DashNavLink href="/dashboard/keys">API keys</DashNavLink>
          <DashNavLink href="/dashboard/usage">Usage</DashNavLink>
          <DashNavLink href="/dashboard/billing">Billing</DashNavLink>
        </nav>
        <div className="mt-4 border-t border-border pt-4 text-[13px] text-text-2">
          <div className="mb-[10px] break-all font-medium text-text">
            {user.email}
          </div>
          <form action={logoutAction}>
            <button type="submit" className="btn btn-ghost btn-block">
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="max-w-[1100px] p-10 px-12 max-[820px]:p-8 max-[820px]:px-6">
        <WelcomeKeyBanner />
        {(isOut || isLow) && credits !== null && (
          <BalanceBanner credits={credits} critical={isOut} />
        )}
        {children}
      </main>
    </div>
  );
}

function BalanceBanner({
  credits,
  critical,
}: {
  credits: number;
  critical: boolean;
}) {
  const styles = critical
    ? "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]"
    : "border-[#fed7aa] bg-[#fff7ed] text-[#9a3412]";
  return (
    <div
      className={`mb-6 flex items-center justify-between gap-4 rounded-sm border px-4 py-3 text-[14px] leading-[1.5] ${styles} max-[700px]:flex-col max-[700px]:items-start`}
    >
      <div>
        {critical ? (
          <>
            <strong>Out of credits.</strong> API calls return{" "}
            <span className="font-mono">402 quota_exceeded</span> until you top
            up.
          </>
        ) : (
          <>
            <strong>Running low.</strong> {credits.toLocaleString()} credit
            {credits === 1 ? "" : "s"} left — top up to keep verifying without
            interruption.
          </>
        )}
      </div>
      <Link href="/dashboard/billing" className="btn btn-primary h-9 shrink-0">
        Buy credits
      </Link>
    </div>
  );
}

function DashNavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-[10px] rounded-sm px-3 py-2 text-[14px] text-text-2 transition-[background,color] duration-150 hover:bg-bg-alt hover:text-text"
    >
      {children}
    </Link>
  );
}
