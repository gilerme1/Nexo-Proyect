"use client";

import { useDeferredValue, useState, useMemo } from "react";
import Link from "next/link";
import {
  Wrench,
  Plus,
  AlertCircle,
  MapPin,
  ChevronLeft,
} from "lucide-react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EquipmentStatusBadge } from "@/components/ui/EquipmentStatusBadge";
import { cn } from "@/lib/utils/cn";
import { formatRelative } from "@/lib/utils/format";
import type { Equipment, Client, Location, EquipmentType, EquipmentStatus } from "@/lib/types";

interface Props {
  equipment: Equipment[];
  clients: Client[];
  locations: Location[];
  equipmentTypes: EquipmentType[];
  preselectedClientId?: string | null;
}

type DraftFilter = "all" | "drafts" | "complete";
type EquipmentRow = {
  item: Equipment;
  createdTime: number;
  searchText: string;
};

const STATUS_OPTIONS: { value: EquipmentStatus | ""; label: string }[] = [
  { value: "", label: "Todos los estados" },
  { value: "operational",    label: "Operativo" },
  { value: "in_maintenance", label: "En mantenimiento" },
  { value: "observed",       label: "Observado" },
  { value: "critical",       label: "Crítico" },
  { value: "out_of_service", label: "Fuera de servicio" },
  { value: "pending",        label: "Pendiente" },
];

function toSearchText(e: Equipment): string {
  const serialNumber = e.data?.serialNumber as string | undefined;
  const licensePlate = e.data?.licensePlate as string | undefined;
  return `${e.name} ${e.internalCode} ${serialNumber ?? ""} ${licensePlate ?? ""}`.toLowerCase();
}

export function EquipmentListClient({ equipment, clients, locations, equipmentTypes, preselectedClientId }: Props) {
  const [draftFilter, setDraftFilter] = useState<DraftFilter>("all");
  const [query, setQuery]             = useState("");
  const [clientId, setClientId]       = useState(preselectedClientId ?? "");
  const [status, setStatus]           = useState<EquipmentStatus | "">("");
  const [mobileQuery, setMobileQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const deferredMobileQuery = useDeferredValue(mobileQuery);
  const equipmentRows = useMemo<EquipmentRow[]>(
    () =>
      equipment.map((item) => ({
        item,
        createdTime: new Date(item.createdAt).getTime(),
        searchText: toSearchText(item),
      })),
    [equipment],
  );

  const draftCount = useMemo(
    () => equipment.reduce((total, item) => total + (item.isDraft ? 1 : 0), 0),
    [equipment],
  );
  const completeCount = equipment.length - draftCount;
  const clientsById = useMemo(
    () => new Map(clients.map((client) => [client.id, client])),
    [clients],
  );
  const locationsById = useMemo(
    () => new Map(locations.map((location) => [location.id, location])),
    [locations],
  );
  const equipmentTypesById = useMemo(
    () => new Map(equipmentTypes.map((type) => [type.id, type])),
    [equipmentTypes],
  );

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return equipmentRows
      .filter(({ item, searchText }) => {
        if (draftFilter === "drafts" && !item.isDraft) return false;
        if (draftFilter === "complete" && item.isDraft) return false;
        if (clientId && item.clientId !== clientId) return false;
        if (status && item.status !== status) return false;
        if (q && !searchText.includes(q)) return false;
        return true;
      })
      .sort((a, b) => b.createdTime - a.createdTime)
      .map(({ item }) => item);
  }, [equipmentRows, draftFilter, clientId, status, deferredQuery]);

  const selectedClient = preselectedClientId
    ? clientsById.get(preselectedClientId)
    : null;

  // Mobile: search within client (if selected) or globally (if typing without client)
  const mobileFiltered = useMemo(() => {
    const q = deferredMobileQuery.trim().toLowerCase();
    return equipmentRows
      .filter(({ item, searchText }) => {
        if (preselectedClientId && item.clientId !== preselectedClientId) return false;
        if (q && !searchText.includes(q)) return false;
        return true;
      })
      .sort((a, b) => b.createdTime - a.createdTime)
      .map(({ item }) => item);
  }, [equipmentRows, preselectedClientId, deferredMobileQuery]);

  const showMobileResults = preselectedClientId || deferredMobileQuery.trim().length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipos"
        description="Inventario de equipos en gestión. Cada equipo tiene plantilla según su tipo."
        actions={
          <Link href="/app/equipment/new">
            <Button size="sm" pill leftIcon={<Plus className="h-3.5 w-3.5" />}>
              Nuevo equipo
            </Button>
          </Link>
        }
      />

      {/* Mobile view */}
      <div className="lg:hidden space-y-3">
        {/* Search always visible on mobile */}
        <Input
          value={mobileQuery}
          onChange={(e) => setMobileQuery(e.target.value)}
          leftIcon={<Search className="h-3.5 w-3.5" />}
          placeholder="Buscar por nombre, N° serie o matrícula…"
        />

        {!showMobileResults ? (
          /* No client selected, no query → prompt */
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-tertiary)]">
              <MapPin className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Buscá o elegí un cliente</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                Escribí un nombre, N° de serie o matrícula, o usá el mapa para seleccionar un cliente.
              </p>
            </div>
            <Link href="/app/map">
              <Button size="sm" pill>Ir al Mapa</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {preselectedClientId && (
              <div className="flex items-center gap-3">
                <Link
                  href="/app/map"
                  className="flex items-center gap-1 text-xs text-[var(--accent-500)] font-medium"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Mapa
                </Link>
                <h2 className="text-sm font-semibold text-[var(--text-primary)] flex-1 truncate">
                  Equipos de {selectedClient?.name ?? "…"}
                </h2>
                <span className="text-2xs tabular text-[var(--text-tertiary)] bg-[var(--bg-card)] border border-[var(--border-subtle)] px-2 py-0.5 rounded-full">
                  {mobileFiltered.length}
                </span>
              </div>
            )}

            {mobileFiltered.length === 0 ? (
              <div className="py-10 text-center text-sm text-[var(--text-tertiary)]">
                {mobileQuery ? "Sin resultados para esa búsqueda." : "Este cliente no tiene equipos."}
              </div>
            ) : (
              mobileFiltered.map((eq) => {
                const loc = eq.locationId ? locationsById.get(eq.locationId) : undefined;
                const client = clientsById.get(eq.clientId);
                const serialNumber = eq.data?.serialNumber as string | undefined;
                const licensePlate = eq.data?.licensePlate as string | undefined;
                return (
                  <Link
                    key={eq.id}
                    href={`/app/equipment/${eq.id}`}
                    className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{eq.name}</p>
                      <p className="text-2xs text-[var(--text-tertiary)] truncate mt-0.5">
                        {eq.internalCode}
                        {serialNumber ? ` · S/N: ${serialNumber}` : ""}
                        {licensePlate ? ` · Pat: ${licensePlate}` : ""}
                        {!preselectedClientId && client ? ` · ${client.name}` : ""}
                        {loc ? ` · ${loc.name}` : ""}
                      </p>
                      {eq.lastMaintenanceAt && (
                        <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
                          Último servicio {formatRelative(eq.lastMaintenanceAt)}
                        </p>
                      )}
                    </div>
                    <EquipmentStatusBadge status={eq.status} />
                  </Link>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Desktop view */}
      <div className="hidden lg:block space-y-6">

      {/* Desktop filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-full p-0.5">
          <FilterPill active={draftFilter === "all"}      onClick={() => setDraftFilter("all")}      count={equipment.length}>Todos</FilterPill>
          <FilterPill active={draftFilter === "complete"} onClick={() => setDraftFilter("complete")} count={completeCount}>Completos</FilterPill>
          <FilterPill active={draftFilter === "drafts"}   onClick={() => setDraftFilter("drafts")}   count={draftCount} tone={draftCount > 0 ? "warning" : undefined}>Pendientes</FilterPill>
        </div>

        <div className="flex gap-2 flex-1 flex-wrap">
          <div className="w-48">
            <Select value={clientId} onChange={(e) => setClientId(e.target.value)}>
              <option value="">Todos los clientes</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </div>
          <div className="w-48">
            <Select value={status} onChange={(e) => setStatus(e.target.value as EquipmentStatus | "")}>
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </div>
          <div className="flex-1 min-w-[200px] max-w-xs">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              leftIcon={<Search className="h-3.5 w-3.5" />}
              placeholder="Nombre, código, N° serie o matrícula…"
            />
          </div>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Wrench}
            title={equipment.length === 0 ? "Sin equipos aún" : "Sin resultados"}
            description={
              equipment.length === 0
                ? "Cargá tu primer equipo o escaneá un QR para empezar."
                : "Probá cambiando los filtros o la búsqueda."
            }
            action={
              equipment.length === 0 ? (
                <Link href="/app/equipment/new">
                  <Button size="sm" pill leftIcon={<Plus className="h-3.5 w-3.5" />}>Crear equipo</Button>
                </Link>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <Card>
          <CardBody className="p-2">
            <ul className="space-y-1">
              {filtered.map((eq) => {
                const client  = clientsById.get(eq.clientId);
                const loc     = eq.locationId ? locationsById.get(eq.locationId) : undefined;
                const eqType  = equipmentTypesById.get(eq.equipmentTypeId);
                const serialNumber = eq.data?.serialNumber as string | undefined;
                const licensePlate = eq.data?.licensePlate as string | undefined;
                return (
                  <li key={eq.id}>
                    <Link
                      href={`/app/equipment/${eq.id}`}
                      className="flex items-center justify-between gap-4 px-3 py-3.5 rounded-xl hover:bg-[var(--bg-hover)]"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className={cn(
                          "grid h-10 w-10 shrink-0 place-items-center rounded-full",
                          eq.isDraft
                            ? "bg-[var(--warning-bg)] text-[var(--warning-fg)]"
                            : "bg-[var(--bg-hover)] text-[var(--text-secondary)]",
                        )}>
                          {eq.isDraft ? <AlertCircle className="h-4 w-4" /> : <Wrench className="h-4 w-4" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 min-w-0 flex-wrap">
                            <p className="truncate text-sm font-medium text-[var(--text-primary)]">{eq.name}</p>
                            {eq.isDraft && <Badge tone="warning" size="sm">Pendiente</Badge>}
                          </div>
                          <p className="truncate text-2xs text-[var(--text-tertiary)]">
                            {eqType?.name}{client?.name ? ` · ${client.name}` : ""}{loc ? ` · ${loc.name}` : ""}
                          </p>
                          {(serialNumber || licensePlate) && (
                            <p className="truncate text-2xs text-[var(--text-tertiary)] mt-0.5">
                              {serialNumber ? `S/N: ${serialNumber}` : ""}
                              {serialNumber && licensePlate ? " · " : ""}
                              {licensePlate ? `Pat: ${licensePlate}` : ""}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <EquipmentStatusBadge status={eq.status} className="hidden sm:inline-flex" />
                        <span className="hidden md:block text-2xs text-[var(--text-tertiary)] tabular font-mono">
                          {eq.internalCode}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>
      )}
      </div>{/* end desktop view */}
    </div>
  );
}

function FilterPill({
  active, onClick, children, count, tone,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
  tone?: "warning";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 h-7 rounded-full text-xs font-medium flex items-center gap-1.5",
        active ? "bg-[var(--bg-hover)] text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
      )}
    >
      {children}
      {count !== undefined && (
        <span className={cn(
          "tabular text-2xs px-1.5 rounded-full",
          tone === "warning" && active ? "bg-[var(--warning-fg)] text-white"
            : tone === "warning" ? "bg-[var(--warning-bg)] text-[var(--warning-fg)]"
            : active ? "bg-[var(--bg-page)] text-[var(--text-tertiary)]"
            : "text-[var(--text-tertiary)]",
        )}>
          {count}
        </span>
      )}
    </button>
  );
}
