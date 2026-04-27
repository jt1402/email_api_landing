"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "vm_default_api_key";

export function WelcomeKeyBanner() {
  const [secret, setSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const v = sessionStorage.getItem(STORAGE_KEY);
      if (v) setSecret(v);
    } catch {
      /* sessionStorage unavailable — nothing to render */
    }
  }, []);

  if (!secret) return null;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user can still select-and-copy from the input manually */
    }
  };

  const onDismiss = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setSecret(null);
  };

  return (
    <section className="mb-7 rounded-md border border-[#a7f3d0] bg-[#ecfdf5] px-6 py-5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-semibold text-[#047857]">
          Welcome — copy your API key now
        </h3>
        <button
          type="button"
          onClick={onDismiss}
          className="text-[13px] text-[#047857] underline-offset-2 hover:underline"
        >
          I&apos;ve saved it
        </button>
      </div>
      <p className="mb-3 text-[13px] leading-[1.5] text-[#047857]">
        We auto-provisioned a default API key so you can start integrating
        immediately. This is the only time we&apos;ll show the full secret —
        store it in your secret manager (Vercel / AWS / 1Password). If you
        lose it, revoke and create a new one from the API keys page.
      </p>
      <div className="flex gap-2">
        <input
          readOnly
          value={secret}
          onFocus={(e) => e.currentTarget.select()}
          className="h-10 flex-1 rounded-sm border border-[#86efac] bg-surface px-3 font-mono text-[13px] text-text"
        />
        <button
          type="button"
          onClick={onCopy}
          className="btn btn-primary h-10 whitespace-nowrap"
        >
          {copied ? "Copied" : "Copy key"}
        </button>
      </div>
    </section>
  );
}
