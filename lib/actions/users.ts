"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/get-session";
import { newId, store } from "@/lib/data/store";
import type { AppRole, Membership, User } from "@/lib/types";

type TenantRole = Exclude<AppRole, "platform_admin">;

function normalizeEmail(email: FormDataEntryValue | null): string {
  return String(email ?? "").trim().toLowerCase();
}

function requirePlatformAdmin() {
  return getSession().then((session) => {
    if (session.role !== "platform_admin") {
      throw new Error("No tenés permisos para administrar usuarios.");
    }
    return session;
  });
}

function revalidateUsers() {
  revalidatePath("/platform/users");
  revalidatePath("/app/users");
}

function hasOtherPlatformAdmin(userId: string): boolean {
  return store.users.some((user) => user.id !== userId && user.isPlatformAdmin);
}

export async function createPlatformUser(formData: FormData) {
  await requirePlatformAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const email = normalizeEmail(formData.get("email"));
  const isPlatformAdmin = formData.get("isPlatformAdmin") === "on";
  const tenantId = String(formData.get("tenantId") ?? "");
  const role = String(formData.get("role") ?? "technician") as TenantRole;

  if (!name) return { ok: false, error: "Ingresá un nombre." };
  if (!email) return { ok: false, error: "Ingresá un email." };
  if (store.users.some((user) => user.email.toLowerCase() === email)) {
    return { ok: false, error: "Ya existe un usuario con ese email." };
  }

  const now = new Date().toISOString();
  const user: User = {
    id: newId("user"),
    name,
    email,
    isPlatformAdmin,
    createdAt: now,
  };
  store.users.push(user);

  if (tenantId) {
    const membership: Membership = {
      id: newId("mem"),
      userId: user.id,
      tenantId,
      role,
      active: true,
      createdAt: now,
    };
    store.memberships.push(membership);
  }

  revalidateUsers();
  return { ok: true };
}

export async function updatePlatformUser(formData: FormData) {
  await requirePlatformAdmin();

  const userId = String(formData.get("userId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const email = normalizeEmail(formData.get("email"));
  const isPlatformAdmin = formData.get("isPlatformAdmin") === "on";

  const user = store.users.find((item) => item.id === userId);
  if (!user) return { ok: false, error: "Usuario no encontrado." };
  if (!name) return { ok: false, error: "Ingresá un nombre." };
  if (!email) return { ok: false, error: "Ingresá un email." };
  if (
    store.users.some(
      (item) => item.id !== userId && item.email.toLowerCase() === email,
    )
  ) {
    return { ok: false, error: "Ya existe otro usuario con ese email." };
  }
  if (user.isPlatformAdmin && !isPlatformAdmin && !hasOtherPlatformAdmin(userId)) {
    return { ok: false, error: "No podés quitar el último Super Admin." };
  }

  user.name = name;
  user.email = email;
  user.isPlatformAdmin = isPlatformAdmin;

  revalidateUsers();
  return { ok: true };
}

export async function addUserMembership(formData: FormData) {
  await requirePlatformAdmin();

  const userId = String(formData.get("userId") ?? "");
  const tenantId = String(formData.get("tenantId") ?? "");
  const role = String(formData.get("role") ?? "technician") as TenantRole;

  if (!store.users.some((user) => user.id === userId)) {
    return { ok: false, error: "Usuario no encontrado." };
  }
  if (!store.tenants.some((tenant) => tenant.id === tenantId)) {
    return { ok: false, error: "Tenant no encontrado." };
  }

  const existing = store.memberships.find(
    (membership) => membership.userId === userId && membership.tenantId === tenantId,
  );
  if (existing) {
    existing.role = role;
    existing.active = true;
  } else {
    store.memberships.push({
      id: newId("mem"),
      userId,
      tenantId,
      role,
      active: true,
      createdAt: new Date().toISOString(),
    });
  }

  revalidateUsers();
  return { ok: true };
}

export async function updateUserMembership(formData: FormData) {
  await requirePlatformAdmin();

  const membershipId = String(formData.get("membershipId") ?? "");
  const role = String(formData.get("role") ?? "technician") as TenantRole;
  const active = formData.get("active") === "on";

  const membership = store.memberships.find((item) => item.id === membershipId);
  if (!membership) return { ok: false, error: "Membresía no encontrada." };

  membership.role = role;
  membership.active = active;

  revalidateUsers();
  return { ok: true };
}
