"use server";

import { revalidatePath } from "next/cache";
import { store } from "@/lib/data/store";
import type { Plan, PlanFeatures, PlanLimits } from "@/lib/types";

function parseLimit(value: FormDataEntryValue | null): number | null {
  if (!value) return null;
  const s = String(value).trim();
  if (!s || s === "∞" || s.toLowerCase() === "unlimited") return null;
  const n = parseInt(s, 10);
  if (isNaN(n) || n < 0) return null;
  return n;
}

function parseBool(value: FormDataEntryValue | null): boolean {
  return value === "on" || value === "true";
}

function parseFloat0(value: FormDataEntryValue | null): number {
  if (!value) return 0;
  const n = parseFloat(String(value));
  return isNaN(n) ? 0 : Math.max(0, n);
}

export async function updatePlan(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const plan = store.plans.find((p) => p.id === id);
  if (!plan) return;

  // Editable fields
  const name = String(formData.get("name") ?? plan.name).trim();
  const description = String(formData.get("description") ?? "").trim();
  const monthlyPriceUsd = parseFloat0(formData.get("monthlyPriceUsd"));
  const yearlyPriceUsd = parseFloat0(formData.get("yearlyPriceUsd"));

  const limits: PlanLimits = {
    users: parseLimit(formData.get("limit_users")),
    equipment: parseLimit(formData.get("limit_equipment")),
    clients: parseLimit(formData.get("limit_clients")),
    reportsPerMonth: parseLimit(formData.get("limit_reportsPerMonth")),
    qrTagsPerMonth: parseLimit(formData.get("limit_qrTagsPerMonth")),
  };

  const features: PlanFeatures = {
    formBuilder: parseBool(formData.get("feat_formBuilder")),
    apiAccess: parseBool(formData.get("feat_apiAccess")),
    customDomain: parseBool(formData.get("feat_customDomain")),
    prioritySupport: parseBool(formData.get("feat_prioritySupport")),
    qrPrintBatches: parseBool(formData.get("feat_qrPrintBatches")),
    advancedAnalytics: parseBool(formData.get("feat_advancedAnalytics")),
  };

  if (name) plan.name = name;
  plan.description = description || undefined;
  plan.monthlyPriceUsd = monthlyPriceUsd;
  plan.yearlyPriceUsd = yearlyPriceUsd;
  plan.limits = limits;
  plan.features = features;

  revalidatePath("/platform/plans");
  revalidatePath(`/platform/plans/${id}`);
  revalidatePath("/platform");
}

export async function togglePlanPublic(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const plan = store.plans.find((p) => p.id === id);
  if (!plan) return;
  plan.isPublic = !plan.isPublic;
  revalidatePath("/platform/plans");
}
