"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/get-session";
import { newId, store } from "@/lib/data/store";
import type { AppRole, Membership, User } from "@/lib/types";

type TenantRole = Exclude<AppRole, "platform_admin">;

async function guardAdmin() {
  const session = await getSession();
  if (
    session.role !== "tenant_admin" &&
    session.role !== "platform_admin"
  ) {
    throw new Error("Sin permisos.");
  }
  if (session.workspace.kind !== "tenant") {
    throw new Error("Sesión inválida.");
  }
  return { session, tenantId: session.workspace.tenantId };
}

export async function inviteMember(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const { tenantId } = await guardAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "technician") as TenantRole;

  if (!email) return { ok: false, error: "El email es obligatorio." };

  const now = new Date().toISOString();

  let user = store.users.find((u) => u.email.toLowerCase() === email);
  if (!user) {
    const newUser: User = {
      id: newId("user"),
      name: name || email,
      email,
      isPlatformAdmin: false,
      createdAt: now,
    };
    store.users.push(newUser);
    user = newUser;
  }

  const existing = store.memberships.find(
    (m) => m.userId === user!.id && m.tenantId === tenantId,
  );
  if (existing) {
    if (existing.active) {
      return { ok: false, error: "Este usuario ya es miembro." };
    }
    existing.active = true;
    existing.role = role;
  } else {
    const mem: Membership = {
      id: newId("mem"),
      userId: user.id,
      tenantId,
      role,
      active: true,
      createdAt: now,
    };
    store.memberships.push(mem);
  }

  revalidatePath("/app/users");
  return { ok: true };
}

export async function updateMemberRole(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  await guardAdmin();

  const membershipId = String(formData.get("membershipId") ?? "");
  const role = String(formData.get("role") ?? "technician") as TenantRole;

  const membership = store.memberships.find((m) => m.id === membershipId);
  if (!membership) return { ok: false, error: "Membresía no encontrada." };

  membership.role = role;
  revalidatePath("/app/users");
  return { ok: true };
}

export async function updateMember(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  await guardAdmin();

  const membershipId = String(formData.get("membershipId") ?? "");
  const name  = String(formData.get("name")  ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role  = String(formData.get("role")  ?? "technician") as TenantRole;

  const membership = store.memberships.find((m) => m.id === membershipId);
  if (!membership) return { ok: false, error: "Membresía no encontrada." };

  membership.role = role;

  const user = store.users.find((u) => u.id === membership.userId);
  if (user) {
    if (name)  user.name  = name;
    if (email) user.email = email;
  }

  revalidatePath("/app/users");
  return { ok: true };
}

export async function removeMember(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  await guardAdmin();

  const membershipId = String(formData.get("membershipId") ?? "");
  const membership = store.memberships.find((m) => m.id === membershipId);
  if (!membership) return { ok: false, error: "Membresía no encontrada." };

  membership.active = false;
  revalidatePath("/app/users");
  return { ok: true };
}
