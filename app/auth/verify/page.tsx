"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { verifyTokenAction } from "@/app/actions";
import { Logo } from "@/components/Logo";

type State =
  | { kind: "verifying" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyInner />
    </Suspense>
  );
}

function VerifyInner() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<State>({ kind: "verifying" });

  useEffect(() => {
    if (!token) {
      setState({ kind: "error", message: "Missing token." });
      return;
    }
    (async () => {
      const result = await verifyTokenAction(token);
      if (result.ok) {
        if (result.defaultApiKey) {
          // Stash the auto-provisioned secret so the dashboard can render the
          // show-once banner. Cleared by the dashboard component after copy.
          try {
            sessionStorage.setItem("vm_default_api_key", result.defaultApiKey);
          } catch {
            /* sessionStorage unavailable — user just won't see the banner */
          }
        }
        setState({ kind: "success" });
        router.replace("/dashboard");
      } else {
        setState({ kind: "error", message: result.error });
      }
    })();
  }, [token, router]);

  return (
    <div className="grid min-h-dvh place-items-center bg-bg px-6 py-12 [background:radial-gradient(60%_50%_at_50%_0%,rgba(46,111,158,0.08),transparent_60%),var(--color-bg)]">
      <div className="w-full max-w-[420px] rounded-md border border-border bg-surface p-10 px-9 shadow-md">
        <div className="mb-7">
          <Logo />
        </div>
        {state.kind === "verifying" && (
          <>
            <h1 className="mb-2 text-[26px] leading-[1.2] tracking-[-0.02em]">
              Signing you in…
            </h1>
            <p className="mb-7 text-[15px] leading-[1.55] text-text-2">
              Hold on, exchanging your magic link for a session.
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
              Link couldn&apos;t be used
            </h1>
            <div className="mb-[14px] rounded-xs border border-[#fecaca] bg-[#fef2f2] px-3 py-[10px] text-[13px] leading-[1.5] text-[#b91c1c]">
              {state.message}
            </div>
            <p className="mb-7 text-[15px] leading-[1.55] text-text-2">
              Magic links expire after 15 minutes and can only be used once.
              Request a new one below.
            </p>
            <Link href="/login" className="btn btn-primary btn-block">
              Send a new link
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
