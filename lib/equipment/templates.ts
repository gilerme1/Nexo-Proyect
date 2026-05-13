// ============================================================================
// Hardcoded equipment templates
// ============================================================================
// Each equipment type has a set of fields that are shown when creating /
// editing equipment. When the Form Builder ships (Entrega 3), these become
// configurable per-tenant. For now, they're fixed.
//
// All these fields are OPTIONAL — equipment can be created with just a name
// and location (the on-site QR scan flow). Detail fields are filled later.

export type EquipmentFieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "select";

export interface EquipmentField {
  id: string;
  label: string;
  type: EquipmentFieldType;
  placeholder?: string;
  options?: string[]; // for select
  unit?: string; // suffix shown next to value
  hint?: string;
}

export interface EquipmentTemplateDef {
  /** Equipment type slug — matches store.equipmentTypes[].slug */
  typeSlug: string;
  /** Human-readable label */
  label: string;
  fields: EquipmentField[];
}

export const HARDCODED_EQUIPMENT_TEMPLATES: EquipmentTemplateDef[] = [
  // Security cameras
  {
    typeSlug: "camara-video",
    label: "Cámara de video",
    fields: [
      { id: "brand", label: "Marca", type: "text", placeholder: "Hikvision, Dahua, Axis…" },
      { id: "model", label: "Modelo", type: "text", placeholder: "DS-2CD2143G2-IS" },
      { id: "serialNumber", label: "Número de serie", type: "text" },
      { id: "ipAddress", label: "Dirección IP", type: "text", placeholder: "192.168.1.45" },
      { id: "macAddress", label: "MAC", type: "text", placeholder: "00:11:22:33:44:55" },
      {
        id: "resolution",
        label: "Resolución",
        type: "select",
        options: ["2 MP (1080p)", "4 MP", "5 MP", "8 MP (4K)"],
      },
      {
        id: "viewType",
        label: "Tipo de cámara",
        type: "select",
        options: ["Bullet", "Domo", "PTZ", "Fisheye", "Box"],
      },
      { id: "physicalLocation", label: "Ubicación física", type: "text", placeholder: "Entrada principal, pared norte" },
      { id: "installedAt", label: "Fecha de instalación", type: "date" },
    ],
  },

  // DVR (digital video recorder, for analog cameras)
  {
    typeSlug: "dvr",
    label: "DVR",
    fields: [
      { id: "brand", label: "Marca", type: "text" },
      { id: "model", label: "Modelo", type: "text" },
      { id: "serialNumber", label: "Número de serie", type: "text" },
      { id: "channels", label: "Cantidad de canales", type: "number" },
      { id: "diskCapacity", label: "Capacidad disco", type: "text", placeholder: "2 TB" },
      { id: "physicalLocation", label: "Ubicación física", type: "text" },
      { id: "installedAt", label: "Fecha de instalación", type: "date" },
    ],
  },

  // NVR (network video recorder)
  {
    typeSlug: "nvr",
    label: "NVR",
    fields: [
      { id: "brand", label: "Marca", type: "text" },
      { id: "model", label: "Modelo", type: "text" },
      { id: "serialNumber", label: "Número de serie", type: "text" },
      { id: "channels", label: "Canales soportados", type: "number" },
      { id: "diskCapacity", label: "Capacidad disco", type: "text", placeholder: "4 TB" },
      { id: "ipAddress", label: "Dirección IP", type: "text" },
      { id: "physicalLocation", label: "Ubicación física", type: "text" },
      { id: "installedAt", label: "Fecha de instalación", type: "date" },
    ],
  },

  // Motion sensor
  {
    typeSlug: "sensor-movimiento",
    label: "Sensor de movimiento",
    fields: [
      { id: "brand", label: "Marca", type: "text" },
      { id: "model", label: "Modelo", type: "text" },
      { id: "type", label: "Tipo", type: "select", options: ["PIR", "Microondas", "Dual", "Cortina"] },
      { id: "physicalLocation", label: "Ubicación", type: "text" },
      { id: "installedAt", label: "Fecha de instalación", type: "date" },
    ],
  },

  // Alarm panel
  {
    typeSlug: "central-alarma",
    label: "Central de alarma",
    fields: [
      { id: "brand", label: "Marca", type: "text" },
      { id: "model", label: "Modelo", type: "text" },
      { id: "serialNumber", label: "Número de serie", type: "text" },
      { id: "zones", label: "Cantidad de zonas", type: "number" },
      { id: "monitoring", label: "Empresa de monitoreo", type: "text" },
      { id: "installedAt", label: "Fecha de instalación", type: "date" },
    ],
  },

  // Air conditioner — split
  {
    typeSlug: "split",
    label: "Aire acondicionado split",
    fields: [
      { id: "brand", label: "Marca", type: "text", placeholder: "Daikin, Samsung, LG…" },
      { id: "model", label: "Modelo", type: "text" },
      { id: "serialNumber", label: "Número de serie", type: "text" },
      { id: "btus", label: "Capacidad", type: "number", unit: "BTU/h", placeholder: "12000" },
      {
        id: "refrigerant",
        label: "Refrigerante",
        type: "select",
        options: ["R-410A", "R-32", "R-22 (legacy)", "R-134a"],
      },
      {
        id: "type",
        label: "Tipo",
        type: "select",
        options: ["On-Off", "Inverter", "Multisplit"],
      },
      { id: "indoorLocation", label: "Ubicación interior", type: "text", placeholder: "Oficina sala de reuniones" },
      { id: "outdoorLocation", label: "Ubicación condensadora", type: "text", placeholder: "Terraza posterior" },
      { id: "installedAt", label: "Fecha de instalación", type: "date" },
    ],
  },

  // Cassette AC
  {
    typeSlug: "cassette",
    label: "AC Cassette",
    fields: [
      { id: "brand", label: "Marca", type: "text" },
      { id: "model", label: "Modelo", type: "text" },
      { id: "serialNumber", label: "Número de serie", type: "text" },
      { id: "btus", label: "Capacidad", type: "number", unit: "BTU/h" },
      { id: "tonnage", label: "Toneladas", type: "number", unit: "TR" },
      {
        id: "refrigerant",
        label: "Refrigerante",
        type: "select",
        options: ["R-410A", "R-32", "R-22 (legacy)", "R-407C"],
      },
      { id: "physicalLocation", label: "Ubicación", type: "text" },
      { id: "installedAt", label: "Fecha de instalación", type: "date" },
    ],
  },

  // Rooftop AC
  {
    typeSlug: "rooftop",
    label: "AC Rooftop",
    fields: [
      { id: "brand", label: "Marca", type: "text" },
      { id: "model", label: "Modelo", type: "text" },
      { id: "serialNumber", label: "Número de serie", type: "text" },
      { id: "tonnage", label: "Toneladas", type: "number", unit: "TR" },
      {
        id: "refrigerant",
        label: "Refrigerante",
        type: "select",
        options: ["R-410A", "R-32", "R-22 (legacy)", "R-407C"],
      },
      { id: "physicalLocation", label: "Ubicación", type: "text" },
      { id: "installedAt", label: "Fecha de instalación", type: "date" },
    ],
  },

  // Chiller
  {
    typeSlug: "chiller",
    label: "Chiller",
    fields: [
      { id: "brand", label: "Marca", type: "text" },
      { id: "model", label: "Modelo", type: "text" },
      { id: "serialNumber", label: "Número de serie", type: "text" },
      { id: "tonnage", label: "Capacidad", type: "number", unit: "TR" },
      {
        id: "refrigerant",
        label: "Refrigerante",
        type: "select",
        options: ["R-134a", "R-410A", "R-32", "R-407C", "R-1234ze"],
      },
      { id: "compressorType", label: "Tipo de compresor", type: "select", options: ["Scroll", "Tornillo", "Centrífugo", "Recíproco"] },
      { id: "physicalLocation", label: "Ubicación", type: "text" },
      { id: "installedAt", label: "Fecha de instalación", type: "date" },
    ],
  },

  // Elevator cabin
  {
    typeSlug: "cabina",
    label: "Cabina de ascensor",
    fields: [
      { id: "brand", label: "Marca", type: "text", placeholder: "Otis, KONE, Schindler…" },
      { id: "model", label: "Modelo", type: "text" },
      { id: "serialNumber", label: "Número de serie", type: "text" },
      { id: "stops", label: "Cantidad de paradas", type: "number" },
      { id: "capacityKg", label: "Capacidad", type: "number", unit: "kg" },
      { id: "capacityPersons", label: "Capacidad", type: "number", unit: "personas" },
      {
        id: "type",
        label: "Tipo",
        type: "select",
        options: ["Eléctrico tracción", "Hidráulico", "MRL (sin sala de máquinas)"],
      },
      { id: "manufactureYear", label: "Año de fabricación", type: "number" },
      { id: "installedAt", label: "Fecha de instalación", type: "date" },
      { id: "lastInspection", label: "Última inspección oficial", type: "date" },
    ],
  },

  // Traction motor
  {
    typeSlug: "motor-traccion",
    label: "Motor de tracción",
    fields: [
      { id: "brand", label: "Marca", type: "text" },
      { id: "model", label: "Modelo", type: "text" },
      { id: "serialNumber", label: "Número de serie", type: "text" },
      { id: "powerKw", label: "Potencia", type: "number", unit: "kW" },
      { id: "speedMs", label: "Velocidad", type: "number", unit: "m/s" },
      { id: "installedAt", label: "Fecha de instalación", type: "date" },
    ],
  },

  // Maneuver panel
  {
    typeSlug: "cuadro-maniobra",
    label: "Cuadro de maniobra",
    fields: [
      { id: "brand", label: "Marca", type: "text" },
      { id: "model", label: "Modelo", type: "text" },
      { id: "type", label: "Tipo", type: "select", options: ["Electromecánico", "Microprocesado", "Variador VVVF"] },
      { id: "installedAt", label: "Fecha de instalación", type: "date" },
    ],
  },

  // Electrical board
  {
    typeSlug: "tablero",
    label: "Tablero eléctrico",
    fields: [
      { id: "brand", label: "Marca", type: "text" },
      { id: "voltage", label: "Tensión", type: "select", options: ["220V monofásico", "380V trifásico", "Otro"] },
      { id: "amperage", label: "Amperaje principal", type: "number", unit: "A" },
      { id: "physicalLocation", label: "Ubicación", type: "text" },
      { id: "installedAt", label: "Fecha de instalación", type: "date" },
    ],
  },

  // UPS
  {
    typeSlug: "ups",
    label: "UPS",
    fields: [
      { id: "brand", label: "Marca", type: "text", placeholder: "APC, Eaton, CDP…" },
      { id: "model", label: "Modelo", type: "text" },
      { id: "serialNumber", label: "Número de serie", type: "text" },
      { id: "powerVa", label: "Potencia", type: "number", unit: "VA" },
      { id: "autonomy", label: "Autonomía estimada", type: "text", placeholder: "10 min a plena carga" },
      { id: "physicalLocation", label: "Ubicación", type: "text" },
      { id: "installedAt", label: "Fecha de instalación", type: "date" },
    ],
  },

  // Generator
  {
    typeSlug: "generador",
    label: "Generador",
    fields: [
      { id: "brand", label: "Marca", type: "text" },
      { id: "model", label: "Modelo", type: "text" },
      { id: "serialNumber", label: "Número de serie", type: "text" },
      { id: "powerKva", label: "Potencia", type: "number", unit: "kVA" },
      { id: "fuel", label: "Combustible", type: "select", options: ["Diesel", "Gas natural", "Nafta"] },
      { id: "physicalLocation", label: "Ubicación", type: "text" },
      { id: "installedAt", label: "Fecha de instalación", type: "date" },
    ],
  },
];

export function getTemplateForTypeSlug(slug: string): EquipmentTemplateDef | undefined {
  return HARDCODED_EQUIPMENT_TEMPLATES.find((t) => t.typeSlug === slug);
}

/** Required fields for on-site quick creation (post-QR-scan) */
export const QUICK_CREATE_REQUIRED = ["name", "clientId", "locationId", "equipmentTypeId"] as const;
