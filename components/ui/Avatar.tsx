import { cn } from "@/lib/utils/cn";
import { initials } from "@/lib/utils/format";

interface AvatarProps {
  name: string;
  src?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  xs: "h-5 w-5 text-2xs",
  sm: "h-6 w-6 text-2xs",
  md: "h-9 w-9 text-xs",
  lg: "h-11 w-11 text-sm",
};

// Subtle palette that works in both modes
const palette = [
  "bg-[var(--info-bg)] text-[var(--info-fg)]",
  "bg-[var(--success-bg)] text-[var(--success-fg)]",
  "bg-[var(--warning-bg)] text-[var(--warning-fg)]",
  "bg-[var(--danger-bg)] text-[var(--danger-fg)]",
  "bg-[var(--bg-hover)] text-[var(--text-primary)]",
];

function colorFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={cn(
          "rounded-full object-cover ring-1 ring-[var(--border-default)]",
          sizes[size],
          className,
        )}
      />
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-semibold rounded-full",
        colorFor(name),
        sizes[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
