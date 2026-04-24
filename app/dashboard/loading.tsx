export default function DashboardLoading() {
  return (
    <div aria-live="polite" aria-busy="true">
      <div className="mb-7 h-[34px] w-40 animate-pulse rounded-sm bg-bg-alt" />

      <div className="mb-8 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </div>

      <PanelSkeleton rows={3} />
      <PanelSkeleton rows={2} />
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="rounded-md border border-border bg-surface p-[22px]">
      <div className="mb-2 h-3 w-24 animate-pulse rounded-sm bg-bg-alt" />
      <div className="mb-[6px] h-8 w-20 animate-pulse rounded-sm bg-bg-alt" />
      <div className="h-3 w-32 animate-pulse rounded-sm bg-bg-alt" />
    </div>
  );
}

function PanelSkeleton({ rows }: { rows: number }) {
  return (
    <section className="mb-5 rounded-md border border-border bg-surface px-7 py-6">
      <div className="mb-1 h-[22px] w-40 animate-pulse rounded-sm bg-bg-alt" />
      <div className="mb-5 h-4 w-64 animate-pulse rounded-sm bg-bg-alt" />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`flex items-center justify-between gap-3 py-3 ${
            i === 0 ? "" : "border-t border-border"
          }`}
        >
          <div className="h-4 w-48 animate-pulse rounded-sm bg-bg-alt" />
          <div className="h-4 w-16 animate-pulse rounded-sm bg-bg-alt" />
        </div>
      ))}
    </section>
  );
}
