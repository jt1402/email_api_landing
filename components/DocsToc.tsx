"use client";

import { useEffect, useState } from "react";

type TocItem = { id: string; label: string; group?: string };

const items: TocItem[] = [
  { id: "introduction", label: "Introduction", group: "Getting Started" },
  { id: "quickstart", label: "Quickstart" },
  { id: "authentication", label: "Authentication" },
  { id: "rate-limits", label: "Rate limits" },
  { id: "check", label: "POST /v1/check", group: "API Reference" },
  { id: "report", label: "POST /v1/report" },
  { id: "usage", label: "GET /v1/usage" },
  { id: "schema", label: "The 5-block structure", group: "Response Schema" },
  { id: "recommendations", label: "Recommendation values" },
  { id: "risk-profiles", label: "Risk profiles", group: "Core Concepts" },
  { id: "catch-all", label: "Catch-all detection" },
  { id: "signals-ref", label: "Signals reference" },
  { id: "sdks", label: "SDKs", group: "SDKs" },
  { id: "webhooks", label: "Webhooks", group: "Advanced" },
  { id: "errors", label: "Errors" },
  { id: "versioning", label: "Versioning" },
];

export function DocsToc() {
  const [active, setActive] = useState(items[0].id);

  useEffect(() => {
    const trigger = 140;
    let frame = 0;

    const compute = () => {
      frame = 0;
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
  }, []);

  return (
    <aside
      className="sticky top-[88px] max-h-[calc(100vh-100px)] overflow-y-auto pr-2 text-[13px]"
      aria-label="On this page"
    >
      <ul className="m-0 flex list-none flex-col gap-[2px] border-l border-border p-0">
        {items.map((i) => {
          const isActive = active === i.id;
          return (
            <li key={i.id}>
              {i.group && (
                <div className="mt-5 mb-2 pl-[14px] font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-text-3 first:mt-0">
                  {i.group}
                </div>
              )}
              <a
                href={`#${i.id}`}
                aria-current={isActive ? "location" : undefined}
                className={`block -ml-px border-l-2 px-[14px] py-[7px] text-[13px] transition-[color,border-color] duration-150 ${
                  isActive
                    ? "border-accent font-medium text-accent"
                    : "border-transparent text-text-2 hover:border-border-strong hover:text-text"
                }`}
              >
                {i.label}
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
