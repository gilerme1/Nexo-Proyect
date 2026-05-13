export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Large header */}
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 rounded-2xl bg-[var(--bg-card)]" />
        <div className="flex-1 space-y-2">
          <div className="h-7 w-56 rounded-xl bg-[var(--bg-card)]" />
          <div className="h-4 w-40 rounded-lg bg-[var(--bg-card)]" />
          <div className="h-5 w-24 rounded-full bg-[var(--bg-card)]" />
        </div>
        <div className="h-9 w-28 rounded-xl bg-[var(--bg-card)]" />
      </div>

      {/* Detail section 1 */}
      <div className="rounded-2xl bg-[var(--bg-card)] p-6 space-y-4">
        <div className="h-5 w-36 rounded-lg bg-[var(--bg-hover)]" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-20 rounded bg-[var(--bg-hover)]" />
              <div className="h-4 w-32 rounded bg-[var(--bg-hover)]" />
            </div>
          ))}
        </div>
      </div>

      {/* Detail section 2 */}
      <div className="rounded-2xl bg-[var(--bg-card)] p-6 space-y-4">
        <div className="h-5 w-44 rounded-lg bg-[var(--bg-hover)]" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-4 w-full rounded bg-[var(--bg-hover)]" />
          ))}
        </div>
      </div>

      {/* Detail section 3 */}
      <div className="rounded-2xl bg-[var(--bg-card)] p-6 space-y-4">
        <div className="h-5 w-40 rounded-lg bg-[var(--bg-hover)]" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-[var(--bg-hover)]" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-40 rounded bg-[var(--bg-hover)]" />
                <div className="h-3 w-24 rounded bg-[var(--bg-hover)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
