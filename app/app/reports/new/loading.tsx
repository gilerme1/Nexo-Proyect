export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* PageHeader */}
      <div className="space-y-2">
        <div className="h-7 w-44 rounded-xl bg-[var(--bg-card)]" />
        <div className="h-4 w-60 rounded-lg bg-[var(--bg-card)]" />
      </div>

      {/* Field 1 */}
      <div className="rounded-2xl bg-[var(--bg-card)] p-6 space-y-4">
        <div className="h-5 w-32 rounded-lg bg-[var(--bg-hover)]" />
        <div className="h-10 w-full rounded-xl bg-[var(--bg-hover)]" />
        <div className="h-10 w-full rounded-xl bg-[var(--bg-hover)]" />
      </div>

      {/* Field 2 */}
      <div className="rounded-2xl bg-[var(--bg-card)] p-6 space-y-4">
        <div className="h-5 w-40 rounded-lg bg-[var(--bg-hover)]" />
        <div className="h-10 w-full rounded-xl bg-[var(--bg-hover)]" />
        <div className="h-24 w-full rounded-xl bg-[var(--bg-hover)]" />
      </div>

      {/* Checklist */}
      <div className="rounded-2xl bg-[var(--bg-card)] p-6 space-y-3">
        <div className="h-5 w-36 rounded-lg bg-[var(--bg-hover)]" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-5 w-5 rounded bg-[var(--bg-hover)]" />
            <div className="h-4 w-48 rounded bg-[var(--bg-hover)]" />
          </div>
        ))}
      </div>

      {/* Field 4 — photos */}
      <div className="rounded-2xl bg-[var(--bg-card)] p-6 space-y-4">
        <div className="h-5 w-24 rounded-lg bg-[var(--bg-hover)]" />
        <div className="h-16 w-full rounded-xl bg-[var(--bg-hover)]" />
      </div>

      {/* Submit button */}
      <div className="h-10 w-40 rounded-full bg-[var(--bg-card)]" />
    </div>
  );
}
