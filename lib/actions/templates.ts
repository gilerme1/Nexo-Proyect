"use server";

import { revalidatePath } from "next/cache";
import { store, newId } from "@/lib/data/store";
import type { FormSchema, EquipmentTemplateVersion } from "@/lib/types";

export interface SaveTemplateResult {
  ok: boolean;
  error?: string;
  versionId?: string;
}

/**
 * Save a new version of a template's schema.
 * Always creates a new version — never mutates existing versions.
 * Updates the template's currentVersionId to the new version.
 */
export async function saveTemplateVersion(
  templateId: string,
  schema: FormSchema,
): Promise<SaveTemplateResult> {
  const template = store.equipmentTemplates.find((t) => t.id === templateId);
  if (!template) return { ok: false, error: "Plantilla no encontrada." };

  // Find the latest version number
  const existingVersions = store.equipmentTemplateVersions.filter(
    (v) => v.templateId === templateId,
  );
  const latestVersion = Math.max(0, ...existingVersions.map((v) => v.versionNumber));

  const newVersion: EquipmentTemplateVersion = {
    id: newId("tplv"),
    templateId,
    versionNumber: latestVersion + 1,
    schema,
    publishedAt: new Date().toISOString(),
    publishedBy: "user_admin",
  };

  store.equipmentTemplateVersions.push(newVersion);
  template.currentVersionId = newVersion.id;

  revalidatePath("/platform/templates");
  revalidatePath("/app/equipment/new");

  return { ok: true, versionId: newVersion.id };
}
