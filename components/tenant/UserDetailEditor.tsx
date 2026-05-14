"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Check, FileText, ShieldCheck, Wrench, Eye, EyeOff } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { updateUserProfile } from "@/lib/actions/members";
import { formatDate, formatRelative } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

interface ReportRow {
  id: string;
  code: string;
  date: string;
  status: string;
  equipmentName: string;
}

interface Props {
  user: { id: string; name: string; email: string; createdAt: string };
  membership: { id: string; role: string; tenantId: string };
  isCurrentUser: boolean;
  reportCount: number;
  recentReports: ReportRow[];
}

const ROLE_LABELS: Record<string, string> = {
  tenant_admin: "Admin",
  technician:   "Técnico",
  viewer:       "Viewer",
};

const REPORT_STATUS: Record<string, { label: string; tone: "success" | "warning" | "neutral" }> = {
  completed: { label: "Completado", tone: "success" },
  observed:  { label: "Observado",  tone: "warning" },
  pending:   { label: "Pendiente",  tone: "warning" },
  draft:     { label: "Borrador",   tone: "neutral" },
};

export function UserDetailEditor({ user, membership, isCurrentUser, reportCount, recentReports }: Props) {
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(formData: FormData) {
    formData.set("userId", user.id);
    formData.set("tenantId", membership.tenantId);
    setError(null);
    startTransition(async () => {
      const res = await updateUserProfile(formData);
      if (res.ok) setSavedAt(Date.now());
      else setError(res.error ?? "Error al guardar.");
    });
  }

  return (
    <div className="space-y-6 pb-6">
      <Link
        href="/app/users"
        className="inline-flex items-center gap-1.5 text-2xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
      >
        <ArrowLeft className="h-3 w-3" />
        Volver a usuarios
      </Link>

      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <Avatar name={user.name} size="lg" />
            <span>{user.name}</span>
          </span>
        }
        description={
          <span className="flex items-center gap-2">
            <span className="text-[var(--text-tertiary)]">{user.email}</span>
            <Badge tone="neutral">{ROLE_LABELS[membership.role] ?? membership.role}</Badge>
            {isCurrentUser && <Badge tone="neutral">Vos</Badge>}
          </span>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardBody className="py-4">
            <p className="text-2xs text-[var(--text-tertiary)]">Reportes creados</p>
            <p className="text-2xl font-bold text-[var(--text-primary)] tabular mt-1">{reportCount}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-4">
            <p className="text-2xs text-[var(--text-tertiary)]">Rol</p>
            <p className="text-sm font-semibold text-[var(--text-primary)] mt-1 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent-400)]" />
              {ROLE_LABELS[membership.role] ?? membership.role}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-4">
            <p className="text-2xs text-[var(--text-tertiary)]">Miembro desde</p>
            <p className="text-sm font-semibold text-[var(--text-primary)] mt-1">{formatDate(user.createdAt)}</p>
          </CardBody>
        </Card>
      </div>

      {/* Edit form */}
      <form action={handleSubmit}>
        <Card>
          <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Datos del usuario</h3>
          </div>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">Nombre *</label>
                <Input name="name" defaultValue={user.name} required />
              </div>
              <div>
                <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">Email *</label>
                <Input name="email" type="email" defaultValue={user.email} required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">Rol</label>
                <Select name="role" defaultValue={membership.role}>
                  <option value="tenant_admin">Admin</option>
                  <option value="technician">Técnico</option>
                  <option value="viewer">Viewer</option>
                </Select>
              </div>
              <div>
                <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Nueva contraseña
                  <span className="ml-1 text-[var(--text-muted)] font-normal">(dejar vacío para no cambiar)</span>
                </label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nueva contraseña…"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {error && <p className="text-xs text-[var(--danger-fg)]">{error}</p>}

            <div className="flex items-center justify-end gap-3">
              {savedAt && (
                <span className="flex items-center gap-1.5 text-2xs text-[var(--success-fg)]">
                  <Check className="h-3 w-3" />
                  Guardado
                </span>
              )}
              <Button type="submit" pill loading={isPending}>
                Guardar cambios
              </Button>
            </div>
          </CardBody>
        </Card>
      </form>

      {/* Recent reports */}
      <Card>
        <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Reportes recientes</h3>
          <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">{reportCount} reportes en total</p>
        </div>
        <CardBody className="p-2">
          {recentReports.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[var(--text-tertiary)]">
              Este usuario no ha creado reportes todavía.
            </p>
          ) : (
            <ul className="space-y-1">
              {recentReports.map((r) => {
                const cfg = REPORT_STATUS[r.status] ?? REPORT_STATUS.draft;
                return (
                  <li key={r.id}>
                    <Link
                      href={`/app/reports/${r.id}`}
                      className="flex items-center justify-between gap-4 px-3 py-3 rounded-xl hover:bg-[var(--bg-hover)]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--bg-hover)] text-[var(--text-secondary)]">
                          <FileText className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[var(--text-primary)] tabular">{r.code}</p>
                          <p className="truncate text-2xs text-[var(--text-tertiary)]">
                            {r.equipmentName} · {formatRelative(r.date)}
                          </p>
                        </div>
                      </div>
                      <Badge tone={cfg.tone} dot>{cfg.label}</Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
