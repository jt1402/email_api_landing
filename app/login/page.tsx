"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type ActionResult } from "@/app/actions";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    loginAction,
    null
  );

  return (
    <div className="grid min-h-dvh place-items-center bg-bg px-6 py-12 [background:radial-gradient(60%_50%_at_50%_0%,rgba(46,111,158,0.08),transparent_60%),var(--color-bg)]">
      <div className="w-full max-w-[420px] rounded-md border border-border bg-surface p-10 px-9 shadow-md">
        <div className="mb-7">
          <Logo />
        </div>
        {state?.ok ? (
          <>
            <AuthHeading>Check your inbox</AuthHeading>
            <AuthSub>
              We emailed you a sign-in link. It expires in 15 minutes. In dev
              mode the link is printed to the backend logs instead.
            </AuthSub>
            <Link href="/signup" className="btn btn-ghost btn-block">
              Use a different email
            </Link>
          </>
        ) : (
          <>
            <AuthHeading>Sign in</AuthHeading>
            <AuthSub>
              Enter your email and we&apos;ll send you a magic link. No password
              needed.
            </AuthSub>
            {state && !state.ok && <AlertError>{state.error}</AlertError>}
            <form action={formAction}>
              <Field label="Email" htmlFor="email">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  autoFocus
                  placeholder="you@company.com"
                  className="h-10 rounded-sm border border-border-strong bg-surface px-3 text-[15px] text-text transition-[border-color,box-shadow] duration-150 focus:border-accent focus:outline-none focus:ring-[3px] focus:ring-accent/15"
                />
              </Field>
              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={pending}
              >
                {pending ? "Sending…" : "Send magic link →"}
              </button>
            </form>
            <div className="mt-[18px] text-center text-[13px] text-text-2">
              New here?{" "}
              <Link href="/signup" className="text-accent">
                Create an account
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AuthHeading({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="mb-2 text-[26px] leading-[1.2] tracking-[-0.02em]">
      {children}
    </h1>
  );
}
function AuthSub({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-7 text-[15px] leading-[1.55] text-text-2">{children}</p>
  );
}
function AlertError({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-[14px] rounded-xs border border-[#fecaca] bg-[#fef2f2] px-3 py-[10px] text-[13px] leading-[1.5] text-[#b91c1c]">
      {children}
    </div>
  );
}
function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-[18px] flex flex-col gap-[6px]">
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-text-2">
        {label}
      </label>
      {children}
    </div>
  );
}
