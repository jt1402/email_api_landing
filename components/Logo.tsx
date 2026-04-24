import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 font-semibold text-[17px] tracking-[-0.015em]"
      aria-label="VerifyMail home"
    >
      <span
        className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-[7px] bg-accent text-white shadow-[0_2px_6px_rgba(46,111,158,0.28)]"
        aria-hidden="true"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 6l8 8 8-8" />
          <path d="M4 6v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V6" />
          <path
            d="M9 13l2.2 2.2L16 10.5"
            style={{ stroke: "#ffffff", strokeWidth: 2.4, opacity: 0.95 }}
          />
        </svg>
      </span>
      VerifyMail
    </Link>
  );
}
