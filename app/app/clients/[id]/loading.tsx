export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-[var(--bg-card)]" />
        <div className="space-y-2">
          <div className="h-6 w-48 rounded-xl bg-[var(--bg-card)]" />
          <div className="h-4 w-32 rounded-lg bg-[var(--bg-card)]" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--bg-card)] rounded-full p-1 w-fit">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-7 w-24 rounded-full bg-[var(--bg-hover)]" />
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-2xl bg-[var(--bg-card)] p-6 space-y-4">
        <div className="h-5 w-40 rounded-lg bg-[var(--bg-hover)]" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-20 rounded bg-[var(--bg-hover)]" />
              <div className="h-4 w-36 rounded bg-[var(--bg-hover)]" />
            </div>
          ))}
        </div>
      </div>

      {/* List rows */}
      <div className="rounded-2xl bg-[var(--bg-card)] p-2 space-y-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-3.5">
            <div className="h-9 w-9 rounded-full bg-[var(--bg-hover)]" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-44 rounded bg-[var(--bg-hover)]" />
              <div className="h-3 w-28 rounded bg-[var(--bg-hover)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
