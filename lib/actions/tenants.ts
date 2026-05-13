"use server";

import { revalidatePath } from "next/cache";
import { store, newId, slugify } from "@/lib/data/store";
import type {
  Tenant,
  Subscription,
  TenantVertical,
} from "@/lib/types";

export interface ActionResult {
  ok: boolean;
  error?: string;
  redirectTo?: string;
}

// ============================================================================
// CREATE TENANT
// ============================================================================

export async function createTenant(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const legalName = String(formData.get("legalName") ?? "").trim();
  const planId = String(formData.get("planId") ?? "").trim();
  const verticalIds = formData.getAll("verticalIds").map(String);

  if (!name) return { ok: false, error: "El nombre es obligatorio." };
  if (!planId) return { ok: false, error: "Tenés que elegir un plan." };
  if (verticalIds.length === 0) {
    return { ok: false, error: "Asigná al menos un rubro al tenant." };
  }

  const slug = slugify(name);
  if (store.tenants.some((t) => t.slug === slug)) {
    return {
      ok: false,
      error: `Ya existe un tenant con un nombre similar (slug: ${slug}).`,
    };
  }

  const plan = store.plans.find((p) => p.id === planId);
  if (!plan) return { ok: false, error: "Plan inválido." };

  const now = new Date().toISOString();
  const tenant: Tenant = {
    id: newId("tenant"),
    slug,
    name,
    legalName: legalName || undefined,
    plan: plan.slug,
    status: "active",
    createdAt: now,
  };

  // Vertical assignments
  const tenantVerticals: TenantVertical[] = verticalIds.map((vid) => ({
    id: newId("tv"),
    tenantId: tenant.id,
    verticalId: vid,
    createdAt: now,
  }));

  // Default subscription — 14 day trial
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 14);
  const sub: Subscription = {
    id: newId("sub"),
    tenantId: tenant.id,
    planId: plan.id,
    status: "trialing",
    billingCycle: "monthly",
    currentPeriodStart: now,
    currentPeriodEnd: trialEnd.toISOString(),
    trialEndsAt: trialEnd.toISOString(),
    cancelAtPeriodEnd: false,
    externalProvider: "manual",
    isReadOnly: false,
    readOnlyReason: null,
    createdAt: now,
    updatedAt: now,
  };

  store.tenants.push(tenant);
  store.tenantVerticals.push(...tenantVerticals);
  store.subscriptions.push(sub);

  revalidatePath("/platform/tenants");
  revalidatePath("/platform");
  return { ok: true, redirectTo: `/platform/tenants/${tenant.id}` };
}

// ============================================================================
// UPDATE TENANT
// ============================================================================

export async function updateTenant(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const legalName = String(formData.get("legalName") ?? "").trim();
  const status = String(formData.get("status") ?? "active") as Tenant["status"];

  if (!id || !name) return { ok: false, error: "Datos incompletos." };

  const tenant = store.tenants.find((t) => t.id === id);
  if (!tenant) return { ok: false, error: "Tenant no encontrado." };

  tenant.name = name;
  tenant.legalName = legalName || undefined;
  tenant.status = status;

  revalidatePath(`/platform/tenants/${id}`);
  revalidatePath("/platform/tenants");
  return { ok: true };
}

// ============================================================================
// SUSPEND / REACTIVATE
// ============================================================================

export async function toggleTenantStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const tenant = store.tenants.find((t) => t.id === id);
  if (!tenant) return;
  tenant.status = tenant.status === "active" ? "suspended" : "active";
  revalidatePath(`/platform/tenants/${id}`);
  revalidatePath("/platform/tenants");
}

// ============================================================================
// CHANGE PLAN (super admin override)
// ============================================================================

export async function changeTenantPlan(formData: FormData) {
  const tenantId = String(formData.get("tenantId") ?? "");
  const planId = String(formData.get("planId") ?? "");

  const tenant = store.tenants.find((t) => t.id === tenantId);
  const plan = store.plans.find((p) => p.id === planId);
  const sub = store.subscriptions.find((s) => s.tenantId === tenantId);

  if (!tenant || !plan || !sub) return;

  sub.planId = plan.id;
  sub.updatedAt = new Date().toISOString();
  tenant.plan = plan.slug;

  revalidatePath(`/platform/tenants/${tenantId}`);
  revalidatePath("/platform");
}

// ============================================================================
// ASSIGN VERTICALS
// ============================================================================

export async function setTenantVerticals(formData: FormData) {
  const tenantId = String(formData.get("tenantId") ?? "");
  const verticalIds = formData.getAll("verticalIds").map(String);
  const now = new Date().toISOString();

  // Remove existing assignments
  store.tenantVerticals = store.tenantVerticals.filter(
    (tv) => tv.tenantId !== tenantId,
  );
  // Add new
  for (const vid of verticalIds) {
    store.tenantVerticals.push({
      id: newId("tv"),
      tenantId,
      verticalId: vid,
      createdAt: now,
    });
  }

  revalidatePath(`/platform/tenants/${tenantId}`);
}
