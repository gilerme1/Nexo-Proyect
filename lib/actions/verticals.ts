"use server";

import { revalidatePath } from "next/cache";
import { store, newId, slugify } from "@/lib/data/store";
import type { BusinessVertical, EquipmentType } from "@/lib/types";

// ============================================================================
// VERTICALS
// ============================================================================

export async function createVertical(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const icon = String(formData.get("icon") ?? "Layers").trim();

  if (!name) return;
  const slug = slugify(name);
  if (store.verticals.some((v) => v.slug === slug)) return;

  const vertical: BusinessVertical = {
    id: newId("vert"),
    slug,
    name,
    description: description || undefined,
    icon,
    color: "accent",
    createdAt: new Date().toISOString(),
  };
  store.verticals.push(vertical);

  revalidatePath("/platform/verticals");
  revalidatePath("/platform");
}

export async function updateVertical(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const icon = String(formData.get("icon") ?? "").trim();

  const v = store.verticals.find((x) => x.id === id);
  if (!v) return;
  if (name) v.name = name;
  v.description = description || undefined;
  if (icon) v.icon = icon;

  revalidatePath(`/platform/verticals/${id}`);
  revalidatePath("/platform/verticals");
}

export async function deleteVertical(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  // Block delete if there are dependent equipment types or tenant assignments
  const hasTypes = store.equipmentTypes.some((t) => t.verticalId === id);
  const hasTenants = store.tenantVerticals.some((tv) => tv.verticalId === id);
  if (hasTypes || hasTenants) {
    return; // silently ignore — UI shows the warning
  }
  store.verticals = store.verticals.filter((v) => v.id !== id);

  revalidatePath("/platform/verticals");
}

// ============================================================================
// EQUIPMENT TYPES
// ============================================================================

export async function createEquipmentType(formData: FormData) {
  const verticalId = String(formData.get("verticalId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const icon = String(formData.get("icon") ?? "Boxes").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!verticalId || !name) return;
  const slug = slugify(name);
  if (
    store.equipmentTypes.some(
      (t) => t.slug === slug && t.verticalId === verticalId,
    )
  )
    return;

  const type: EquipmentType = {
    id: newId("etype"),
    verticalId,
    slug,
    name,
    icon,
    description: description || undefined,
    createdAt: new Date().toISOString(),
  };
  store.equipmentTypes.push(type);

  revalidatePath("/platform/equipment-types");
  revalidatePath(`/platform/verticals/${verticalId}`);
}

export async function updateEquipmentType(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const icon = String(formData.get("icon") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  const t = store.equipmentTypes.find((x) => x.id === id);
  if (!t) return;
  if (name) t.name = name;
  if (icon) t.icon = icon;
  t.description = description || undefined;

  revalidatePath("/platform/equipment-types");
  revalidatePath(`/platform/verticals/${t.verticalId}`);
}

export async function deleteEquipmentType(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  // Block delete if equipment exists with this type
  const hasEquipment = store.equipment.some((e) => e.equipmentTypeId === id);
  if (hasEquipment) return;
  store.equipmentTypes = store.equipmentTypes.filter((t) => t.id !== id);

  revalidatePath("/platform/equipment-types");
}
