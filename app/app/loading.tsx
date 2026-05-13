export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* PageHeader */}
      <div className="space-y-2">
        <div className="h-7 w-48 rounded-xl bg-[var(--bg-card)]" />
        <div className="h-4 w-72 rounded-lg bg-[var(--bg-card)]" />
      </div>

      {/* Stat cards — 2×2 grid */}
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-[var(--bg-card)]" />
        ))}
      </div>

      {/* List block 1 */}
      <div className="space-y-2">
        <div className="h-5 w-36 rounded-lg bg-[var(--bg-card)]" />
        <div className="rounded-2xl bg-[var(--bg-card)] p-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[var(--bg-hover)]" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-40 rounded bg-[var(--bg-hover)]" />
                <div className="h-3 w-24 rounded bg-[var(--bg-hover)]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* List block 2 */}
      <div className="space-y-2">
        <div className="h-5 w-44 rounded-lg bg-[var(--bg-card)]" />
        <div className="rounded-2xl bg-[var(--bg-card)] p-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[var(--bg-hover)]" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-48 rounded bg-[var(--bg-hover)]" />
                <div className="h-3 w-32 rounded bg-[var(--bg-hover)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
