import { store } from "@/lib/data/store";
import type { FormSchema, FormField } from "@/lib/types";

/**
 * Get the active schema for a given equipment type ID.
 * Reads from the live store so changes made in the Form Builder
 * are immediately reflected.
 */
export function getSchemaForEquipmentType(
  equipmentTypeId: string,
): { fields: FormField[]; templateId: string } | null {
  const template = store.equipmentTemplates.find(
    (t) => t.equipmentTypeId === equipmentTypeId && t.isActive,
  );
  if (!template) return null;

  const version = store.equipmentTemplateVersions.find(
    (v) => v.id === template.currentVersionId,
  );
  if (!version) return null;

  const fields = version.schema.sections.flatMap((s) => s.fields);
  return { fields, templateId: template.id };
}

/**
 * Get fields for rendering in the new/edit equipment form.
 * Falls back to empty array if no template found.
 */
export function getEquipmentFormFields(
  equipmentTypeId: string,
): FormField[] {
  return getSchemaForEquipmentType(equipmentTypeId)?.fields ?? [];
}
