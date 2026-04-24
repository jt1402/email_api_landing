"use client";

import { useState } from "react";

type Tab = {
  id: string;
  label: string;
  filename: string;
  lang: string;
  content: React.ReactNode;
};

const TOK = {
  kw: "text-[#c084fc]",
  str: "text-[#86efac]",
  fn: "text-[#60a5fa]",
  punc: "text-[#6b7280]",
  brace: "text-[#cbd5e1]",
  prop: "text-[#a5b4fc]",
  com: "italic text-[#64748b]",
};

const tabs: Tab[] = [
  {
    id: "js",
    label: "JavaScript",
    filename: "verify.js",
    lang: "Node 18+ / ESM",
    content: (
      <>
        <span className={TOK.kw}>import</span>{" "}
        <span className={TOK.brace}>{"{"}</span>{" "}
        <span className={TOK.fn}>VerifyMail</span>{" "}
        <span className={TOK.brace}>{"}"}</span>{" "}
        <span className={TOK.kw}>from</span>{" "}
        <span className={TOK.str}>&apos;verifymail&apos;</span>
        <span className={TOK.punc}>;</span>
        {"\n\n"}
        <span className={TOK.kw}>const</span> client{" "}
        <span className={TOK.punc}>=</span>{" "}
        <span className={TOK.kw}>new</span>{" "}
        <span className={TOK.fn}>VerifyMail</span>
        <span className={TOK.punc}>(</span>
        <span className={TOK.brace}>{"{"}</span>{" "}
        <span className={TOK.prop}>apiKey</span>
        <span className={TOK.punc}>:</span>{" "}
        <span className={TOK.str}>&apos;vm_live_...&apos;</span>{" "}
        <span className={TOK.brace}>{"}"}</span>
        <span className={TOK.punc}>);</span>
        {"\n\n"}
        <span className={TOK.kw}>const</span> result{" "}
        <span className={TOK.punc}>=</span>{" "}
        <span className={TOK.kw}>await</span> client
        <span className={TOK.punc}>.</span>
        <span className={TOK.fn}>check</span>
        <span className={TOK.punc}>(</span>
        <span className={TOK.str}>&apos;user@mailinator.com&apos;</span>
        <span className={TOK.punc}>);</span>
        {"\n\n"}
        <span className={TOK.kw}>switch</span>{" "}
        <span className={TOK.punc}>(</span>result
        <span className={TOK.punc}>.</span>verdict
        <span className={TOK.punc}>.</span>recommendation
        <span className={TOK.punc}>)</span>{" "}
        <span className={TOK.brace}>{"{"}</span>
        {"\n  "}
        <span className={TOK.kw}>case</span>{" "}
        <span className={TOK.str}>&apos;block&apos;</span>
        <span className={TOK.punc}>:</span>
        {"\n    "}
        <span className={TOK.kw}>throw new</span>{" "}
        <span className={TOK.fn}>Error</span>
        <span className={TOK.punc}>(</span>result
        <span className={TOK.punc}>.</span>verdict
        <span className={TOK.punc}>.</span>summary
        <span className={TOK.punc}>);</span>
        {"\n  "}
        <span className={TOK.kw}>case</span>{" "}
        <span className={TOK.str}>&apos;verify_manually&apos;</span>
        <span className={TOK.punc}>:</span>
        {"\n    "}
        <span className={TOK.fn}>queueForReview</span>
        <span className={TOK.punc}>(</span>email
        <span className={TOK.punc}>,</span> result
        <span className={TOK.punc}>);</span>{" "}
        <span className={TOK.kw}>break</span>
        <span className={TOK.punc}>;</span>
        {"\n  "}
        <span className={TOK.kw}>case</span>{" "}
        <span className={TOK.str}>&apos;allow_with_flag&apos;</span>
        <span className={TOK.punc}>:</span>
        {"\n    "}
        <span className={TOK.fn}>logSuspicious</span>
        <span className={TOK.punc}>(</span>email
        <span className={TOK.punc}>,</span> result
        <span className={TOK.punc}>.</span>signals
        <span className={TOK.punc}>.</span>fired
        <span className={TOK.punc}>);</span>{" "}
        <span className={TOK.kw}>break</span>
        <span className={TOK.punc}>;</span>
        {"\n  "}
        <span className={TOK.kw}>case</span>{" "}
        <span className={TOK.str}>&apos;allow&apos;</span>
        <span className={TOK.punc}>:</span>
        {"\n    "}
        <span className={TOK.com}>{"// safe to proceed"}</span>
        {"\n    "}
        <span className={TOK.kw}>break</span>
        <span className={TOK.punc}>;</span>
        {"\n"}
        <span className={TOK.brace}>{"}"}</span>
      </>
    ),
  },
  {
    id: "py",
    label: "Python",
    filename: "verify.py",
    lang: "Python 3.9+",
    content: (
      <>
        <span className={TOK.kw}>from</span> verifymail{" "}
        <span className={TOK.kw}>import</span> VerifyMail
        {"\n\n"}
        client <span className={TOK.punc}>=</span>{" "}
        <span className={TOK.fn}>VerifyMail</span>
        <span className={TOK.punc}>(</span>api_key
        <span className={TOK.punc}>=</span>
        <span className={TOK.str}>&quot;vm_live_...&quot;</span>
        <span className={TOK.punc}>)</span>
        {"\n\n"}
        result <span className={TOK.punc}>=</span> client
        <span className={TOK.punc}>.</span>
        <span className={TOK.fn}>check</span>
        <span className={TOK.punc}>(</span>
        <span className={TOK.str}>&quot;user@mailinator.com&quot;</span>
        <span className={TOK.punc}>)</span>
        {"\n\n"}
        <span className={TOK.kw}>match</span> result
        <span className={TOK.punc}>.</span>verdict
        <span className={TOK.punc}>.</span>recommendation
        <span className={TOK.punc}>:</span>
        {"\n    "}
        <span className={TOK.kw}>case</span>{" "}
        <span className={TOK.str}>&quot;block&quot;</span>
        <span className={TOK.punc}>:</span>
        {"\n        "}
        <span className={TOK.kw}>raise</span>{" "}
        <span className={TOK.fn}>SignupError</span>
        <span className={TOK.punc}>(</span>result
        <span className={TOK.punc}>.</span>verdict
        <span className={TOK.punc}>.</span>summary
        <span className={TOK.punc}>)</span>
        {"\n    "}
        <span className={TOK.kw}>case</span>{" "}
        <span className={TOK.str}>&quot;verify_manually&quot;</span>
        <span className={TOK.punc}>:</span>
        {"\n        "}
        <span className={TOK.fn}>queue_for_review</span>
        <span className={TOK.punc}>(</span>email
        <span className={TOK.punc}>,</span> result
        <span className={TOK.punc}>)</span>
        {"\n    "}
        <span className={TOK.kw}>case</span>{" "}
        <span className={TOK.str}>&quot;allow_with_flag&quot;</span>
        <span className={TOK.punc}>:</span>
        {"\n        "}
        <span className={TOK.fn}>log_suspicious</span>
        <span className={TOK.punc}>(</span>email
        <span className={TOK.punc}>,</span> result
        <span className={TOK.punc}>.</span>signals
        <span className={TOK.punc}>.</span>fired
        <span className={TOK.punc}>)</span>
        {"\n    "}
        <span className={TOK.kw}>case</span>{" "}
        <span className={TOK.str}>&quot;allow&quot;</span>
        <span className={TOK.punc}>:</span>
        {"\n        "}
        <span className={TOK.com}># safe to proceed</span>
        {"\n        "}
        <span className={TOK.kw}>pass</span>
      </>
    ),
  },
  {
    id: "curl",
    label: "cURL",
    filename: "check.sh",
    lang: "HTTP / any language",
    content: (
      <>
        <span className={TOK.fn}>curl</span>{" "}
        <span className={TOK.str}>-X POST https://api.verifymail.dev/v1/check</span>{" "}
        \{"\n  "}
        <span className={TOK.kw}>-H</span>{" "}
        <span className={TOK.str}>&quot;X-API-Key: vm_live_...&quot;</span>{" "}
        \{"\n  "}
        <span className={TOK.kw}>-H</span>{" "}
        <span className={TOK.str}>&quot;Content-Type: application/json&quot;</span>{" "}
        \{"\n  "}
        <span className={TOK.kw}>-d</span>{" "}
        <span className={TOK.str}>
          {"'{\"email\":\"user@mailinator.com\"}'"}
        </span>
        {"\n\n"}
        <span className={TOK.com}># Response includes verdict.recommendation — one of:</span>
        {"\n"}
        <span className={TOK.com}>#   &quot;block&quot; | &quot;verify_manually&quot; | &quot;allow_with_flag&quot; | &quot;allow&quot;</span>
        {"\n"}
        <span className={TOK.com}># Switch on it from any language.</span>
      </>
    ),
  },
];

export function SDKTabs() {
  const [active, setActive] = useState(tabs[0].id);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div className="mx-auto max-w-[960px]">
      <div
        className="mx-auto mb-6 flex w-fit gap-1 rounded-[10px] border border-border bg-surface p-1 max-[640px]:w-full max-[640px]:justify-start max-[640px]:overflow-x-auto"
        role="tablist"
        aria-label="SDK language"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={t.id === active}
            onClick={() => setActive(t.id)}
            className={`whitespace-nowrap rounded-[7px] border-0 px-4 py-2 text-[13px] font-medium transition-all duration-150 ${
              t.id === active
                ? "bg-accent text-white"
                : "bg-transparent text-text-2 hover:text-text"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div
        className="overflow-hidden rounded-md border border-code-border bg-code-bg shadow-lg"
        role="tabpanel"
      >
        <div className="flex items-center justify-between border-b border-code-border bg-[#13161d] px-[18px] py-3 font-mono text-[12px] text-[#9aa3b5]">
          <span>{current.filename}</span>
          <span>{current.lang}</span>
        </div>
        <pre className="m-0 overflow-x-auto whitespace-pre px-[22px] py-5 font-mono text-[13px] leading-[1.7] text-[#e4e6eb]">
          {current.content}
        </pre>
      </div>
    </div>
  );
}
