import Link from "next/link";
import {
  Search,
  Wrench,
  Building2,
  FileText,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { MobileScanAction } from "@/components/layout/MobileScanAction";
import { InspectionButton } from "@/components/mobile/InspectionButton";
import { EquipmentStatusBadge } from "@/components/ui/EquipmentStatusBadge";
import type { Equipment, Location } from "@/lib/types";

interface TechnicianDashboardProps {
  userName: string;
  equipmentById: Map<string, Equipment>;
  locations: Location[];
  equipment: Equipment[];
}

const QUICK_ACTIONS = [
  { label: "Buscar equipo",  href: "/app/equipment",      icon: Search,    accent: false },
  { label: "Nuevo reporte",  href: "/app/reports/new",    icon: FileText,  accent: true  },
  { label: "Nuevo equipo",   href: "/app/equipment/new",  icon: Wrench,    accent: false },
  { label: "Nuevo cliente",  href: "/app/clients/new",    icon: Building2, accent: false },
];

export function TechnicianDashboard({
  userName,
  equipmentById,
  locations,
  equipment,
}: TechnicianDashboardProps) {
  const firstName = userName.split(" ")[0];

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div className="pt-1">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">
          Hola, {firstName}
        </h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-0.5">
          ¿Qué hacemos hoy?
        </p>
      </div>

      {/* Primary action: Scan */}
      <MobileScanAction />

      {/* Quick actions grid */}
      <div className="grid grid-cols-2 gap-3">
        {QUICK_ACTIONS.map(({ label, href, icon: Icon, accent }) => (
          <Link
            key={href}
            href={href}
            className={
              accent
                ? "flex flex-col items-center justify-center gap-2 rounded-2xl py-5 text-sm font-semibold text-white bg-[var(--accent-500)] hover:opacity-90 active:opacity-80 shadow-sm"
                : "flex flex-col items-center justify-center gap-2 rounded-2xl py-5 text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] active:opacity-80"
            }
          >
            <Icon className={accent ? "h-6 w-6" : "h-6 w-6 text-[var(--text-tertiary)]"} />
            {label}
          </Link>
        ))}
      </div>

      {/* Nueva inspección — full width */}
      <InspectionButton locations={locations} equipment={equipment} />

      {/* Desktop only: equipment list */}
      <div className="hidden lg:block">
        <Card>
          <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Equipos recientes</h2>
          </div>
          <CardBody className="p-2">
            <ul className="space-y-0.5">
              {Array.from(equipmentById.values()).slice(0, 6).map((eq) => (
                <li key={eq.id}>
                  <Link
                    href={`/app/equipment/${eq.id}`}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--bg-hover)]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--text-primary)]">{eq.name}</p>
                      <p className="truncate text-2xs text-[var(--text-tertiary)]">{eq.internalCode}</p>
                    </div>
                    <EquipmentStatusBadge status={eq.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
