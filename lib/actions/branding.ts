"use server";

import { revalidatePath } from "next/cache";
import { store } from "@/lib/data/store";
import { getSession } from "@/lib/auth/get-session";

export interface SaveBrandingResult {
  ok: boolean;
  error?: string;
}

/**
 * Save tenant branding (accent color + logo).
 * Can be called from tenant settings OR from Platform → tenant detail.
 */
export async function saveTenantBranding(
  tenantId: string,
  branding: {
    accentColor?: string;
    logoUrl?: string;
    displayName?: string;
  },
): Promise<SaveBrandingResult> {
  const session = await getSession();
  if (!session.isLoggedIn) return { ok: false, error: "No autorizado." };

  // Only platform admin or the tenant's own admin can edit
  const isPlatformAdmin = session.workspace.kind === "platform";
  const isTenantAdmin =
    session.workspace.kind === "tenant" &&
    session.workspace.tenantId === tenantId;

  if (!isPlatformAdmin && !isTenantAdmin) {
    return { ok: false, error: "No tenés permiso para editar este tenant." };
  }

  const tenant = store.tenants.find((t) => t.id === tenantId);
  if (!tenant) return { ok: false, error: "Tenant no encontrado." };

  // Merge — don't overwrite fields not included in the call
  tenant.branding = {
    ...tenant.branding,
    ...Object.fromEntries(
      Object.entries(branding).filter(([, v]) => v !== undefined),
    ),
  };

  revalidatePath("/app");
  revalidatePath(`/platform/tenants/${tenantId}`);
  return { ok: true };
}
