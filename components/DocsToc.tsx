"use client";

import { useEffect, useRef, useState } from "react";

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
  // Mobile-only collapsed disclosure. Always expanded on desktop via CSS.
  const [mobileOpen, setMobileOpen] = useState(false);
  // Auto-hide the mobile bar when scrolling down so it stops obstructing reading;
  // restore on any upward scroll or when the user is near the top of the page.
  const [hidden, setHidden] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const lastScrollYRef = useRef(0);
  const activeItem = items.find((i) => i.id === active);
  const activeLabel = activeItem
    ? activeItem.label || `${activeItem.method} ${activeItem.path}`
    : "On this page";

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

  useEffect(() => {
    if (!mobileOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setMobileOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScrollYRef.current;
      // Always visible near the top.
      if (y < 120) {
        setHidden(false);
      } else if (Math.abs(delta) > 6) {
        // 6px deadband avoids flicker from sub-pixel jitter / momentum bounces.
        setHidden(delta > 0);
      }
      lastScrollYRef.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Never hide while the menu is open — user is actively engaged with it.
  const showBar = !hidden || mobileOpen;

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
    setMobileOpen(false);
  };

  return (
    <div className="min-[901px]:contents max-[900px]:h-[46px]">
      <nav
        ref={navRef}
        className={`pr-2 min-[901px]:sticky min-[901px]:top-[88px] min-[901px]:max-h-[calc(100vh-100px)] min-[901px]:overflow-y-auto max-[900px]:fixed max-[900px]:inset-x-6 max-[900px]:top-[64px] max-[900px]:z-30 max-[900px]:rounded-lg max-[900px]:border max-[900px]:border-border max-[900px]:bg-surface max-[900px]:pr-0 max-[900px]:shadow-sm max-[900px]:transition-transform max-[900px]:duration-200 max-[900px]:ease-out ${showBar ? "max-[900px]:translate-y-0" : "max-[900px]:-translate-y-[120px]"}`}
        aria-hidden={!showBar ? true : undefined}
        aria-label="Documentation sections"
      >
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          aria-controls="docs-toc-items"
          className="hidden w-full items-center justify-between gap-3 px-4 py-3 text-left text-[13px] font-medium text-text max-[900px]:flex"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-3">
              On this page
            </span>
            <span className="truncate text-text-2">· {activeLabel}</span>
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`shrink-0 text-text-3 transition-transform ${mobileOpen ? "rotate-180" : ""}`}
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        <div
          id="docs-toc-items"
          className={`max-[900px]:absolute max-[900px]:inset-x-0 max-[900px]:top-full max-[900px]:mt-1 max-[900px]:max-h-[70vh] max-[900px]:overflow-y-auto max-[900px]:rounded-lg max-[900px]:border max-[900px]:border-border max-[900px]:bg-surface max-[900px]:px-2 max-[900px]:py-2 max-[900px]:shadow-lg ${mobileOpen ? "" : "max-[900px]:hidden"}`}
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
        </div>
      </nav>
    </div>
  );
}
