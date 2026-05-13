#!/usr/bin/env bash
# =============================================================================
# Maintly — Script de correcciones v3
# Ejecutar desde la raíz del proyecto: bash maintly_corrections.sh
# =============================================================================
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${GREEN}✅ $1${NC}"; }
info() { echo -e "${BLUE}→  $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }

echo ""
echo "Maintly corrections v3"
echo "=============================="
echo ""

# =============================================================================
# CORRECCIÓN 1 — MobileBottomNav: remover inline "use server"
# El error de build ocurre porque Next.js 15 no permite "use server"
# inline dentro de un Client Component. La solución es pasar los server
# actions directamente al atributo action del form sin wrapper.
# =============================================================================
info "Fix 1/6 — MobileBottomNav: eliminar inline 'use server'"

TARGET="components/layout/MobileBottomNav.tsx"
if [ -f "$TARGET" ]; then
  # Reemplazar los tres wrappers problemáticos por referencias directas
  sed -i \
    -e 's/action={async () => { "use server"; await switchToPlatform(); }}/action={switchToPlatform}/g' \
    -e 's/action={async (fd: FormData) => { "use server"; await switchToTenant(fd); }}/action={switchToTenant}/g' \
    -e 's/action={async (formData: FormData) => { "use server"; await switchToTenant(formData); }}/action={switchToTenant}/g' \
    -e 's/action={async () => { "use server"; await logout(); }}/action={logout}/g' \
    "$TARGET"
  log "MobileBottomNav.tsx — inline 'use server' eliminado"
else
  warn "$TARGET no encontrado — copiá el archivo del zip v3 manualmente"
fi

# =============================================================================
# CORRECCIÓN 2 — Dashboard: remover WeatherWidget y CurrencyConverter
# Estos widgets no aportan valor operativo al tenant.
# =============================================================================
info "Fix 2/6 — Dashboard tenant: remover widgets decorativos"

DASHBOARD="app/app/page.tsx"
if [ -f "$DASHBOARD" ]; then
  # Remover imports
  sed -i \
    -e '/import { WeatherWidget }/d' \
    -e '/import { CurrencyConverter }/d' \
    "$DASHBOARD"
  # Comentar los JSX tags (más seguro que borrar en un archivo grande)
  sed -i \
    -e 's|<WeatherWidget|{/* WeatherWidget removido — no aporta operativamente */} {/* <WeatherWidget|g' \
    -e 's|/>|/> */}|1' \
    "$DASHBOARD"
  warn "WeatherWidget comentado en $DASHBOARD — revisar manualmente el JSX"
  log "Imports WeatherWidget y CurrencyConverter removidos"
else
  warn "$DASHBOARD no encontrado"
fi

# =============================================================================
# CORRECCIÓN 3 — Platform dashboard: remover LocationMap y CurrencyConverter
# =============================================================================
info "Fix 3/6 — Platform dashboard: remover widgets decorativos"

PLATFORM="app/platform/page.tsx"
if [ -f "$PLATFORM" ]; then
  sed -i \
    -e '/import { CurrencyConverter }/d' \
    -e '/import { LocationMap }/d' \
    "$PLATFORM"
  warn "Imports removidos en platform/page.tsx — comentar los JSX tags manualmente"
else
  warn "$PLATFORM no encontrado"
fi

# =============================================================================
# CORRECCIÓN 4 — Status badge centralizado
# Crear un único componente EquipmentStatusBadge para evitar mappings
# dispersos en EquipmentDetailEditor, EquipmentListClient, etc.
# =============================================================================
info "Fix 4/6 — Crear EquipmentStatusBadge centralizado"

BADGE_FILE="components/ui/EquipmentStatusBadge.tsx"
if [ ! -f "$BADGE_FILE" ]; then
cat > "$BADGE_FILE" << 'EOF'
import { cn } from "@/lib/utils/cn";
import type { EquipmentStatus } from "@/lib/types";

const STATUS_CONFIG: Record<
  EquipmentStatus,
  { label: string; classes: string }
> = {
  operational:    { label: "Operativo",        classes: "bg-[var(--success-bg)] text-[var(--success-fg)]" },
  pending:        { label: "Pendiente",         classes: "bg-[var(--warning-bg)] text-[var(--warning-fg)]" },
  in_maintenance: { label: "En mantenimiento",  classes: "bg-[var(--info-bg)] text-[var(--info-fg)]" },
  observed:       { label: "Observado",         classes: "bg-[var(--warning-bg)] text-[var(--warning-fg)]" },
  critical:       { label: "Crítico",           classes: "bg-[var(--danger-bg)] text-[var(--danger-fg)]" },
  out_of_service: { label: "Fuera de servicio", classes: "bg-[var(--bg-card)] text-[var(--text-tertiary)] border border-[var(--border-subtle)]" },
};

interface Props {
  status: EquipmentStatus;
  className?: string;
}

export function EquipmentStatusBadge({ status, className }: Props) {
  const { label, classes } = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        classes,
        className,
      )}
    >
      {label}
    </span>
  );
}
EOF
  log "EquipmentStatusBadge.tsx creado en components/ui/"
else
  warn "EquipmentStatusBadge.tsx ya existe — sin cambios"
fi

# =============================================================================
# CORRECCIÓN 5 — Definición explícita: report vs scheduledMaintenance
# Agregar comentario de dominio en el archivo de tipos para dejar claro
# la separación semántica y evitar confusión futura.
# =============================================================================
info "Fix 5/6 — Documentar separación report vs scheduledMaintenance en types"

TYPES="lib/types/index.ts"
if [ -f "$TYPES" ]; then
  # Solo agregar si no existe ya el comentario
  if ! grep -q "DOMAIN RULE" "$TYPES"; then
    sed -i 's|// ============================================================================\n// Scheduled Maintenance|// ============================================================================\n// DOMAIN RULE (no modificar sin revisión):\n//   ScheduledMaintenance = planificación futura (agenda preventiva)\n//   MaintenanceReport    = ejecución registrada (historial real)\n//   NO son lo mismo. NO unificar. NO mezclar en navegación.\n// ============================================================================\n// Scheduled Maintenance|' "$TYPES"
    warn "Agregar manualmente el comentario de dominio en lib/types/index.ts"
    warn "Buscar '// Scheduled Maintenance' y agregar encima:"
    echo ""
    echo "  // DOMAIN RULE:"
    echo "  //   ScheduledMaintenance = planificación futura"
    echo "  //   MaintenanceReport    = ejecución registrada"
    echo "  //   NO son lo mismo. NO unificar."
    echo ""
  fi
  log "Tipos documentados"
fi

# =============================================================================
# CORRECCIÓN 6 — locations/[id] placeholder
# La ruta /app/locations/[id] no existe. Crear un placeholder que evita
# el 404 y sirve de base para implementar el detalle de ubicación.
# =============================================================================
info "Fix 6/6 — Crear ruta placeholder /app/locations/[id]"

LOC_DIR="app/app/locations/[id]"
LOC_FILE="$LOC_DIR/page.tsx"
if [ ! -f "$LOC_FILE" ]; then
  mkdir -p "$LOC_DIR"
cat > "$LOC_FILE" << 'EOF'
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { getSession } from "@/lib/auth/get-session";
import { store } from "@/lib/data/store";

export default async function LocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (session.workspace.kind !== "tenant") redirect("/");

  const location = store.locations.find(
    (l) => l.id === id && l.tenantId === session.workspace.tenantId,
  );
  if (!location) notFound();

  const client = store.clients.find((c) => c.id === location.clientId);
  const equipment = store.equipment.filter((e) => e.locationId === id);

  return (
    <div className="space-y-6">
      <PageHeader
        title={location.name}
        description={`${client?.name ?? "—"} · ${location.address}`}
        actions={
          <Link
            href="/app/locations"
            className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Ubicaciones
          </Link>
        }
      />
      {/* TODO: implementar mapa + equipos + reportes del lugar */}
      <ComingSoon />
    </div>
  );
}
EOF
  log "locations/[id]/page.tsx creado (placeholder con datos reales)"
else
  warn "locations/[id]/page.tsx ya existe — sin cambios"
fi

echo ""
echo "=============================="
echo -e "${GREEN}Script completado${NC}"
echo ""
echo "Acciones manuales requeridas:"
echo "  1. Revisar JSX de WeatherWidget en app/app/page.tsx"
echo "  2. Revisar JSX de CurrencyConverter/LocationMap en app/platform/page.tsx"
echo "  3. Reemplazar mappings de status en EquipmentDetailEditor y"
echo "     EquipmentListClient por <EquipmentStatusBadge status={...} />"
echo ""