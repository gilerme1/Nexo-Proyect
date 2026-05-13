import type { EquipmentTemplate, EquipmentTemplateVersion, FormSchema } from "@/lib/types";

// ============================================================================
// Helper to build a simple single-section schema from field definitions
// ============================================================================
function schema(fields: {
  id: string;
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "textarea";
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  options?: string[];
  width?: "full" | "half" | "third";
}[]): FormSchema {
  return {
    sections: [
      {
        id: "main",
        title: "Datos técnicos",
        fields: fields.map((f) => ({
          id: f.id,
          key: f.key,
          type: f.type,
          label: f.label,
          placeholder: f.placeholder,
          helpText: f.helpText,
          required: f.required,
          width: f.width ?? "half",
          options: f.options?.map((o) => ({ value: o, label: o })),
        })),
      },
    ],
  };
}

// ============================================================================
// Templates (one per equipment type slug)
// ============================================================================

const TEMPLATES: { typeId: string; name: string; schema: FormSchema }[] = [
  {
    typeId: "etype_camera",
    name: "Cámara de video",
    schema: schema([
      { id: "brand", key: "brand", label: "Marca", type: "text", placeholder: "Hikvision, Dahua, Axis…" },
      { id: "model", key: "model", label: "Modelo", type: "text", placeholder: "DS-2CD2143G2-IS" },
      { id: "serialNumber", key: "serialNumber", label: "Número de serie", type: "text" },
      { id: "ipAddress", key: "ipAddress", label: "Dirección IP", type: "text", placeholder: "192.168.1.45" },
      { id: "macAddress", key: "macAddress", label: "MAC", type: "text", placeholder: "00:11:22:33:44:55" },
      {
        id: "resolution", key: "resolution", label: "Resolución", type: "select",
        options: ["2 MP (1080p)", "4 MP", "5 MP", "8 MP (4K)"],
      },
      {
        id: "viewType", key: "viewType", label: "Tipo de cámara", type: "select",
        options: ["Bullet", "Domo", "PTZ", "Fisheye", "Box"],
      },
      { id: "physicalLocation", key: "physicalLocation", label: "Ubicación física", type: "text", placeholder: "Entrada principal, pared norte", width: "full" },
      { id: "installedAt", key: "installedAt", label: "Fecha de instalación", type: "date" },
    ]),
  },
  {
    typeId: "etype_dvr",
    name: "DVR",
    schema: schema([
      { id: "brand", key: "brand", label: "Marca", type: "text" },
      { id: "model", key: "model", label: "Modelo", type: "text" },
      { id: "serialNumber", key: "serialNumber", label: "Número de serie", type: "text" },
      { id: "channels", key: "channels", label: "Canales", type: "number" },
      { id: "diskCapacity", key: "diskCapacity", label: "Capacidad disco", type: "text", placeholder: "2 TB" },
      { id: "physicalLocation", key: "physicalLocation", label: "Ubicación física", type: "text", width: "full" },
      { id: "installedAt", key: "installedAt", label: "Fecha de instalación", type: "date" },
    ]),
  },
  {
    typeId: "etype_nvr",
    name: "NVR",
    schema: schema([
      { id: "brand", key: "brand", label: "Marca", type: "text" },
      { id: "model", key: "model", label: "Modelo", type: "text" },
      { id: "serialNumber", key: "serialNumber", label: "Número de serie", type: "text" },
      { id: "channels", key: "channels", label: "Canales soportados", type: "number" },
      { id: "diskCapacity", key: "diskCapacity", label: "Capacidad disco", type: "text", placeholder: "4 TB" },
      { id: "ipAddress", key: "ipAddress", label: "Dirección IP", type: "text" },
      { id: "physicalLocation", key: "physicalLocation", label: "Ubicación física", type: "text", width: "full" },
      { id: "installedAt", key: "installedAt", label: "Fecha de instalación", type: "date" },
    ]),
  },
  {
    typeId: "etype_motion",
    name: "Sensor de movimiento",
    schema: schema([
      { id: "brand", key: "brand", label: "Marca", type: "text" },
      { id: "model", key: "model", label: "Modelo", type: "text" },
      { id: "sensorType", key: "sensorType", label: "Tipo", type: "select", options: ["PIR", "Microondas", "Dual", "Cortina"] },
      { id: "physicalLocation", key: "physicalLocation", label: "Ubicación", type: "text", width: "full" },
      { id: "installedAt", key: "installedAt", label: "Fecha de instalación", type: "date" },
    ]),
  },
  {
    typeId: "etype_alarm",
    name: "Central de alarma",
    schema: schema([
      { id: "brand", key: "brand", label: "Marca", type: "text" },
      { id: "model", key: "model", label: "Modelo", type: "text" },
      { id: "serialNumber", key: "serialNumber", label: "Número de serie", type: "text" },
      { id: "zones", key: "zones", label: "Zonas", type: "number" },
      { id: "monitoring", key: "monitoring", label: "Empresa de monitoreo", type: "text" },
      { id: "installedAt", key: "installedAt", label: "Fecha de instalación", type: "date" },
    ]),
  },
  {
    typeId: "etype_split",
    name: "Aire acondicionado split",
    schema: schema([
      { id: "brand", key: "brand", label: "Marca", type: "text", placeholder: "Daikin, Samsung, LG…" },
      { id: "model", key: "model", label: "Modelo", type: "text" },
      { id: "serialNumber", key: "serialNumber", label: "Número de serie", type: "text" },
      { id: "btus", key: "btus", label: "Capacidad (BTU/h)", type: "number", placeholder: "12000" },
      { id: "refrigerant", key: "refrigerant", label: "Refrigerante", type: "select", options: ["R-410A", "R-32", "R-22 (legacy)", "R-134a"] },
      { id: "acType", key: "acType", label: "Tipo", type: "select", options: ["On-Off", "Inverter", "Multisplit"] },
      { id: "indoorLocation", key: "indoorLocation", label: "Unidad interior", type: "text", placeholder: "Sala de reuniones" },
      { id: "outdoorLocation", key: "outdoorLocation", label: "Unidad exterior", type: "text", placeholder: "Terraza" },
      { id: "installedAt", key: "installedAt", label: "Fecha de instalación", type: "date" },
    ]),
  },
  {
    typeId: "etype_cassette",
    name: "AC Cassette",
    schema: schema([
      { id: "brand", key: "brand", label: "Marca", type: "text" },
      { id: "model", key: "model", label: "Modelo", type: "text" },
      { id: "serialNumber", key: "serialNumber", label: "Número de serie", type: "text" },
      { id: "btus", key: "btus", label: "Capacidad (BTU/h)", type: "number" },
      { id: "tonnage", key: "tonnage", label: "Toneladas (TR)", type: "number" },
      { id: "refrigerant", key: "refrigerant", label: "Refrigerante", type: "select", options: ["R-410A", "R-32", "R-22 (legacy)", "R-407C"] },
      { id: "physicalLocation", key: "physicalLocation", label: "Ubicación", type: "text", width: "full" },
      { id: "installedAt", key: "installedAt", label: "Fecha de instalación", type: "date" },
    ]),
  },
  {
    typeId: "etype_rooftop",
    name: "AC Rooftop",
    schema: schema([
      { id: "brand", key: "brand", label: "Marca", type: "text" },
      { id: "model", key: "model", label: "Modelo", type: "text" },
      { id: "serialNumber", key: "serialNumber", label: "Número de serie", type: "text" },
      { id: "tonnage", key: "tonnage", label: "Toneladas (TR)", type: "number" },
      { id: "refrigerant", key: "refrigerant", label: "Refrigerante", type: "select", options: ["R-410A", "R-32", "R-22 (legacy)", "R-407C"] },
      { id: "physicalLocation", key: "physicalLocation", label: "Ubicación", type: "text", width: "full" },
      { id: "installedAt", key: "installedAt", label: "Fecha de instalación", type: "date" },
    ]),
  },
  {
    typeId: "etype_chiller",
    name: "Chiller",
    schema: schema([
      { id: "brand", key: "brand", label: "Marca", type: "text" },
      { id: "model", key: "model", label: "Modelo", type: "text" },
      { id: "serialNumber", key: "serialNumber", label: "Número de serie", type: "text" },
      { id: "tonnage", key: "tonnage", label: "Capacidad (TR)", type: "number" },
      { id: "refrigerant", key: "refrigerant", label: "Refrigerante", type: "select", options: ["R-134a", "R-410A", "R-32", "R-407C", "R-1234ze"] },
      { id: "compressorType", key: "compressorType", label: "Tipo de compresor", type: "select", options: ["Scroll", "Tornillo", "Centrífugo", "Recíproco"] },
      { id: "physicalLocation", key: "physicalLocation", label: "Ubicación", type: "text", width: "full" },
      { id: "installedAt", key: "installedAt", label: "Fecha de instalación", type: "date" },
    ]),
  },
  {
    typeId: "etype_cabin",
    name: "Cabina de ascensor",
    schema: schema([
      { id: "brand", key: "brand", label: "Marca", type: "text", placeholder: "Otis, KONE, Schindler…" },
      { id: "model", key: "model", label: "Modelo", type: "text" },
      { id: "serialNumber", key: "serialNumber", label: "Número de serie", type: "text" },
      { id: "stops", key: "stops", label: "Paradas", type: "number" },
      { id: "capacityKg", key: "capacityKg", label: "Capacidad (kg)", type: "number" },
      { id: "capacityPersons", key: "capacityPersons", label: "Capacidad (personas)", type: "number" },
      { id: "elevatorType", key: "elevatorType", label: "Tipo", type: "select", options: ["Eléctrico tracción", "Hidráulico", "MRL (sin sala de máquinas)"] },
      { id: "manufactureYear", key: "manufactureYear", label: "Año de fabricación", type: "number" },
      { id: "installedAt", key: "installedAt", label: "Fecha de instalación", type: "date" },
      { id: "lastInspection", key: "lastInspection", label: "Última inspección oficial", type: "date" },
    ]),
  },
  {
    typeId: "etype_motor",
    name: "Motor de tracción",
    schema: schema([
      { id: "brand", key: "brand", label: "Marca", type: "text" },
      { id: "model", key: "model", label: "Modelo", type: "text" },
      { id: "serialNumber", key: "serialNumber", label: "Número de serie", type: "text" },
      { id: "powerKw", key: "powerKw", label: "Potencia (kW)", type: "number" },
      { id: "speedMs", key: "speedMs", label: "Velocidad (m/s)", type: "number" },
      { id: "installedAt", key: "installedAt", label: "Fecha de instalación", type: "date" },
    ]),
  },
  {
    typeId: "etype_panel",
    name: "Cuadro de maniobra",
    schema: schema([
      { id: "brand", key: "brand", label: "Marca", type: "text" },
      { id: "model", key: "model", label: "Modelo", type: "text" },
      { id: "panelType", key: "panelType", label: "Tipo", type: "select", options: ["Electromecánico", "Microprocesado", "Variador VVVF"] },
      { id: "installedAt", key: "installedAt", label: "Fecha de instalación", type: "date" },
    ]),
  },
  {
    typeId: "etype_board",
    name: "Tablero eléctrico",
    schema: schema([
      { id: "brand", key: "brand", label: "Marca", type: "text" },
      { id: "voltage", key: "voltage", label: "Tensión", type: "select", options: ["220V monofásico", "380V trifásico", "Otro"] },
      { id: "amperage", key: "amperage", label: "Amperaje principal (A)", type: "number" },
      { id: "physicalLocation", key: "physicalLocation", label: "Ubicación", type: "text", width: "full" },
      { id: "installedAt", key: "installedAt", label: "Fecha de instalación", type: "date" },
    ]),
  },
  {
    typeId: "etype_ups",
    name: "UPS",
    schema: schema([
      { id: "brand", key: "brand", label: "Marca", type: "text", placeholder: "APC, Eaton, CDP…" },
      { id: "model", key: "model", label: "Modelo", type: "text" },
      { id: "serialNumber", key: "serialNumber", label: "Número de serie", type: "text" },
      { id: "powerVa", key: "powerVa", label: "Potencia (VA)", type: "number" },
      { id: "autonomy", key: "autonomy", label: "Autonomía estimada", type: "text", placeholder: "10 min a plena carga" },
      { id: "physicalLocation", key: "physicalLocation", label: "Ubicación", type: "text", width: "full" },
      { id: "installedAt", key: "installedAt", label: "Fecha de instalación", type: "date" },
    ]),
  },
  {
    typeId: "etype_genset",
    name: "Generador",
    schema: schema([
      { id: "brand", key: "brand", label: "Marca", type: "text" },
      { id: "model", key: "model", label: "Modelo", type: "text" },
      { id: "serialNumber", key: "serialNumber", label: "Número de serie", type: "text" },
      { id: "powerKva", key: "powerKva", label: "Potencia (kVA)", type: "number" },
      { id: "fuel", key: "fuel", label: "Combustible", type: "select", options: ["Diesel", "Gas natural", "Nafta"] },
      { id: "physicalLocation", key: "physicalLocation", label: "Ubicación", type: "text", width: "full" },
      { id: "installedAt", key: "installedAt", label: "Fecha de instalación", type: "date" },
    ]),
  },
  {
    typeId: "etype_coldroom",
    name: "Cámara frigorífica",
    schema: schema([
      { id: "brand", key: "brand", label: "Marca", type: "text", placeholder: "Friolair, Zanotti, Berg…" },
      { id: "model", key: "model", label: "Modelo", type: "text" },
      { id: "serialNumber", key: "serialNumber", label: "Número de serie", type: "text" },
      { id: "tempMin", key: "tempMin", label: "Temperatura mínima (°C)", type: "number" },
      { id: "tempMax", key: "tempMax", label: "Temperatura máxima (°C)", type: "number" },
      { id: "volume", key: "volume", label: "Volumen (m³)", type: "number" },
      { id: "refrigerant", key: "refrigerant", label: "Refrigerante", type: "select", options: ["R-404A", "R-448A", "R-134a", "R-410A", "CO₂"] },
      { id: "cameraType", key: "cameraType", label: "Tipo", type: "select", options: ["Positiva (+2°C a +8°C)", "Negativa (-18°C a -25°C)", "Conservación (+10°C a +15°C)"] },
      { id: "physicalLocation", key: "physicalLocation", label: "Ubicación", type: "text", width: "full" },
      { id: "installedAt", key: "installedAt", label: "Fecha de instalación", type: "date" },
    ]),
  },
  {
    typeId: "etype_condensing",
    name: "Unidad condensadora",
    schema: schema([
      { id: "brand", key: "brand", label: "Marca", type: "text" },
      { id: "model", key: "model", label: "Modelo", type: "text" },
      { id: "serialNumber", key: "serialNumber", label: "Número de serie", type: "text" },
      { id: "powerKw", key: "powerKw", label: "Potencia (kW)", type: "number" },
      { id: "refrigerant", key: "refrigerant", label: "Refrigerante", type: "select", options: ["R-404A", "R-448A", "R-134a", "R-410A"] },
      { id: "physicalLocation", key: "physicalLocation", label: "Ubicación", type: "text", width: "full" },
      { id: "installedAt", key: "installedAt", label: "Fecha de instalación", type: "date" },
    ]),
  },
];

// ============================================================================
// Build EquipmentTemplate + EquipmentTemplateVersion records
// ============================================================================

export const mockEquipmentTemplates: EquipmentTemplate[] = TEMPLATES.map((t) => ({
  id: `tpl_${t.typeId}`,
  equipmentTypeId: t.typeId,
  name: t.name,
  scope: "global" as const,
  isActive: true,
  currentVersionId: `tplv_${t.typeId}_1`,
  createdAt: "2026-01-01T00:00:00Z",
}));

export const mockEquipmentTemplateVersions: EquipmentTemplateVersion[] = TEMPLATES.map((t) => ({
  id: `tplv_${t.typeId}_1`,
  templateId: `tpl_${t.typeId}`,
  versionNumber: 1,
  schema: t.schema,
  publishedAt: "2026-01-01T00:00:00Z",
  publishedBy: "user_admin",
}));
