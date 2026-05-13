"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Plus,
  Trash2,
  Settings2,
  Eye,
  ChevronRight,
  Check,
  Type,
  Hash,
  Calendar,
  List,
  AlignLeft,
  Loader2,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { saveTemplateVersion } from "@/lib/actions/templates";
import { cn } from "@/lib/utils/cn";
import type {
  EquipmentTemplate,
  EquipmentTemplateVersion,
  EquipmentType,
  FormField,
  FormSchema,
  FieldType,
} from "@/lib/types";

// ============================================================================
// Types
// ============================================================================

interface Props {
  templates: EquipmentTemplate[];
  versions: EquipmentTemplateVersion[];
  equipmentTypes: EquipmentType[];
}

type EditorField = FormField & { _tempId: string };

const FIELD_TYPES: { value: FieldType; label: string; Icon: any }[] = [
  { value: "text", label: "Texto corto", Icon: Type },
  { value: "textarea", label: "Texto largo", Icon: AlignLeft },
  { value: "number", label: "Número", Icon: Hash },
  { value: "date", label: "Fecha", Icon: Calendar },
  { value: "select", label: "Selección", Icon: List },
];

function newField(): EditorField {
  const id = `field_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  return {
    _tempId: id,
    id,
    key: "",
    type: "text",
    label: "",
    placeholder: "",
    helpText: "",
    required: false,
    width: "half",
    options: [],
  };
}

function schemaToEditorFields(schema: FormSchema): EditorField[] {
  return (schema.sections[0]?.fields ?? []).map((f) => ({
    ...f,
    _tempId: f.id,
    options: f.options ?? [],
  }));
}

function editorFieldsToSchema(fields: EditorField[]): FormSchema {
  return {
    sections: [
      {
        id: "main",
        title: "Datos técnicos",
        fields: fields
          .filter((f) => f.label.trim())
          .map(({ _tempId, ...f }) => ({
            ...f,
            key: f.key || f.label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""),
            options: f.options?.length ? f.options : undefined,
          })),
      },
    ],
  };
}

// ============================================================================
// Main component
// ============================================================================

export function FormBuilder({ templates, versions, equipmentTypes }: Props) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates[0]?.id ?? "",
  );
  const [fields, setFields] = useState<EditorField[]>(() => {
    const tpl = templates[0];
    if (!tpl) return [];
    const ver = versions.find((v) => v.id === tpl.currentVersionId);
    return ver ? schemaToEditorFields(ver.schema) : [];
  });
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [view, setView] = useState<"editor" | "preview">("editor");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Load template into editor
  function selectTemplate(templateId: string) {
    if (dirty && !confirm("¿Descartás los cambios sin guardar?")) return;
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) return;
    const ver = versions.find((v) => v.id === tpl.currentVersionId);
    setFields(ver ? schemaToEditorFields(ver.schema) : []);
    setSelectedTemplateId(templateId);
    setSelectedFieldId(null);
    setDirty(false);
    setSavedAt(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setFields((prev) => {
      const oldIdx = prev.findIndex((f) => f._tempId === active.id);
      const newIdx = prev.findIndex((f) => f._tempId === over.id);
      return arrayMove(prev, oldIdx, newIdx);
    });
    setDirty(true);
  }

  function addField() {
    const f = newField();
    setFields((prev) => [...prev, f]);
    setSelectedFieldId(f._tempId);
    setDirty(true);
  }

  function removeField(id: string) {
    setFields((prev) => prev.filter((f) => f._tempId !== id));
    if (selectedFieldId === id) setSelectedFieldId(null);
    setDirty(true);
  }

  function updateField(id: string, patch: Partial<EditorField>) {
    setFields((prev) =>
      prev.map((f) => (f._tempId === id ? { ...f, ...patch } : f)),
    );
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    const schema = editorFieldsToSchema(fields);
    const res = await saveTemplateVersion(selectedTemplateId, schema);
    setSaving(false);
    if (res.ok) {
      setSavedAt(Date.now());
      setDirty(false);
    }
  }

  const selectedField = fields.find((f) => f._tempId === selectedFieldId) ?? null;
  const currentTemplate = templates.find((t) => t.id === selectedTemplateId);
  const currentType = equipmentTypes.find((t) => t.id === currentTemplate?.equipmentTypeId);

  return (
    <div className="flex gap-0 h-[calc(100vh-140px)] min-h-[600px]">
      {/* ── Left sidebar: template list ── */}
      <div className="w-[220px] shrink-0 border-r border-[var(--border-subtle)] flex flex-col bg-[var(--bg-canvas)] rounded-l-[var(--radius-card)]">
        <div className="px-4 py-4 border-b border-[var(--border-subtle)]">
          <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Tipos de equipo
          </p>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {templates.map((tpl) => {
            const eqType = equipmentTypes.find((t) => t.id === tpl.equipmentTypeId);
            const ver = versions.find((v) => v.id === tpl.currentVersionId);
            const fieldCount = ver?.schema.sections[0]?.fields.length ?? 0;
            return (
              <button
                key={tpl.id}
                onClick={() => selectTemplate(tpl.id)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-xl text-sm",
                  selectedTemplateId === tpl.id
                    ? "bg-[var(--bg-hover)] text-[var(--text-primary)] font-medium"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
                )}
              >
                <p className="truncate leading-tight">{eqType?.name ?? tpl.name}</p>
                <p className="text-2xs text-[var(--text-tertiary)] mt-0.5 tabular">
                  {fieldCount} {fieldCount === 1 ? "campo" : "campos"}
                </p>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Center: field canvas ── */}
      <div className="flex-1 min-w-0 flex flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-page)]">
        {/* Canvas header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {currentType?.name ?? "—"}
            </p>
            <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
              {fields.filter((f) => f.label.trim()).length} campos · v{
                versions.filter((v) => v.templateId === selectedTemplateId).length
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[var(--bg-hover)] rounded-full p-0.5">
              <button
                onClick={() => setView("editor")}
                className={cn(
                  "px-3 h-7 rounded-full text-xs font-medium flex items-center gap-1.5",
                  view === "editor"
                    ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
                    : "text-[var(--text-secondary)]",
                )}
              >
                <Settings2 className="h-3 w-3" /> Editor
              </button>
              <button
                onClick={() => setView("preview")}
                className={cn(
                  "px-3 h-7 rounded-full text-xs font-medium flex items-center gap-1.5",
                  view === "preview"
                    ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
                    : "text-[var(--text-secondary)]",
                )}
              >
                <Eye className="h-3 w-3" /> Preview
              </button>
            </div>
            <Button
              onClick={handleSave}
              size="sm"
              pill
              loading={saving}
              disabled={!dirty}
              leftIcon={savedAt && !dirty ? <Check className="h-3 w-3" /> : undefined}
            >
              {savedAt && !dirty ? "Guardado" : "Guardar versión"}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {view === "editor" ? (
            <EditorCanvas
              fields={fields}
              selectedFieldId={selectedFieldId}
              onSelect={setSelectedFieldId}
              onRemove={removeField}
              onDragEnd={handleDragEnd}
              onAdd={addField}
              sensors={sensors}
            />
          ) : (
            <PreviewPane fields={fields} typeName={currentType?.name ?? ""} />
          )}
        </div>
      </div>

      {/* ── Right: field properties panel ── */}
      <div className="w-[280px] shrink-0 bg-[var(--bg-canvas)] rounded-r-[var(--radius-card)] flex flex-col">
        <div className="px-4 py-4 border-b border-[var(--border-subtle)]">
          <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            {selectedField ? "Propiedades del campo" : "Seleccioná un campo"}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {selectedField ? (
            <FieldProperties
              field={selectedField}
              onChange={(patch) => updateField(selectedField._tempId, patch)}
            />
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-2xs text-[var(--text-tertiary)]">
                Hacé click en un campo para editar sus propiedades, o agregá uno nuevo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Editor Canvas — sortable field list
// ============================================================================

function EditorCanvas({
  fields,
  selectedFieldId,
  onSelect,
  onRemove,
  onDragEnd,
  onAdd,
  sensors,
}: {
  fields: EditorField[];
  selectedFieldId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onDragEnd: (e: DragEndEvent) => void;
  onAdd: () => void;
  sensors: ReturnType<typeof useSensors>;
}) {
  return (
    <div className="space-y-3 max-w-xl">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={fields.map((f) => f._tempId)}
          strategy={verticalListSortingStrategy}
        >
          {fields.map((field) => (
            <SortableField
              key={field._tempId}
              field={field}
              isSelected={selectedFieldId === field._tempId}
              onSelect={() => onSelect(field._tempId)}
              onRemove={() => onRemove(field._tempId)}
            />
          ))}
        </SortableContext>
      </DndContext>

      {fields.length === 0 && (
        <div className="py-16 text-center border-2 border-dashed border-[var(--border-default)] rounded-2xl">
          <p className="text-sm text-[var(--text-tertiary)] mb-3">
            Esta plantilla no tiene campos todavía
          </p>
          <Button onClick={onAdd} size="sm" variant="secondary" pill leftIcon={<Plus className="h-3.5 w-3.5" />}>
            Agregar primer campo
          </Button>
        </div>
      )}

      <button
        onClick={onAdd}
        className="w-full flex items-center justify-center gap-2 h-10 rounded-xl border-2 border-dashed border-[var(--border-default)] text-[var(--text-tertiary)] hover:border-[var(--accent-500)] hover:text-[var(--accent-400)] hover:bg-[var(--info-bg)] text-sm"
      >
        <Plus className="h-3.5 w-3.5" />
        Agregar campo
      </button>
    </div>
  );
}

// ============================================================================
// Sortable field row
// ============================================================================

function SortableField({
  field,
  isSelected,
  onSelect,
  onRemove,
}: {
  field: EditorField;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field._tempId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const TypeIcon = FIELD_TYPES.find((t) => t.value === field.type)?.Icon ?? Type;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer group",
        isSelected
          ? "border-[var(--accent-500)] bg-[var(--info-bg)]"
          : "border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--border-default)]",
      )}
      onClick={onSelect}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] cursor-grab active:cursor-grabbing shrink-0"
        onClick={(e) => e.stopPropagation()}
        aria-label="Arrastrar"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Type icon */}
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--bg-hover)] text-[var(--text-secondary)]">
        <TypeIcon className="h-3.5 w-3.5" />
      </span>

      {/* Label */}
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm truncate", field.label ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)] italic")}>
          {field.label || "Sin nombre"}
        </p>
        <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
          {FIELD_TYPES.find((t) => t.value === field.type)?.label ?? field.type}
          {field.width === "full" ? " · ancho completo" : ""}
          {field.required ? " · obligatorio" : ""}
        </p>
      </div>

      {/* Delete */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="shrink-0 grid h-7 w-7 place-items-center rounded-lg text-[var(--text-tertiary)] hover:text-[var(--danger-fg)] hover:bg-[var(--danger-bg)] opacity-0 group-hover:opacity-100"
        aria-label="Eliminar campo"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ============================================================================
// Field Properties Panel
// ============================================================================

function FieldProperties({
  field,
  onChange,
}: {
  field: EditorField;
  onChange: (patch: Partial<EditorField>) => void;
}) {
  const hasOptions = field.type === "select";

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
          Etiqueta *
        </label>
        <Input
          value={field.label}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder="Ej: Número de serie"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
          Tipo de campo
        </label>
        <Select
          value={field.type}
          onChange={(e) => onChange({ type: e.target.value as FieldType, options: [] })}
        >
          {FIELD_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </Select>
      </div>

      <div>
        <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
          Placeholder
        </label>
        <Input
          value={field.placeholder ?? ""}
          onChange={(e) => onChange({ placeholder: e.target.value })}
          placeholder="Texto de ayuda en el campo…"
        />
      </div>

      <div>
        <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
          Texto de ayuda
        </label>
        <Input
          value={field.helpText ?? ""}
          onChange={(e) => onChange({ helpText: e.target.value })}
          placeholder="Explicación adicional…"
        />
      </div>

      <div>
        <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
          Ancho
        </label>
        <Select
          value={field.width ?? "half"}
          onChange={(e) => onChange({ width: e.target.value as "full" | "half" | "third" })}
        >
          <option value="half">Mitad (2 columnas)</option>
          <option value="full">Completo (1 columna)</option>
          <option value="third">Tercio (3 columnas)</option>
        </Select>
      </div>

      <label className="flex items-center gap-2.5 cursor-pointer">
        <div
          onClick={() => onChange({ required: !field.required })}
          className={cn(
            "h-5 w-9 rounded-full relative transition-colors",
            field.required ? "bg-[var(--accent-500)]" : "bg-[var(--bg-hover)]",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
              field.required ? "translate-x-4" : "translate-x-0.5",
            )}
          />
        </div>
        <span className="text-sm text-[var(--text-primary)]">Campo obligatorio</span>
      </label>

      {hasOptions && (
        <div>
          <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
            Opciones (una por línea)
          </label>
          <textarea
            rows={5}
            value={(field.options ?? []).map((o) => o.label).join("\n")}
            onChange={(e) => {
              const opts = e.target.value
                .split("\n")
                .filter((l) => l.trim())
                .map((l) => ({ value: l.trim(), label: l.trim() }));
              onChange({ options: opts });
            }}
            className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-500)] focus:ring-2 focus:ring-[var(--accent-500)]/20 px-3.5 py-2.5 text-sm resize-none"
            placeholder={"Opción 1\nOpción 2\nOpción 3"}
          />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Preview Pane — renders the form as it would appear to a technician
// ============================================================================

function PreviewPane({ fields, typeName }: { fields: EditorField[]; typeName: string }) {
  const validFields = fields.filter((f) => f.label.trim());

  if (validFields.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-[var(--text-tertiary)]">
        Sin campos para previsualizar
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-hover)]">
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            Detalles de {typeName}
          </p>
          <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
            Así se ve el formulario para el técnico
          </p>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4">
          {validFields.map((field) => {
            const colSpan =
              field.width === "full"
                ? "col-span-2"
                : field.width === "third"
                  ? ""
                  : "";
            return (
              <div key={field._tempId} className={colSpan}>
                <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                  {field.label}
                  {field.required && (
                    <span className="text-[var(--danger-fg)] ml-1">*</span>
                  )}
                </label>
                <PreviewField field={field} />
                {field.helpText && (
                  <p className="mt-1 text-2xs text-[var(--text-tertiary)]">{field.helpText}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PreviewField({ field }: { field: EditorField }) {
  const base =
    "w-full h-9 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-full px-3.5 text-sm text-[var(--text-tertiary)]";
  if (field.type === "select" && field.options?.length) {
    return (
      <select disabled className={cn(base, "cursor-not-allowed opacity-60")}>
        <option>{field.placeholder || "Seleccioná…"}</option>
        {field.options.map((o) => (
          <option key={o.value}>{o.label}</option>
        ))}
      </select>
    );
  }
  if (field.type === "textarea") {
    return (
      <textarea
        disabled
        rows={3}
        placeholder={field.placeholder || ""}
        className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl px-3.5 py-2 text-sm text-[var(--text-tertiary)] cursor-not-allowed opacity-60 resize-none"
      />
    );
  }
  return (
    <input
      disabled
      type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
      placeholder={field.placeholder || ""}
      className={cn(base, "cursor-not-allowed opacity-60")}
    />
  );
}
