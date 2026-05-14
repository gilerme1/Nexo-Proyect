"use client";

import { useState, useTransition } from "react";
import { Building2, Plus, Save, ShieldCheck, UserCog } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  addUserMembership,
  createPlatformUser,
  updatePlatformUser,
  updateUserMembership,
} from "@/lib/actions/users";
import { cn } from "@/lib/utils/cn";
import { formatRelative } from "@/lib/utils/format";
import type { Membership, Tenant, User } from "@/lib/types";

type TenantRole = "tenant_admin" | "technician" | "viewer";

interface MembershipWithTenant extends Membership {
  tenant?: Tenant;
}

interface UserWithMemberships {
  user: User;
  memberships: MembershipWithTenant[];
}

interface Props {
  usersWithMemberships: UserWithMemberships[];
  tenants: Tenant[];
}

const ROLE_LABEL: Record<TenantRole, string> = {
  tenant_admin: "Admin",
  technician: "Técnico",
  viewer: "Lectura",
};

export function PlatformUsersClient({ usersWithMemberships, tenants }: Props) {
  const [selectedUserId, setSelectedUserId] = useState(
    usersWithMemberships[0]?.user.id ?? "",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const selected = usersWithMemberships.find(
    ({ user }) => user.id === selectedUserId,
  ) ?? usersWithMemberships[0];

  function runAction(action: (formData: FormData) => Promise<{ ok: boolean; error?: string }>) {
    return (formData: FormData) => {
      setMessage(null);
      startTransition(async () => {
        const result = await action(formData);
        setMessage(result.ok ? "Cambios guardados." : result.error ?? "No se pudo guardar.");
      });
    };
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="space-y-6">
        <Card>
          <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-[var(--border-subtle)]">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Directorio global
              </h2>
              <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
                {usersWithMemberships.length} usuarios registrados
              </p>
            </div>
          </div>
          <CardBody className="p-2">
            <ul className="space-y-1">
              {usersWithMemberships.map(({ user, memberships }) => (
                <li key={user.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedUserId(user.id)}
                    className={cn(
                      "w-full flex items-start gap-4 px-3 py-3 rounded-xl text-left hover:bg-[var(--bg-hover)]",
                      selected?.user.id === user.id && "bg-[var(--bg-hover)]",
                    )}
                  >
                    <Avatar name={user.name} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {user.name}
                        </p>
                        {user.isPlatformAdmin && (
                          <Badge tone="info" size="sm">
                            <ShieldCheck className="h-2.5 w-2.5" />
                            Super Admin
                          </Badge>
                        )}
                      </div>
                      <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
                        {user.email} · creado {formatRelative(user.createdAt)}
                      </p>
                      {memberships.length > 0 && (
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          {memberships.map((membership) => (
                            <span
                              key={membership.id}
                              className={cn(
                                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-2xs",
                                membership.active
                                  ? "bg-[var(--bg-card)] border-[var(--border-default)] text-[var(--text-secondary)]"
                                  : "bg-[var(--bg-hover)] border-[var(--border-subtle)] text-[var(--text-tertiary)]",
                              )}
                            >
                              <Building2 className="h-2.5 w-2.5" />
                              {membership.tenant?.name ?? "Tenant eliminado"}
                              <span className="text-[var(--text-tertiary)]">
                                · {ROLE_LABEL[membership.role as TenantRole] ?? membership.role}
                              </span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Plus className="h-4 w-4 text-[var(--accent-500)]" />
              Crear usuario
            </h2>
          </div>
          <CardBody>
            <form action={runAction(createPlatformUser)} className="space-y-4">
              <Field label="Nombre">
                <Input name="name" required placeholder="Nombre completo" />
              </Field>
              <Field label="Email">
                <Input name="email" type="email" required placeholder="usuario@empresa.com" />
              </Field>
              <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <input name="isPlatformAdmin" type="checkbox" className="h-4 w-4 accent-[var(--accent-500)]" />
                Super Admin del panel principal
              </label>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tenant inicial">
                  <Select name="tenantId">
                    <option value="">Sin tenant</option>
                    {tenants.map((tenant) => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Rol tenant">
                  <RoleSelect name="role" />
                </Field>
              </div>
              <Button type="submit" pill loading={isPending} leftIcon={<Plus className="h-3.5 w-3.5" />}>
                Crear usuario
              </Button>
            </form>
          </CardBody>
        </Card>

        {selected && (
          <Card>
            <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
              <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <UserCog className="h-4 w-4 text-[var(--accent-500)]" />
                Editar usuario
              </h2>
            </div>
            <CardBody className="space-y-5">
              <form action={runAction(updatePlatformUser)} className="space-y-4">
                <input type="hidden" name="userId" value={selected.user.id} />
                <Field label="Nombre">
                  <Input name="name" required defaultValue={selected.user.name} />
                </Field>
                <Field label="Email">
                  <Input name="email" type="email" required defaultValue={selected.user.email} />
                </Field>
                <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <input
                    name="isPlatformAdmin"
                    type="checkbox"
                    defaultChecked={selected.user.isPlatformAdmin}
                    className="h-4 w-4 accent-[var(--accent-500)]"
                  />
                  Super Admin del panel principal
                </label>
                <Button type="submit" pill size="sm" loading={isPending} leftIcon={<Save className="h-3.5 w-3.5" />}>
                  Guardar usuario
                </Button>
              </form>

              <div className="border-t border-[var(--border-subtle)] pt-5 space-y-4">
                <div>
                  <h3 className="text-xs font-semibold text-[var(--text-primary)]">
                    Accesos a tenants
                  </h3>
                  <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
                    Administrá a qué cuentas puede entrar y con qué rol.
                  </p>
                </div>

                <div className="space-y-2">
                  {selected.memberships.map((membership) => (
                    <form
                      key={membership.id}
                      action={runAction(updateUserMembership)}
                      className="grid grid-cols-[minmax(0,1fr)_120px_auto] items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-page)] p-3"
                    >
                      <input type="hidden" name="membershipId" value={membership.id} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                          {membership.tenant?.name ?? "Tenant eliminado"}
                        </p>
                        <label className="mt-1 flex items-center gap-1.5 text-2xs text-[var(--text-tertiary)]">
                          <input
                            name="active"
                            type="checkbox"
                            defaultChecked={membership.active}
                            className="h-3.5 w-3.5 accent-[var(--accent-500)]"
                          />
                          Activo
                        </label>
                      </div>
                      <RoleSelect name="role" defaultValue={membership.role as TenantRole} small />
                      <Button type="submit" variant="secondary" size="sm" loading={isPending}>
                        Guardar
                      </Button>
                    </form>
                  ))}
                </div>

                <form action={runAction(addUserMembership)} className="grid grid-cols-[minmax(0,1fr)_120px_auto] items-end gap-2">
                  <input type="hidden" name="userId" value={selected.user.id} />
                  <Field label="Agregar tenant">
                    <Select name="tenantId" required>
                      <option value="">Seleccionar</option>
                      {tenants.map((tenant) => (
                        <option key={tenant.id} value={tenant.id}>
                          {tenant.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Rol">
                    <RoleSelect name="role" />
                  </Field>
                  <Button type="submit" size="sm" pill loading={isPending}>
                    Agregar
                  </Button>
                </form>
              </div>

              {message && (
                <p className="rounded-xl bg-[var(--bg-hover)] px-3 py-2 text-2xs text-[var(--text-secondary)]">
                  {message}
                </p>
              )}
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-2xs font-medium text-[var(--text-secondary)]">
        {label}
      </span>
      {children}
    </label>
  );
}

function RoleSelect({
  name,
  defaultValue = "technician",
  small,
}: {
  name: string;
  defaultValue?: TenantRole;
  small?: boolean;
}) {
  return (
    <Select name={name} defaultValue={defaultValue} inputSize={small ? "sm" : "md"}>
      <option value="tenant_admin">Admin</option>
      <option value="technician">Técnico</option>
      <option value="viewer">Lectura</option>
    </Select>
  );
}
