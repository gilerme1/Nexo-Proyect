// ============================================================================
// Maintly · Type System
// ============================================================================

export type ID = string;
export type ISODate = string;

// ============================================================================
// Identity & Permissions
// ============================================================================

export type AppRole =
  | "platform_admin"
  | "tenant_admin"
  | "technician"
  | "viewer"
  | "client_portal";

export interface User {
  id: ID;
  email: string;
  name: string;
  avatarUrl?: string;
  isPlatformAdmin: boolean;
  /** Plaintext for demo — replace with bcrypt hash in production */
  password?: string;
  createdAt: ISODate;
}

export interface Tenant {
  id: ID;
  slug: string;
  name: string;
  legalName?: string;
  plan: "starter" | "pro" | "business" | "enterprise";
  status: "active" | "suspended";
  /** Tenant branding — configurable from tenant settings or Platform */
  branding?: {
    /** Hex color for accent (buttons, links, charts). Defaults to #3b6cff */
    accentColor?: string;
    /** Data URL or Cloudinary URL (E5) for tenant logo */
    logoUrl?: string;
    /** Logo display name override */
    displayName?: string;
  };
  createdAt: ISODate;
}

export interface Membership {
  id: ID;
  userId: ID;
  tenantId: ID;
  role: Exclude<AppRole, "platform_admin">;
  active: boolean;
  createdAt: ISODate;
}

// ============================================================================
// Verticals (Rubros)
// ============================================================================

export interface BusinessVertical {
  id: ID;
  slug: string;
  name: string;
  description?: string;
  icon: string; // lucide icon name
  color: string; // accent token
  createdAt: ISODate;
}

export interface EquipmentType {
  id: ID;
  verticalId: ID;
  slug: string;
  name: string;
  icon: string;
  description?: string;
  createdAt: ISODate;
}

export interface TenantVertical {
  id: ID;
  tenantId: ID;
  verticalId: ID;
  createdAt: ISODate;
}

// ============================================================================
// Form Schema (used inside Templates)
// ============================================================================

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "time"
  | "datetime"
  | "select"
  | "multiselect"
  | "checkbox"
  | "radio"
  | "switch"
  | "email"
  | "phone"
  | "url"
  | "file"
  | "image"
  | "signature"
  | "location"
  | "status"
  | "checklist"
  | "table"
  | "computed";

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormField {
  id: ID; // stable identifier (never reused)
  key: string; // machine name (camelCase)
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  defaultValue?: unknown;
  options?: FormFieldOption[]; // for select / radio / checklist
  width?: "full" | "half" | "third"; // layout hint
}

export interface FormSection {
  id: ID;
  title: string;
  description?: string;
  fields: FormField[];
}

export interface FormSchema {
  sections: FormSection[];
}

// ============================================================================
// Templates (Equipment & Reports)
// ============================================================================

export type TemplateScope = "global" | "tenant";

export interface EquipmentTemplate {
  id: ID;
  equipmentTypeId: ID;
  name: string;
  description?: string;
  scope: TemplateScope;
  tenantId?: ID; // only when scope = tenant
  isActive: boolean;
  currentVersionId: ID;
  createdAt: ISODate;
}

export interface EquipmentTemplateVersion {
  id: ID;
  templateId: ID;
  versionNumber: number;
  schema: FormSchema;
  publishedAt: ISODate;
  publishedBy: ID;
}

export type ReportKind =
  | "install"
  | "preventive"
  | "corrective"
  | "inspection"
  | "diagnostic"
  | "replace"
  | "decommission";

export interface ReportTemplate {
  id: ID;
  equipmentTypeId: ID;
  reportKind: ReportKind;
  name: string;
  description?: string;
  scope: TemplateScope;
  tenantId?: ID;
  isActive: boolean;
  currentVersionId: ID;
  createdAt: ISODate;
}

export interface ReportTemplateVersion {
  id: ID;
  templateId: ID;
  versionNumber: number;
  schema: FormSchema;
  publishedAt: ISODate;
  publishedBy: ID;
}

// ============================================================================
// Operational Data (per tenant)
// ============================================================================

export type ClientType =
  | "building"
  | "supermarket"
  | "school"
  | "individual"
  | "company"
  | "shop"
  | "institution"
  | "industry"
  | "store"
  | "complex"
  | "office";

export type ClientStatus = "active" | "inactive" | "onboarding";

export interface Client {
  id: ID;
  tenantId: ID;
  name: string;
  legalName?: string;
  type: ClientType;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  taxId?: string;
  status: ClientStatus;
  ownerId?: ID;
  lastActivityAt?: ISODate;
  createdAt: ISODate;
}

export type LocationStatus = "operational" | "attention" | "critical";

export interface Location {
  id: ID;
  tenantId: ID;
  clientId: ID;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  /** Latitude in decimal degrees (WGS84) */
  latitude?: number;
  /** Longitude in decimal degrees (WGS84) */
  longitude?: number;
  status: LocationStatus;
  notes?: string;
  createdAt: ISODate;
}

export type EquipmentStatus =
  | "operational"
  | "pending"
  | "in_maintenance"
  | "observed"
  | "critical"
  | "out_of_service";

export interface Equipment {
  id: ID;
  tenantId: ID;
  clientId: ID;
  locationId?: ID;
  equipmentTypeId: ID;
  templateId: ID;
  templateVersionId: ID; // snapshot reference
  internalCode: string;
  name: string;
  qrCode: string;
  status: EquipmentStatus;
  data: Record<string, unknown>; // answers to template fields, keyed by field.id
  installedAt?: ISODate;
  lastMaintenanceAt?: ISODate;
  nextMaintenanceAt?: ISODate;
  notes?: string;
  /** True if created via on-site QR scan and missing detail fields. Lists show a "Pendiente" badge. */
  isDraft?: boolean;
  /** Who created this equipment (user id) — useful for QR-scan audit trail. */
  createdBy?: ID;
  /** If this equipment was created from scanning a QR tag, this is the tag id. */
  createdFromQrTagId?: ID;
  createdAt: ISODate;
}

export type ReportStatus =
  | "draft"
  | "completed"
  | "pending"
  | "observed"
  | "critical";

export interface ChecklistItem {
  id: string;
  label: string;
  /** SI / NO / N/A / null (not answered) */
  value: "si" | "no" | "na" | null;
  /** Optional numeric measurement (e.g. pressure, voltage) */
  measurement?: string;
  unit?: string;
  /** User added this item on the fly */
  custom?: boolean;
}

export interface ReportChecklist {
  /** "instalacion" | "mantenimiento" */
  section: string;
  enabled: boolean;
  items: ChecklistItem[];
}

export interface MaintenanceReport {
  id: ID;
  tenantId: ID;
  code: string;
  clientId: ID;
  locationId?: ID;
  equipmentId: ID;
  reportTemplateId: ID;
  reportTemplateVersionId: ID;
  reportKind: ReportKind;
  status: ReportStatus;
  date: ISODate;
  durationMinutes?: number;
  technicianId: ID;
  data: Record<string, unknown>;
  observations?: string;
  /** Structured checklists (instalación + mantenimiento) */
  checklists?: ReportChecklist[];
  /** Data URL or Cloudinary URL (E5) */
  signatureDataUrl?: string;
  signatureUrl?: string;
  /** Photos */
  photos?: ReportPhoto[];
  scheduledMaintenanceId?: ID;
  createdAt: ISODate;
}

export interface Attachment {
  id: ID;
  tenantId: ID;
  ownerType: "report" | "equipment" | "client";
  ownerId: ID;
  type: "image" | "document" | "signature";
  name: string;
  url: string;
  size?: number;
  createdAt: ISODate;
}

// ============================================================================
// Activity Log
// ============================================================================

export type ActivityType =
  | "tenant_created"
  | "tenant_updated"
  | "vertical_created"
  | "template_published"
  | "client_created"
  | "location_created"
  | "equipment_created"
  | "equipment_updated"
  | "report_created"
  | "report_completed"
  | "status_changed"
  | "user_invited";

export interface ActivityEntry {
  id: ID;
  tenantId?: ID; // null when platform-wide
  scope: "platform" | "tenant";
  actorId: ID;
  type: ActivityType;
  targetType: string;
  targetId: ID;
  description: string;
  createdAt: ISODate;
}

// ============================================================================
// Plans & Subscriptions (Billing)
// ============================================================================

export interface PlanLimits {
  users: number | null; // null = unlimited
  equipment: number | null;
  clients: number | null;
  reportsPerMonth: number | null;
  qrTagsPerMonth: number | null;
}

export interface PlanFeatures {
  formBuilder: boolean;
  apiAccess: boolean;
  customDomain: boolean;
  prioritySupport: boolean;
  qrPrintBatches: boolean;
  advancedAnalytics: boolean;
}

export interface Plan {
  id: ID;
  slug: "starter" | "pro" | "business" | "enterprise";
  name: string;
  description?: string;
  monthlyPriceUsd: number;
  yearlyPriceUsd: number; // typically 10x monthly (2 months free)
  limits: PlanLimits;
  features: PlanFeatures;
  isPublic: boolean; // false = enterprise/custom
  sortOrder: number;
  createdAt: ISODate;
}

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "suspended";

export type ReadOnlyReason =
  | "limit_exceeded"
  | "payment_failed"
  | "canceled"
  | null;

export interface Subscription {
  id: ID;
  tenantId: ID;
  planId: ID;
  status: SubscriptionStatus;
  billingCycle: "monthly" | "yearly";
  currentPeriodStart: ISODate;
  currentPeriodEnd: ISODate;
  cancelAtPeriodEnd: boolean;
  trialEndsAt?: ISODate;
  externalProvider: "mercadopago" | "manual";
  externalSubscriptionId?: string;
  // Read-only mode (for limit enforcement / payment failures)
  isReadOnly: boolean;
  readOnlyReason: ReadOnlyReason;
  readOnlySince?: ISODate;
  // Scheduled changes
  pendingDowngradeToPlanId?: ID;
  pendingDowngradeAt?: ISODate;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export type UsageMetric =
  | "users"
  | "equipment"
  | "clients"
  | "reports"
  | "qr_tags";

export interface UsageCounter {
  id: ID;
  tenantId: ID;
  metric: UsageMetric;
  period: string; // "lifetime" | "month_2026_04"
  value: number;
  graceUntil?: ISODate; // recently-deactivated still count until this date
  updatedAt: ISODate;
}

export type PaymentEventType =
  | "payment.created"
  | "payment.approved"
  | "payment.rejected"
  | "subscription.created"
  | "subscription.updated"
  | "subscription.canceled";

export interface PaymentEvent {
  id: ID;
  tenantId: ID;
  subscriptionId?: ID;
  externalEventId: string; // for idempotency
  type: PaymentEventType;
  amount?: number;
  currency?: string;
  payload?: Record<string, unknown>;
  processedAt?: ISODate;
  createdAt: ISODate;
}

// ============================================================================
// QR Tags & Print Batches
// ============================================================================

export type QrBatchScope = "platform" | "tenant";
export type QrBatchStatus = "draft" | "printing" | "printed" | "distributed";

export interface QrBatch {
  id: ID;
  scope: QrBatchScope;
  tenantId?: ID; // null when scope=platform
  name: string;
  size: number; // total tags in this batch
  format: "avery_5160" | "avery_5167" | "custom";
  prefix?: string; // e.g. "MTL"
  // Optional pre-typing of equipment type
  equipmentTypeId?: ID;
  status: QrBatchStatus;
  createdBy: ID;
  createdAt: ISODate;
  printedAt?: ISODate;
}

export type QrTagStatus = "free" | "claimed" | "bound" | "voided";

export interface QrTag {
  id: ID;
  tenantId: ID; // tags are always tenant-scoped from the moment of generation
  batchId: ID;
  code: string; // human-readable, e.g. "MTL-9F4K2P"
  url: string; // full QR-encoded URL
  status: QrTagStatus;
  // Optional pre-typing inherited from batch
  equipmentTypeId?: ID;
  // Lifecycle
  claimedAt?: ISODate;
  claimedBy?: ID;
  // Final binding (when status = bound)
  equipmentId?: ID;
  boundAt?: ISODate;
  // Void
  voidedAt?: ISODate;
  voidedReason?: string;
  createdAt: ISODate;
}

// ============================================================================
// Scheduled Maintenance
// ============================================================================

export type MaintenanceFrequency =
  | "weekly"
  | "biweekly"
  | "monthly"
  | "bimonthly"
  | "quarterly"
  | "semiannual"
  | "annual";

export type ScheduledMaintenanceStatus =
  | "scheduled"
  | "overdue"
  | "completed"
  | "cancelled";

export interface ScheduledMaintenance {
  id: ID;
  tenantId: ID;
  equipmentId: ID;
  clientId: ID;
  locationId?: ID;
  title: string;
  description?: string;
  frequency: MaintenanceFrequency;
  nextDueAt: ISODate;
  lastCompletedAt?: ISODate;
  assignedTo?: ID; // technicianId
  status: ScheduledMaintenanceStatus;
  createdAt: ISODate;
}

// Extended report with photo + signature support
export interface ReportPhoto {
  id: ID;
  /** In E5 this will be a Cloudinary URL. For now, a data: URL or placeholder. */
  url: string;
  caption?: string;
  takenAt: ISODate;
}
