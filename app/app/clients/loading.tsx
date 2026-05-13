export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* PageHeader */}
      <div className="space-y-2">
        <div className="h-7 w-36 rounded-xl bg-[var(--bg-card)]" />
        <div className="h-4 w-64 rounded-lg bg-[var(--bg-card)]" />
      </div>

      {/* Search bar */}
      <div className="h-9 w-full max-w-sm rounded-full bg-[var(--bg-card)]" />

      {/* Client cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-[var(--bg-card)] p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[var(--bg-hover)]" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-36 rounded bg-[var(--bg-hover)]" />
                <div className="h-3 w-24 rounded bg-[var(--bg-hover)]" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-5 w-16 rounded-full bg-[var(--bg-hover)]" />
              <div className="h-5 w-20 rounded-full bg-[var(--bg-hover)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
