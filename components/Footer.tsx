import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-[120px] border-t border-border bg-bg py-8 pb-10">
      <div className="mx-auto max-w-[1140px] px-6">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <Logo />
          <div className="flex gap-6 text-sm text-text-2">
            <Link href="/pricing" className="hover:text-text">
              Pricing
            </Link>
            <Link href="/docs" className="hover:text-text">
              Docs
            </Link>
            <Link href="/signup" className="hover:text-text">
              Sign up
            </Link>
          </div>
          <div className="inline-flex items-center gap-2 text-[13px] text-text-2">
            <span
              className="h-2 w-2 rounded-full bg-ok animate-pulse-dot"
              aria-hidden="true"
            />
            All systems online
          </div>
        </div>
        <div className="mt-5 flex flex-wrap justify-between gap-5 border-t border-border pt-5 text-[13px] text-text-3">
          <div>© {new Date().getFullYear()} VerifyMail. All rights reserved.</div>
          <div className="flex gap-5">
            <Link href="/terms" className="hover:text-text-2">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-text-2">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
