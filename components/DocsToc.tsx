"use client";

import { useEffect, useState } from "react";

const items = [
  { id: "quickstart", label: "Quickstart" },
  { id: "auth", label: "Authentication" },
  { id: "check", label: "The /check endpoint" },
  { id: "response", label: "Response schema" },
  { id: "recommendation", label: "Recommendation" },
  { id: "signals", label: "Signals" },
  { id: "latency", label: "Latency" },
  { id: "errors", label: "Errors" },
  { id: "sdks", label: "SDKs" },
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
    <aside className="sticky top-[88px] text-[13px]" aria-label="On this page">
      <div className="mb-[14px] font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-text-3">
        On this page
      </div>
      <ul className="flex flex-col gap-[2px] border-l border-border list-none p-0 m-0">
        {items.map((i) => {
          const isActive = active === i.id;
          return (
            <li key={i.id}>
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
