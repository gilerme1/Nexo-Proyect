import { PageHeader } from "@/components/layout/PageHeader";
import { PlatformSettingsClient } from "@/components/platform/PlatformSettingsClient";
import { store } from "@/lib/data/store";

export default function PlatformSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración"
        description="Configuración global de la plataforma. Marca, integraciones y políticas."
      />
      <PlatformSettingsClient brand={store.brand} />
    </div>
  );
}
