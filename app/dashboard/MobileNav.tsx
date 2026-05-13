"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { logoutAction } from "@/app/actions";

const NAV_ITEMS: ReadonlyArray<{ href: string; label: string }> = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/playground", label: "Playground" },
  { href: "/dashboard/keys", label: "API keys" },
  { href: "/dashboard/usage", label: "Usage" },
  { href: "/dashboard/domains", label: "Domains" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/settings", label: "Settings" },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileNav({ userEmail }: { userEmail: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  return (
    <div className="border-b border-border bg-surface min-[821px]:hidden max-[820px]:sticky max-[820px]:top-0 max-[820px]:z-40">
      <div className="flex items-center justify-between px-5 py-3">
        <Logo />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Close navigation" : "Open navigation"}
          className="flex h-9 w-9 items-center justify-center rounded-sm border border-border-strong text-text-2"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {open ? (
              <>
                <path d="M6 6l12 12" />
                <path d="M6 18L18 6" />
              </>
            ) : (
              <>
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </>
            )}
          </svg>
        </button>
      </div>
      {open && (
        <div className="border-t border-border bg-surface px-5 py-4">
          <nav className="flex flex-col gap-[2px]" aria-label="Dashboard">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-sm px-3 py-2 text-[14px] ${
                    active
                      ? "bg-bg-alt font-medium text-text"
                      : "text-text-2 hover:bg-bg-alt hover:text-text"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 border-t border-border pt-4 text-[13px] text-text-2">
            <div className="mb-[10px] break-all font-medium text-text">
              {userEmail}
            </div>
            <form action={logoutAction}>
              <button type="submit" className="btn btn-ghost btn-block">
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
