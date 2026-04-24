import Link from "next/link";
import { Logo } from "./Logo";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-transparent bg-bg/85 backdrop-blur-md transition-[border-color,background] duration-200">
      <div className="mx-auto flex max-w-[1140px] items-center gap-8 px-6 py-[14px] max-[720px]:gap-4 max-[720px]:px-5 max-[720px]:py-3">
        <Logo />
        <nav
          className="ml-auto flex items-center gap-7 max-[720px]:gap-[18px]"
          aria-label="Primary"
        >
          <Link
            href="/docs"
            className="text-sm font-medium text-text-2 transition-colors hover:text-text"
          >
            Docs
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-text-2 transition-colors hover:text-text"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-text-2 transition-colors hover:text-text max-[720px]:hidden"
          >
            Log in
          </Link>
        </nav>
        <div className="flex items-center gap-[10px]">
          <Link href="/signup" className="btn btn-primary">
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}
