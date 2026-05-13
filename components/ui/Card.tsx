import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  elevated?: boolean;
  children: ReactNode;
}

export function Card({
  className,
  interactive,
  elevated,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-[var(--bg-card)] border border-[var(--border-subtle)]",
        "rounded-[var(--radius-card)]",
        elevated && "bg-[var(--bg-card-elevated)] shadow-[var(--shadow-elevated)]",
        interactive &&
          "hover:border-[var(--border-default)] cursor-pointer",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "px-6 py-5 border-b border-[var(--border-subtle)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <h3
      className={cn(
        "text-sm font-semibold text-[var(--text-primary)]",
        className,
      )}
    >
      {children}
    </h3>
  );
}

export function CardBody({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("p-6", className)}>{children}</div>;
}
