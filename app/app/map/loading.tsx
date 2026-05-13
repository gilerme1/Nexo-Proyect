export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <div className="h-5 w-24 rounded-lg bg-[var(--bg-card)]" />
        <div className="h-5 w-8 rounded-full bg-[var(--bg-card)]" />
      </div>

      {/* Map block */}
      <div className="h-[260px] w-full rounded-2xl bg-[var(--bg-card)]" />

      {/* Client cards */}
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--bg-card)]">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="h-4 w-36 rounded bg-[var(--bg-hover)]" />
              <div className="h-3 w-48 rounded bg-[var(--bg-hover)]" />
            </div>
            <div className="h-3 w-14 rounded bg-[var(--bg-hover)] shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
