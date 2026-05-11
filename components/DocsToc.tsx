"use client";

import { useEffect, useState } from "react";

type TocItem = {
  id: string;
  label: string;
  group?: string;
  // Endpoint items split label into a method pill + a monospace path so the
  // sidebar reads like a real API reference. Plain items leave both empty.
  method?: "GET" | "POST" | "DELETE" | "PUT";
  path?: string;
};

const items: TocItem[] = [
  { id: "introduction", label: "Introduction", group: "Getting started" },
  { id: "quickstart", label: "Quickstart" },
  { id: "authentication", label: "Authentication" },
  { id: "rate-limits", label: "Rate limits" },
  { id: "idempotency", label: "Idempotency" },

  { id: "check", label: "", method: "POST", path: "/v1/check", group: "API reference" },
  { id: "check-domain", label: "", method: "POST", path: "/v1/check/domain" },
  { id: "check-bulk", label: "", method: "POST", path: "/v1/check/bulk" },
  { id: "check-bulk-stream", label: "", method: "POST", path: "/v1/check/bulk/stream" },
  { id: "check-async", label: "", method: "POST", path: "/v1/check/async" },
  { id: "lists", label: "", method: "POST", path: "/v1/lists" },
  { id: "report", label: "", method: "POST", path: "/v1/report" },
  { id: "usage-me", label: "", method: "GET", path: "/v1/usage/me" },
  { id: "status", label: "", method: "GET", path: "/v1/status" },

  { id: "schema", label: "5-block structure", group: "Response schema" },
  { id: "recommendations", label: "Recommendation values" },

  { id: "risk-profiles", label: "Risk profiles", group: "Core concepts" },
  { id: "catch-all", label: "Catch-all detection" },
  { id: "signals-ref", label: "Signals reference" },

  { id: "webhooks", label: "Webhook signatures", group: "Advanced" },
  { id: "errors", label: "Error codes" },
  { id: "privacy", label: "Privacy & data" },
  { id: "versioning", label: "Versioning" },
];

const METHOD_STYLES: Record<NonNullable<TocItem["method"]>, string> = {
  GET: "bg-[#ecfdf5] text-[#047857]",
  POST: "bg-[#eef2ff] text-[#4f46e5]",
  DELETE: "bg-[#fef2f2] text-[#b91c1c]",
  PUT: "bg-[#fffbeb] text-[#92400e]",
};

// Sticky-nav height. Heading lands this far below viewport top after click.
const NAV_OFFSET = 84;

export function DocsToc() {
  const [active, setActive] = useState(items[0].id);
  // Suppress scroll-driven detection briefly after a click so the active state
  // sticks on the clicked item even while the smooth-scroll animation is still
  // running through prior sections.
  const [suppressUntil, setSuppressUntil] = useState(0);

  useEffect(() => {
    let frame = 0;

    const compute = () => {
      frame = 0;
      if (Date.now() < suppressUntil) return;
      // Active = the last section whose top has scrolled past the trigger
      // line. Use ~1/3 of the viewport rather than a fixed 120px so the
      // highlight matches what the reader is actually looking at, not an
      // arbitrary pixel near the top edge.
      const trigger = Math.max(140, window.innerHeight / 3);
      let current = items[0].id;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top - trigger <= 0) current = item.id;
      }
      setActive((prev) => (prev === current ? prev : current));
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [suppressUntil]);

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    // Bypass the browser's native anchor scroll — its behavior with
    // smooth-scroll + scroll-margin-top is inconsistent across engines.
    // Scrolling explicitly with the sticky-nav offset baked in lands the
    // heading at a predictable position every time.
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
    window.scrollTo({ top, behavior: "smooth" });
    history.replaceState(null, "", `#${id}`);
    setActive(id);
    setSuppressUntil(Date.now() + 800);
  };

  return (
    <nav
      className="sticky top-[88px] max-h-[calc(100vh-100px)] overflow-y-auto pr-2"
      aria-label="Documentation sections"
    >
      {items.map((item, idx) => {
        const isActive = active === item.id;
        const showGroupHeader = !!item.group;

        return (
          <div key={item.id}>
            {showGroupHeader && (
              <div
                className={`flex items-center gap-2 px-3 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-3 ${
                  idx > 0 ? "mt-3 border-t border-border pt-5" : ""
                }`}
              >
                {item.group}
              </div>
            )}

            <a
              href={`#${item.id}`}
              onClick={(e) => handleClick(e, item.id)}
              aria-current={isActive ? "location" : undefined}
              className={`group flex items-center gap-2 rounded-[6px] px-3 py-[7px] transition-colors duration-100 ${
                isActive
                  ? "bg-accent-soft"
                  : "hover:bg-bg-alt"
              }`}
            >
              {item.method && (
                // Fixed-width pill so every endpoint's path column lines up
                // regardless of method length (GET vs GET/POST etc).
                <span
                  className={`w-[60px] shrink-0 rounded-[4px] px-[6px] py-[1px] text-center font-mono text-[10px] font-semibold leading-[1.4] tracking-[0.005em] ${
                    METHOD_STYLES[item.method]
                  }`}
                >
                  {item.method}
                </span>
              )}
              {item.path ? (
                <span
                  className={`min-w-0 truncate font-mono text-[12.5px] leading-[1.4] ${
                    isActive ? "font-medium text-accent" : "text-text"
                  }`}
                >
                  {item.path}
                </span>
              ) : (
                <span
                  className={`text-[13.5px] leading-[1.4] ${
                    isActive ? "font-medium text-accent" : "text-text-2 group-hover:text-text"
                  }`}
                >
                  {item.label}
                </span>
              )}
            </a>
          </div>
        );
      })}
    </nav>
  );
}
