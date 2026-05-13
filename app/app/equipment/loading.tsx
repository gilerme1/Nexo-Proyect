export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* PageHeader */}
      <div className="space-y-2">
        <div className="h-7 w-32 rounded-xl bg-[var(--bg-card)]" />
        <div className="h-4 w-80 rounded-lg bg-[var(--bg-card)]" />
      </div>

      {/* Search + filter bar */}
      <div className="flex gap-3">
        <div className="h-9 w-56 rounded-full bg-[var(--bg-card)]" />
        <div className="h-9 flex-1 rounded-full bg-[var(--bg-card)]" />
        <div className="h-9 w-24 rounded-xl bg-[var(--bg-card)]" />
      </div>

      {/* Table rows */}
      <div className="rounded-2xl bg-[var(--bg-card)] p-2 space-y-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-3.5">
            <div className="h-10 w-10 rounded-full bg-[var(--bg-hover)]" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-48 rounded bg-[var(--bg-hover)]" />
              <div className="h-3 w-32 rounded bg-[var(--bg-hover)]" />
            </div>
            <div className="h-5 w-20 rounded-full bg-[var(--bg-hover)]" />
            <div className="h-3 w-16 rounded bg-[var(--bg-hover)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
