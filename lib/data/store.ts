// ============================================================================
// In-memory mutable store
// ============================================================================
//
// Holds all data that the user creates/edits during a dev session.
// On server restart, mock data resets to seeds.
//
// When we plug Supabase (delivery 5), every function in this module
// is replaced by a DB query — the rest of the app doesn't change.

import { mockTenants, mockUsers, mockMemberships } from "@/lib/data/seeds/users";
import {
  mockVerticals,
  mockEquipmentTypes,
  mockTenantVerticals,
} from "@/lib/data/seeds/verticals";
import { mockPlans } from "@/lib/data/seeds/plans";
import {
  mockSubscriptions,
  mockUsageCounters,
} from "@/lib/data/seeds/subscriptions";
import { mockClients, mockEquipment, mockReports } from "@/lib/data/seeds/operations";
import { mockLocations } from "@/lib/data/seeds/locations";
import { mockActivity } from "@/lib/data/seeds/activity";
import { mockQrBatches, mockQrTags } from "@/lib/data/seeds/qr";
import { mockScheduledMaintenances } from "@/lib/data/seeds/maintenances";
import { mockEquipmentTemplates, mockEquipmentTemplateVersions } from "@/lib/data/seeds/templates";
import type {
  Tenant, User, Membership, BusinessVertical, EquipmentType,
  TenantVertical, Plan, Subscription, UsageCounter, Client,
  Equipment, MaintenanceReport, ActivityEntry, Location,
  QrBatch, QrTag, ScheduledMaintenance,
  EquipmentTemplate, EquipmentTemplateVersion,
} from "@/lib/types";

// Singleton mutable store. globalThis trick keeps it alive across HMR reloads
// so your edits don't disappear during dev.
declare global {
  // eslint-disable-next-line no-var
  var __maintly_store__: Store | undefined;
}

export interface BrandConfig {
  name: string;
  shortName: string;
  tagline: string;
  monogram: string;
  supportEmail: string;
  websiteUrl: string;
}

interface Store {
  brand: BrandConfig;
  tenants: Tenant[];
  users: User[];
  memberships: Membership[];
  verticals: BusinessVertical[];
  equipmentTypes: EquipmentType[];
  tenantVerticals: TenantVertical[];
  plans: Plan[];
  subscriptions: Subscription[];
  usageCounters: UsageCounter[];
  clients: Client[];
  locations: Location[];
  equipment: Equipment[];
  reports: MaintenanceReport[];
  activity: ActivityEntry[];
  qrBatches: QrBatch[];
  qrTags: QrTag[];
  scheduledMaintenances: ScheduledMaintenance[];
  equipmentTemplates: EquipmentTemplate[];
  equipmentTemplateVersions: EquipmentTemplateVersion[];
}

function createStore(): Store {
  return {
    brand: {
      name: "Maintly",
      shortName: "Maintly",
      tagline: "Plataforma de gestión de mantenimiento",
      monogram: "M",
      supportEmail: "soporte@maintly.app",
      websiteUrl: "https://maintly.app",
    },
    tenants: [...mockTenants],
    users: [...mockUsers],
    memberships: [...mockMemberships],
    verticals: [...mockVerticals],
    equipmentTypes: [...mockEquipmentTypes],
    tenantVerticals: [...mockTenantVerticals],
    plans: [...mockPlans],
    subscriptions: [...mockSubscriptions],
    usageCounters: [...mockUsageCounters],
    clients: [...mockClients],
    locations: [...mockLocations],
    equipment: [...mockEquipment],
    reports: [...mockReports],
    activity: [...mockActivity],
    qrBatches: [...mockQrBatches],
    qrTags: [...mockQrTags],
    scheduledMaintenances: [...mockScheduledMaintenances],
    equipmentTemplates: [...mockEquipmentTemplates],
    equipmentTemplateVersions: [...mockEquipmentTemplateVersions],
  };
}

export const store: Store =
  globalThis.__maintly_store__ ?? (globalThis.__maintly_store__ = createStore());

// Utility: generate a stable-looking id
let idCounter = 1000;
export function newId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}${idCounter}`;
}

// Slugify
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
