import type { Subscription, UsageCounter } from "@/lib/types";

// Each tenant has exactly one active subscription
export const mockSubscriptions: Subscription[] = [
  {
    id: "sub_norte",
    tenantId: "tenant_norte",
    planId: "plan_pro",
    status: "active",
    billingCycle: "monthly",
    currentPeriodStart: "2026-04-15T00:00:00Z",
    currentPeriodEnd: "2026-05-15T00:00:00Z",
    cancelAtPeriodEnd: false,
    externalProvider: "mercadopago",
    externalSubscriptionId: "mp_2a4f8c",
    isReadOnly: false,
    readOnlyReason: null,
    createdAt: "2026-02-04T10:00:00Z",
    updatedAt: "2026-04-15T00:00:00Z",
  },
  {
    id: "sub_clima",
    tenantId: "tenant_clima",
    planId: "plan_starter",
    status: "trialing",
    billingCycle: "monthly",
    currentPeriodStart: "2026-04-15T00:00:00Z",
    currentPeriodEnd: "2026-04-29T00:00:00Z",
    trialEndsAt: "2026-04-29T00:00:00Z",
    cancelAtPeriodEnd: false,
    externalProvider: "manual",
    isReadOnly: false,
    readOnlyReason: null,
    createdAt: "2026-04-15T10:00:00Z",
    updatedAt: "2026-04-15T10:00:00Z",
  },
  {
    id: "sub_lifts",
    tenantId: "tenant_lifts",
    planId: "plan_business",
    status: "active",
    billingCycle: "yearly",
    currentPeriodStart: "2026-03-02T00:00:00Z",
    currentPeriodEnd: "2027-03-02T00:00:00Z",
    cancelAtPeriodEnd: false,
    externalProvider: "mercadopago",
    externalSubscriptionId: "mp_7e2a1b",
    isReadOnly: false,
    readOnlyReason: null,
    createdAt: "2026-03-02T10:00:00Z",
    updatedAt: "2026-03-02T10:00:00Z",
  },
];

// Usage counters per tenant
export const mockUsageCounters: UsageCounter[] = [
  // Seguridad Norte (Pro: 5u/200eq/30c/500r) — busy tenant
  { id: "uc_1", tenantId: "tenant_norte", metric: "users", period: "lifetime", value: 4, updatedAt: "2026-04-26T10:00:00Z" },
  { id: "uc_2", tenantId: "tenant_norte", metric: "equipment", period: "lifetime", value: 162, updatedAt: "2026-04-26T10:00:00Z" },
  { id: "uc_3", tenantId: "tenant_norte", metric: "clients", period: "lifetime", value: 18, updatedAt: "2026-04-26T10:00:00Z" },
  { id: "uc_4", tenantId: "tenant_norte", metric: "reports", period: "month_2026_04", value: 287, updatedAt: "2026-04-26T10:00:00Z" },
  { id: "uc_5", tenantId: "tenant_norte", metric: "qr_tags", period: "month_2026_04", value: 350, updatedAt: "2026-04-26T10:00:00Z" },

  // ClimaVisión (Starter: 1u/30eq/5c/50r) — small operation
  { id: "uc_6", tenantId: "tenant_clima", metric: "users", period: "lifetime", value: 1, updatedAt: "2026-04-26T10:00:00Z" },
  { id: "uc_7", tenantId: "tenant_clima", metric: "equipment", period: "lifetime", value: 24, updatedAt: "2026-04-26T10:00:00Z" },
  { id: "uc_8", tenantId: "tenant_clima", metric: "clients", period: "lifetime", value: 4, updatedAt: "2026-04-26T10:00:00Z" },
  { id: "uc_9", tenantId: "tenant_clima", metric: "reports", period: "month_2026_04", value: 38, updatedAt: "2026-04-26T10:00:00Z" },
  { id: "uc_10", tenantId: "tenant_clima", metric: "qr_tags", period: "month_2026_04", value: 30, updatedAt: "2026-04-26T10:00:00Z" },

  // Elevatec (Business: 15u/1000eq/∞c/3000r) — big tenant
  { id: "uc_11", tenantId: "tenant_lifts", metric: "users", period: "lifetime", value: 9, updatedAt: "2026-04-26T10:00:00Z" },
  { id: "uc_12", tenantId: "tenant_lifts", metric: "equipment", period: "lifetime", value: 612, updatedAt: "2026-04-26T10:00:00Z" },
  { id: "uc_13", tenantId: "tenant_lifts", metric: "clients", period: "lifetime", value: 47, updatedAt: "2026-04-26T10:00:00Z" },
  { id: "uc_14", tenantId: "tenant_lifts", metric: "reports", period: "month_2026_04", value: 1240, updatedAt: "2026-04-26T10:00:00Z" },
  { id: "uc_15", tenantId: "tenant_lifts", metric: "qr_tags", period: "month_2026_04", value: 800, updatedAt: "2026-04-26T10:00:00Z" },
];
