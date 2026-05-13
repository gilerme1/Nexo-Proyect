export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* PageHeader */}
      <div className="space-y-2">
        <div className="h-7 w-48 rounded-xl bg-[var(--bg-card)]" />
        <div className="h-4 w-72 rounded-lg bg-[var(--bg-card)]" />
      </div>

      {/* Banner */}
      <div className="h-20 w-full rounded-2xl bg-[var(--bg-card)]" />

      {/* Section label */}
      <div className="h-5 w-40 rounded-lg bg-[var(--bg-card)]" />

      {/* List of 4 items */}
      <div className="rounded-2xl bg-[var(--bg-card)] p-2 space-y-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-3.5">
            <div className="h-10 w-10 rounded-full bg-[var(--bg-hover)]" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-52 rounded bg-[var(--bg-hover)]" />
              <div className="h-3 w-36 rounded bg-[var(--bg-hover)]" />
            </div>
            <div className="h-5 w-16 rounded-full bg-[var(--bg-hover)]" />
          </div>
        ))}
      </div>

      {/* Section label 2 */}
      <div className="h-5 w-44 rounded-lg bg-[var(--bg-card)]" />

      {/* List of 4 items */}
      <div className="rounded-2xl bg-[var(--bg-card)] p-2 space-y-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-3.5">
            <div className="h-10 w-10 rounded-full bg-[var(--bg-hover)]" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-44 rounded bg-[var(--bg-hover)]" />
              <div className="h-3 w-28 rounded bg-[var(--bg-hover)]" />
            </div>
            <div className="h-5 w-20 rounded-full bg-[var(--bg-hover)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
