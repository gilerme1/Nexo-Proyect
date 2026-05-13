import { Monitor } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { FormBuilder } from "@/components/platform/FormBuilder";
import { store } from "@/lib/data/store";

export default function TemplatesPage() {
  // Sort templates to match equipment type order
  const templates = store.equipmentTemplates.filter((t) => t.isActive);
  const versions = store.equipmentTemplateVersions;
  const equipmentTypes = store.equipmentTypes;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plantillas de equipos"
        description="Configurá los campos que se van a pedir al registrar cada tipo de equipo. Los cambios se aplican a partir del siguiente equipo creado — los datos históricos no se modifican."
      />
      {/* Mobile: editor no disponible */}
      <div className="lg:hidden">
        <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center
                        rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
          <span className="grid h-14 w-14 place-items-center rounded-2xl
                           bg-[var(--warning-bg)] text-[var(--warning-fg)]">
            <Monitor className="h-7 w-7" />
          </span>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Requiere pantalla más grande
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1 max-w-xs">
              El editor de plantillas está optimizado para desktop.
              Accedé desde una computadora para editar.
            </p>
          </div>
        </div>
      </div>

      {/* Desktop: editor completo */}
      <div className="hidden lg:block">
        <FormBuilder
          templates={templates}
          versions={versions}
          equipmentTypes={equipmentTypes}
        />
      </div>
    </div>
  );
}
