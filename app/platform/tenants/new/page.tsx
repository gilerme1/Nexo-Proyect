import { CreateTenantForm } from "@/components/platform/CreateTenantForm";
import { store } from "@/lib/data/store";

export default function NewTenantPage() {
  return (
    <CreateTenantForm verticals={store.verticals} plans={store.plans} />
  );
}
