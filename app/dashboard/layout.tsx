import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { auth, BackendCallError } from "@/lib/backend";
import { getSession } from "@/lib/session";
import { logoutAction } from "@/app/actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getSession();
  if (!token) redirect("/login");

  let user;
  try {
    user = await auth.me(token);
  } catch (err) {
    if (err instanceof BackendCallError && err.status === 401) {
      redirect("/login");
    }
    throw err;
  }

  return (
    <div className="grid min-h-dvh grid-cols-[240px_1fr] bg-bg-alt max-[820px]:grid-cols-1">
      <aside className="sticky top-0 flex h-dvh flex-col border-r border-border bg-surface px-5 py-6 max-[820px]:static max-[820px]:h-auto max-[820px]:border-b max-[820px]:border-r-0">
        <div className="mb-7">
          <Logo />
        </div>
        <nav className="flex flex-1 flex-col gap-[2px]">
          <DashNavLink href="/dashboard">Overview</DashNavLink>
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
        {children}
      </main>
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
