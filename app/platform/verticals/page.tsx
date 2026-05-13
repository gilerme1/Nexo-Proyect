import { VerticalsClient } from "@/components/platform/VerticalsClient";
import { store } from "@/lib/data/store";

export default function VerticalsPage() {
  return (
    <VerticalsClient
      verticals={store.verticals}
      equipmentTypes={store.equipmentTypes}
      tenantVerticals={store.tenantVerticals}
    />
  );
}
