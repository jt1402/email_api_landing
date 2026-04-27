"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { oauthExchangeAction } from "@/app/actions";
import { Logo } from "@/components/Logo";

type State =
  | { kind: "exchanging" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export default function OauthExchangePage() {
  return (
    <Suspense fallback={null}>
      <ExchangeInner />
    </Suspense>
  );
}

function ExchangeInner() {
  const params = useSearchParams();
  const router = useRouter();
  const code = params.get("code") ?? "";
  const [state, setState] = useState<State>({ kind: "exchanging" });

  useEffect(() => {
    if (!code) {
      setState({ kind: "error", message: "Missing code." });
      return;
    }
    (async () => {
      const result = await oauthExchangeAction(code);
      if (result.ok) {
        if (result.defaultApiKey) {
          try {
            sessionStorage.setItem("vm_default_api_key", result.defaultApiKey);
          } catch {
            /* sessionStorage unavailable — banner just won't show */
          }
        }
        setState({ kind: "success" });
        router.replace("/dashboard");
      } else {
        setState({ kind: "error", message: result.error });
      }
    })();
  }, [code, router]);

  return (
    <div className="grid min-h-dvh place-items-center bg-bg px-6 py-12 [background:radial-gradient(60%_50%_at_50%_0%,rgba(46,111,158,0.08),transparent_60%),var(--color-bg)]">
      <div className="w-full max-w-[420px] rounded-md border border-border bg-surface p-10 px-9 shadow-md">
        <div className="mb-7">
          <Logo />
        </div>
        {state.kind === "exchanging" && (
          <>
            <h1 className="mb-2 text-[26px] leading-[1.2] tracking-[-0.02em]">
              Signing you in…
            </h1>
            <p className="mb-7 text-[15px] leading-[1.55] text-text-2">
              Finalizing your session.
            </p>
          </>
        )}
        {state.kind === "success" && (
          <>
            <h1 className="mb-2 text-[26px] leading-[1.2] tracking-[-0.02em]">
              Signed in
            </h1>
            <p className="mb-7 text-[15px] leading-[1.55] text-text-2">
              Redirecting to your dashboard…
            </p>
          </>
        )}
        {state.kind === "error" && (
          <>
            <h1 className="mb-2 text-[26px] leading-[1.2] tracking-[-0.02em]">
              Sign-in failed
            </h1>
            <div className="mb-[14px] rounded-xs border border-[#fecaca] bg-[#fef2f2] px-3 py-[10px] text-[13px] leading-[1.5] text-[#b91c1c]">
              {state.message}
            </div>
            <p className="mb-7 text-[15px] leading-[1.55] text-text-2">
              The exchange code is single-use and expires in 5 minutes. Try
              again from the login page.
            </p>
            <Link href="/login" className="btn btn-primary btn-block">
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
