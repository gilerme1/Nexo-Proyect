"use server";

import { revalidatePath } from "next/cache";
import { store, newId } from "@/lib/data/store";
import { getSession } from "@/lib/auth/get-session";
import { canCreate } from "@/lib/billing/limits";
import { geocodeAddress } from "@/lib/geo/geocoding";
import type { Client, Location } from "@/lib/types";

export interface ClientActionResult {
  ok: boolean;
  error?: string;
  clientId?: string;
}

// ============================================================================
// CREATE CLIENT
// ============================================================================

export async function createClient(formData: FormData): Promise<ClientActionResult> {
  const session = await getSession();
  if (session.workspace.kind !== "tenant") {
    return { ok: false, error: "Sesión inválida." };
  }
  const tenantId = session.workspace.tenantId;

  // Limit check
  const limit = canCreate(tenantId, "clients");
  if (!limit.allowed) {
    return {
      ok: false,
      error: limit.reason ?? "Llegaste al límite de clientes de tu plan.",
    };
  }

  const name = String(formData.get("name") ?? "").trim();
  const taxId = String(formData.get("taxId") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim();
  const type = (String(formData.get("type") ?? "company") as Client["type"]) || "company";

  if (!name) return { ok: false, error: "El nombre es obligatorio." };

  const now = new Date().toISOString();
  const client: Client = {
    id: newId("cli"),
    tenantId,
    name,
    type,
    taxId: taxId || undefined,
    contactName: contactName || undefined,
    contactEmail: contactEmail || undefined,
    contactPhone: contactPhone || undefined,
    status: "active",
    ownerId: session.userId,
    createdAt: now,
  };

  store.clients.push(client);

  revalidatePath("/app/clients");
  revalidatePath("/app");
  return { ok: true, clientId: client.id };
}

// ============================================================================
// UPDATE CLIENT
// ============================================================================

export async function updateClient(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const client = store.clients.find((c) => c.id === id);
  if (!client) return;

  const name = String(formData.get("name") ?? "").trim();
  if (name) client.name = name;

  client.taxId = String(formData.get("taxId") ?? "").trim() || undefined;
  client.contactName = String(formData.get("contactName") ?? "").trim() || undefined;
  client.contactEmail = String(formData.get("contactEmail") ?? "").trim() || undefined;
  client.contactPhone = String(formData.get("contactPhone") ?? "").trim() || undefined;
  const type = String(formData.get("type") ?? "");
  if (type) client.type = type as Client["type"];

  revalidatePath(`/app/clients/${id}`);
  revalidatePath("/app/clients");
}

// ============================================================================
// DELETE CLIENT
// ============================================================================

export async function deleteClient(formData: FormData): Promise<ClientActionResult> {
  const id = String(formData.get("id") ?? "");
  const hasLocations = store.locations.some((l) => l.clientId === id);
  const hasEquipment = store.equipment.some((e) => e.clientId === id);
  if (hasLocations || hasEquipment) {
    return {
      ok: false,
      error: "Este cliente tiene ubicaciones o equipos. Eliminá esos primero.",
    };
  }
  store.clients = store.clients.filter((c) => c.id !== id);
  revalidatePath("/app/clients");
  return { ok: true };
}

// ============================================================================
// LOCATIONS
// ============================================================================

export async function createLocation(formData: FormData): Promise<{ ok: boolean; error?: string; locationId?: string }> {
  const session = await getSession();
  if (session.workspace.kind !== "tenant") {
    return { ok: false, error: "Sesión inválida." };
  }
  const tenantId = session.workspace.tenantId;

  const clientId = String(formData.get("clientId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!clientId) return { ok: false, error: "Cliente requerido." };
  if (!name) return { ok: false, error: "Nombre de ubicación requerido." };

  const client = store.clients.find((c) => c.id === clientId);
  if (!client || client.tenantId !== tenantId) {
    return { ok: false, error: "Cliente inválido." };
  }

  // Geocode in the background — don't block creation if it fails
  let latitude: number | undefined;
  let longitude: number | undefined;
  if (address) {
    const geo = await geocodeAddress(address, city, "Uruguay");
    if (geo) {
      latitude = geo.latitude;
      longitude = geo.longitude;
    }
  }

  const location: Location = {
    id: newId("loc"),
    tenantId,
    clientId,
    name,
    address: address || "—",
    city: city || undefined,
    latitude,
    longitude,
    status: "operational",
    notes: notes || undefined,
    createdAt: new Date().toISOString(),
  };

  store.locations.push(location);

  revalidatePath(`/app/clients/${clientId}`);
  revalidatePath("/app/locations");
  return { ok: true, locationId: location.id };
}

export async function updateLocation(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const loc = store.locations.find((l) => l.id === id);
  if (!loc) return;

  const name = String(formData.get("name") ?? "").trim();
  if (name) loc.name = name;
  loc.address = String(formData.get("address") ?? "").trim() || undefined;
  loc.city = String(formData.get("city") ?? "").trim() || undefined;
  loc.notes = String(formData.get("notes") ?? "").trim() || undefined;

  revalidatePath(`/app/clients/${loc.clientId}`);
  revalidatePath("/app/locations");
}

export async function deleteLocation(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const hasEquipment = store.equipment.some((e) => e.locationId === id);
  if (hasEquipment) return { ok: false, error: "Hay equipos en esta ubicación." };
  const loc = store.locations.find((l) => l.id === id);
  if (!loc) return;
  const clientId = loc.clientId;
  store.locations = store.locations.filter((l) => l.id !== id);
  revalidatePath(`/app/clients/${clientId}`);
  revalidatePath("/app/locations");
  return { ok: true };
}
