import type { User, Tenant, Membership } from "@/lib/types";

export const mockUsers: User[] = [
  {
    id: "user_admin",
    email: "andres@maintly.app",
    name: "Andrés Artemov",
    isPlatformAdmin: true,
    createdAt: "2026-01-10T10:00:00Z",
  },
  {
    id: "user_norte_admin",
    email: "carla@seguridadnorte.uy",
    name: "Carla Méndez",
    isPlatformAdmin: false,
    createdAt: "2026-02-04T10:00:00Z",
  },
  {
    id: "user_norte_tech",
    email: "diego@seguridadnorte.uy",
    name: "Diego Pereira",
    isPlatformAdmin: false,
    createdAt: "2026-02-06T10:00:00Z",
  },
  {
    id: "user_clima_admin",
    email: "ines@climavision.uy",
    name: "Inés Rodríguez",
    isPlatformAdmin: false,
    createdAt: "2026-02-15T10:00:00Z",
  },
  {
    id: "user_clima_tech",
    email: "matias@climavision.uy",
    name: "Matías Suárez",
    isPlatformAdmin: false,
    createdAt: "2026-02-20T10:00:00Z",
  },
  {
    id: "user_lifts_admin",
    email: "rodrigo@elevatec.uy",
    name: "Rodrigo Castro",
    isPlatformAdmin: false,
    createdAt: "2026-03-02T10:00:00Z",
  },
];

export const mockTenants: Tenant[] = [
  {
    id: "tenant_norte",
    slug: "seguridad-norte",
    name: "Seguridad Norte",
    legalName: "Seguridad Norte S.A.",
    plan: "pro",
    status: "active",
    createdAt: "2026-02-04T10:00:00Z",
  },
  {
    id: "tenant_clima",
    slug: "clima-vision",
    name: "ClimaVisión",
    legalName: "ClimaVisión Ltda.",
    plan: "starter",
    status: "active",
    createdAt: "2026-02-15T10:00:00Z",
  },
  {
    id: "tenant_lifts",
    slug: "elevatec",
    name: "Elevatec",
    legalName: "Elevatec Ascensores S.R.L.",
    plan: "enterprise",
    status: "active",
    createdAt: "2026-03-02T10:00:00Z",
  },
];

export const mockMemberships: Membership[] = [
  {
    id: "mem_1",
    userId: "user_norte_admin",
    tenantId: "tenant_norte",
    role: "tenant_admin",
    active: true,
    createdAt: "2026-02-04T10:00:00Z",
  },
  {
    id: "mem_2",
    userId: "user_norte_tech",
    tenantId: "tenant_norte",
    role: "technician",
    active: true,
    createdAt: "2026-02-06T10:00:00Z",
  },
  {
    id: "mem_3",
    userId: "user_clima_admin",
    tenantId: "tenant_clima",
    role: "tenant_admin",
    active: true,
    createdAt: "2026-02-15T10:00:00Z",
  },
  {
    id: "mem_4",
    userId: "user_clima_tech",
    tenantId: "tenant_clima",
    role: "technician",
    active: true,
    createdAt: "2026-02-20T10:00:00Z",
  },
  {
    id: "mem_5",
    userId: "user_lifts_admin",
    tenantId: "tenant_lifts",
    role: "tenant_admin",
    active: true,
    createdAt: "2026-03-02T10:00:00Z",
  },
];
