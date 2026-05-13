import type {
  BusinessVertical,
  EquipmentType,
  TenantVertical,
} from "@/lib/types";

export const mockVerticals: BusinessVertical[] = [
  {
    id: "vert_security",
    slug: "seguridad-y-vigilancia",
    name: "Seguridad y vigilancia",
    description:
      "Cámaras, DVR/NVR, sensores de movimiento, alarmas y control de acceso.",
    icon: "ShieldCheck",
    color: "accent",
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "vert_hvac",
    slug: "refrigeracion-climatizacion",
    name: "Refrigeración y climatización",
    description:
      "Aire acondicionado, splits, cassettes, chillers, cámaras frigoríficas y frío industrial.",
    icon: "Wind",
    color: "accent",
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "vert_lifts",
    slug: "ascensores",
    name: "Ascensores",
    description:
      "Cabinas, motores, controladores, cuadros de maniobra y sistemas de seguridad.",
    icon: "MoveVertical",
    color: "accent",
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "vert_electric",
    slug: "instalaciones-electricas",
    name: "Instalaciones eléctricas",
    description: "Tableros, UPS, generadores, iluminación y puesta a tierra.",
    icon: "Zap",
    color: "accent",
    createdAt: "2026-01-15T10:00:00Z",
  },
];

export const mockEquipmentTypes: EquipmentType[] = [
  // Security
  {
    id: "etype_camera",
    verticalId: "vert_security",
    slug: "camara-video",
    name: "Cámara de video",
    icon: "Video",
    createdAt: "2026-01-16T10:00:00Z",
  },
  {
    id: "etype_dvr",
    verticalId: "vert_security",
    slug: "dvr",
    name: "DVR",
    icon: "HardDrive",
    createdAt: "2026-01-16T10:00:00Z",
  },
  {
    id: "etype_nvr",
    verticalId: "vert_security",
    slug: "nvr",
    name: "NVR",
    icon: "Server",
    createdAt: "2026-01-16T10:00:00Z",
  },
  {
    id: "etype_motion",
    verticalId: "vert_security",
    slug: "sensor-movimiento",
    name: "Sensor de movimiento",
    icon: "Radar",
    createdAt: "2026-01-16T10:00:00Z",
  },
  {
    id: "etype_alarm",
    verticalId: "vert_security",
    slug: "central-alarma",
    name: "Central de alarma",
    icon: "BellRing",
    createdAt: "2026-01-16T10:00:00Z",
  },
  // HVAC
  {
    id: "etype_split",
    verticalId: "vert_hvac",
    slug: "split",
    name: "Split",
    icon: "Snowflake",
    createdAt: "2026-01-16T10:00:00Z",
  },
  {
    id: "etype_cassette",
    verticalId: "vert_hvac",
    slug: "cassette",
    name: "Cassette",
    icon: "Square",
    createdAt: "2026-01-16T10:00:00Z",
  },
  {
    id: "etype_rooftop",
    verticalId: "vert_hvac",
    slug: "rooftop",
    name: "Rooftop",
    icon: "Building",
    createdAt: "2026-01-16T10:00:00Z",
  },
  {
    id: "etype_chiller",
    verticalId: "vert_hvac",
    slug: "chiller",
    name: "Chiller",
    icon: "Droplets",
    createdAt: "2026-01-16T10:00:00Z",
  },
  // Lifts
  {
    id: "etype_cabin",
    verticalId: "vert_lifts",
    slug: "cabina",
    name: "Cabina",
    icon: "Box",
    createdAt: "2026-01-16T10:00:00Z",
  },
  {
    id: "etype_motor",
    verticalId: "vert_lifts",
    slug: "motor-traccion",
    name: "Motor de tracción",
    icon: "Cog",
    createdAt: "2026-01-16T10:00:00Z",
  },
  {
    id: "etype_panel",
    verticalId: "vert_lifts",
    slug: "cuadro-maniobra",
    name: "Cuadro de maniobra",
    icon: "Cpu",
    createdAt: "2026-01-16T10:00:00Z",
  },
  // Electric
  {
    id: "etype_board",
    verticalId: "vert_electric",
    slug: "tablero",
    name: "Tablero eléctrico",
    icon: "LayoutGrid",
    createdAt: "2026-01-16T10:00:00Z",
  },
  {
    id: "etype_ups",
    verticalId: "vert_electric",
    slug: "ups",
    name: "UPS",
    icon: "BatteryCharging",
    createdAt: "2026-01-16T10:00:00Z",
  },
  {
    id: "etype_genset",
    verticalId: "vert_electric",
    slug: "generador",
    name: "Generador",
    icon: "Power",
    createdAt: "2026-01-16T10:00:00Z",
  },
  {
    id: "etype_coldroom",
    verticalId: "vert_hvac",
    slug: "camara-frigorifica",
    name: "Cámara frigorífica",
    icon: "Thermometer",
    createdAt: "2026-01-17T10:00:00Z",
  },
  {
    id: "etype_condensing",
    verticalId: "vert_hvac",
    slug: "unidad-condensadora",
    name: "Unidad condensadora",
    icon: "Wind",
    createdAt: "2026-01-17T10:00:00Z",
  },
];

// Tenants ↔ Verticals
export const mockTenantVerticals: TenantVertical[] = [
  {
    id: "tv_1",
    tenantId: "tenant_norte",
    verticalId: "vert_security",
    createdAt: "2026-02-04T10:00:00Z",
  },
  {
    id: "tv_2",
    tenantId: "tenant_clima",
    verticalId: "vert_hvac",
    createdAt: "2026-02-15T10:00:00Z",
  },
  {
    id: "tv_3",
    tenantId: "tenant_lifts",
    verticalId: "vert_lifts",
    createdAt: "2026-03-02T10:00:00Z",
  },
  // Elevatec also does electric for legal/regulation work
  {
    id: "tv_4",
    tenantId: "tenant_lifts",
    verticalId: "vert_electric",
    createdAt: "2026-03-04T10:00:00Z",
  },
];
