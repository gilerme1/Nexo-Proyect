import { format, formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";

function toDate(value: string | Date | undefined | null): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  try {
    return parseISO(value);
  } catch {
    return null;
  }
}

export function formatDate(value: string | Date | undefined | null) {
  const d = toDate(value);
  if (!d) return "—";
  return format(d, "d MMM yyyy", { locale: es });
}

export function formatDateTime(value: string | Date | undefined | null) {
  const d = toDate(value);
  if (!d) return "—";
  return format(d, "d MMM yyyy · HH:mm", { locale: es });
}

export function formatRelative(value: string | Date | undefined | null) {
  const d = toDate(value);
  if (!d) return "—";
  return formatDistanceToNow(d, { addSuffix: true, locale: es });
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("es-UY").format(n);
}

export function initials(name: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}
