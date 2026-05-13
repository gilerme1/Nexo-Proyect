import type { ReportChecklist, ChecklistItem } from "@/lib/types";

// ============================================================================
// Factory helpers
// ============================================================================

let _id = 0;
function cid(): string {
  return `ci_${++_id}`;
}

function item(label: string, unit?: string): ChecklistItem {
  return { id: cid(), label, value: null, unit };
}

function measurement(label: string, unit: string): ChecklistItem {
  return { id: cid(), label, value: null, measurement: "", unit };
}

// ============================================================================
// AC / Split / Cassette / Rooftop — based on the real Andrés Prunell form
// ============================================================================

export const AC_INSTALACION_ITEMS: ChecklistItem[] = [
  item("Remplazo de sensores"),
  item("Medición de capacitor"),
  item("Reemplazo de capacitor"),
  measurement("Volts de alimentación", "V"),
  measurement("Amperajes compresor", "A"),
  item("Ajustes y limpieza de conexiones"),
  item("Remplazo bobina de válvula solenoide"),
  item("Remplazo de válvula solenoide"),
  item("Remplazo de contactor"),
  item("Remplazo de presostato"),
  item("Remplazo de compresor"),
];

export const AC_MANTENIMIENTO_ITEMS: ChecklistItem[] = [
  item("Limpieza charola condensados"),
  item("Limpieza filtros evaporadora"),
  item("Limpieza de evaporador"),
  item("Limpieza de condensadora"),
  item("Revisión de fugas en sistema"),
  item("Modificación y/o corrección de tuberías"),
  item("Carga de gas"),
  item("Lavado del sistema con R141B"),
  item("Limpieza de drenaje"),
  measurement("Presión baja", "LBS/PUL²"),
  measurement("Presión alta", "LBS/PUL²"),
  item("Cambio tarjeta electrónica"),
];

// ============================================================================
// Security camera
// ============================================================================

export const CAMERA_INSTALACION_ITEMS: ChecklistItem[] = [
  item("Montaje y fijación de cámara"),
  item("Tendido y conexión de cable"),
  item("Configuración de IP"),
  item("Ajuste de ángulo de visión"),
  item("Prueba de imagen en DVR/NVR"),
  item("Verificación de grabación"),
  item("Etiquetado de canal"),
  item("Prolijo de cables y canaletas"),
];

export const CAMERA_MANTENIMIENTO_ITEMS: ChecklistItem[] = [
  item("Limpieza de lente"),
  item("Verificación de imagen"),
  item("Verificación de grabación"),
  item("Revisión de conexiones"),
  item("Verificación de ángulo"),
  item("Test de visión nocturna / IR"),
  item("Revisión de estado físico"),
  measurement("Voltaje alimentación", "V"),
];

// ============================================================================
// Elevator / Cabina
// ============================================================================

export const ELEVATOR_INSTALACION_ITEMS: ChecklistItem[] = [
  item("Verificación de nivel de cabina"),
  item("Ajuste de puertas"),
  item("Prueba de botonera interior"),
  item("Prueba de señalización de piso"),
  item("Verificación de límites de recorrido"),
  item("Prueba de freno"),
  item("Verificación de guías y deslizamiento"),
  item("Prueba de carga"),
];

export const ELEVATOR_MANTENIMIENTO_ITEMS: ChecklistItem[] = [
  item("Lubricación de guías"),
  item("Lubricación de cables de tracción"),
  item("Revisión de frenos"),
  item("Revisión de contactos de puertas"),
  item("Revisión de botonera"),
  item("Verificación de iluminación de cabina"),
  item("Revisión cuarto de máquinas"),
  item("Verificación de dispositivos de seguridad"),
  item("Prueba de paracaídas"),
  measurement("Voltaje motor", "V"),
];

// ============================================================================
// Cold room / Cámara frigorífica
// ============================================================================

export const COLDROOM_INSTALACION_ITEMS: ChecklistItem[] = [
  item("Verificación de sellado de cámara"),
  item("Instalación de evaporador"),
  item("Instalación de condensadora"),
  item("Carga de gas refrigerante"),
  item("Prueba de estanqueidad"),
  item("Verificación de termóstato"),
  measurement("Temperatura de cámara", "°C"),
];

export const COLDROOM_MANTENIMIENTO_ITEMS: ChecklistItem[] = [
  item("Limpieza de evaporador"),
  item("Limpieza de condensadora"),
  item("Revisión de fugas"),
  item("Verificación de puerta y sellos"),
  item("Limpieza de drenaje"),
  measurement("Presión baja", "LBS/PUL²"),
  measurement("Presión alta", "LBS/PUL²"),
  measurement("Temperatura actual", "°C"),
  measurement("Temperatura set point", "°C"),
];

// ============================================================================
// Electrical / Tablero / UPS
// ============================================================================

export const ELECTRIC_INSTALACION_ITEMS: ChecklistItem[] = [
  item("Verificación de puesta a tierra"),
  item("Verificación de diferencial"),
  item("Prueba de disyuntores"),
  item("Prolijo y etiquetado de circuitos"),
  item("Verificación de capacidad de tablero"),
  measurement("Tensión L1-L2", "V"),
  measurement("Tensión L1-N", "V"),
];

export const ELECTRIC_MANTENIMIENTO_ITEMS: ChecklistItem[] = [
  item("Limpieza de tablero"),
  item("Revisión de conexiones y bornes"),
  item("Revisión de disyuntores"),
  item("Prueba de diferencial"),
  item("Termografía (si aplica)"),
  measurement("Tensión de línea", "V"),
  measurement("Corriente línea principal", "A"),
];

// ============================================================================
// Generic fallback
// ============================================================================

export const GENERIC_INSTALACION_ITEMS: ChecklistItem[] = [
  item("Verificación de instalación"),
  item("Prueba de funcionamiento"),
  item("Entrega de documentación al cliente"),
];

export const GENERIC_MANTENIMIENTO_ITEMS: ChecklistItem[] = [
  item("Limpieza general"),
  item("Revisión de conexiones"),
  item("Prueba de funcionamiento"),
  item("Observaciones registradas"),
];

// ============================================================================
// Resolver: get checklist template for equipment type slug
// ============================================================================

export interface ChecklistTemplate {
  instalacion: ChecklistItem[];
  mantenimiento: ChecklistItem[];
}

export function getChecklistTemplate(equipmentTypeSlug: string): ChecklistTemplate {
  if (["split", "cassette", "rooftop", "chiller", "unidad-condensadora"].includes(equipmentTypeSlug)) {
    return {
      instalacion: deepClone(AC_INSTALACION_ITEMS),
      mantenimiento: deepClone(AC_MANTENIMIENTO_ITEMS),
    };
  }
  if (["camara-video", "dvr", "nvr", "sensor-movimiento", "central-alarma"].includes(equipmentTypeSlug)) {
    return {
      instalacion: deepClone(CAMERA_INSTALACION_ITEMS),
      mantenimiento: deepClone(CAMERA_MANTENIMIENTO_ITEMS),
    };
  }
  if (["cabina", "motor-traccion", "cuadro-maniobra"].includes(equipmentTypeSlug)) {
    return {
      instalacion: deepClone(ELEVATOR_INSTALACION_ITEMS),
      mantenimiento: deepClone(ELEVATOR_MANTENIMIENTO_ITEMS),
    };
  }
  if (["camara-frigorifica"].includes(equipmentTypeSlug)) {
    return {
      instalacion: deepClone(COLDROOM_INSTALACION_ITEMS),
      mantenimiento: deepClone(COLDROOM_MANTENIMIENTO_ITEMS),
    };
  }
  if (["tablero", "ups", "generador"].includes(equipmentTypeSlug)) {
    return {
      instalacion: deepClone(ELECTRIC_INSTALACION_ITEMS),
      mantenimiento: deepClone(ELECTRIC_MANTENIMIENTO_ITEMS),
    };
  }
  return {
    instalacion: deepClone(GENERIC_INSTALACION_ITEMS),
    mantenimiento: deepClone(GENERIC_MANTENIMIENTO_ITEMS),
  };
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/** Build initial checklists for a new report */
export function buildInitialChecklists(
  equipmentTypeSlug: string,
): ReportChecklist[] {
  const tpl = getChecklistTemplate(equipmentTypeSlug);
  return [
    { section: "instalacion", enabled: false, items: tpl.instalacion },
    { section: "mantenimiento", enabled: true, items: tpl.mantenimiento },
  ];
}
