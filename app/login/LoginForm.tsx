"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type ActionResult } from "@/app/actions";
import { Logo } from "@/components/Logo";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    loginAction,
    null,
  );

  return (
    <div className="grid min-h-dvh place-items-center bg-bg px-6 py-12 [background:radial-gradient(60%_50%_at_50%_0%,rgba(46,111,158,0.08),transparent_60%),var(--color-bg)]">
      <div className="w-full max-w-[420px] rounded-md border border-border bg-surface p-10 px-9 shadow-md">
        <div className="mb-7">
          <Logo />
        </div>
        {state?.ok ? (
          <>
            <h1 className="mb-2 text-[26px] leading-[1.2] tracking-[-0.02em]">
              Check your inbox
            </h1>
            <p className="mb-7 text-[15px] leading-[1.55] text-text-2">
              We emailed you a sign-in link. It expires in 15 minutes. In dev
              mode the link is printed to the backend logs instead.
            </p>
            <Link href="/signup" className="btn btn-ghost btn-block">
              Use a different email
            </Link>
          </>
        ) : (
          <>
            <h1 className="mb-2 text-[26px] leading-[1.2] tracking-[-0.02em]">
              Sign in
            </h1>
            <p className="mb-7 text-[15px] leading-[1.55] text-text-2">
              Enter your email and we&apos;ll send you a magic link. No password
              needed.
            </p>
            {state && !state.ok && (
              <div className="mb-[14px] rounded-xs border border-[#fecaca] bg-[#fef2f2] px-3 py-[10px] text-[13px] leading-[1.5] text-[#b91c1c]">
                {state.error}
              </div>
            )}
            <form action={formAction}>
              <div className="mb-[18px] flex flex-col gap-[6px]">
                <label
                  htmlFor="email"
                  className="text-[13px] font-medium text-text-2"
                >
                  Email
                </label>
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
              </div>
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
