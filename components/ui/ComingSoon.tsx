import type { LucideIcon } from "lucide-react";
import { Construction } from "lucide-react";
import { Card } from "./Card";

interface Props {
  title: string;
  description: string;
  icon?: LucideIcon;
  delivery: string;
}

export function ComingSoon({
  title,
  description,
  icon: Icon,
  delivery,
}: Props) {
  const Display = Icon ?? Construction;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          {title}
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)] max-w-2xl">
          {description}
        </p>
      </div>

      <Card className="p-16 text-center">
        <span className="inline-grid h-16 w-16 place-items-center rounded-2xl bg-[var(--bg-hover)] text-[var(--text-secondary)]">
          <Display className="h-7 w-7" />
        </span>
        <p className="mt-5 text-base font-semibold text-[var(--text-primary)]">
          En construcción
        </p>
        <p className="mt-1.5 text-sm text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
          Esta sección se completa en la <strong>{delivery}</strong>.
          Por ahora solo tenés acceso al dashboard.
        </p>
      </Card>
    </div>
  );
}
