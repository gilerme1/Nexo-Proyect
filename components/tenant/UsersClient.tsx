"use client";

import { useState, useTransition } from "react";
import { UserPlus, Trash2, Check, X, ChevronRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils/cn";
import { inviteMember, updateMemberRole, removeMember } from "@/lib/actions/members";

interface Member {
  membershipId: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  isCurrentUser: boolean;
}

interface Props {
  members: Member[];
  tenantId: string;
  planUserLimit: number | null;
}

const ROLE_LABELS: Record<string, string> = {
  tenant_admin: "Admin",
  technician:   "Técnico",
  viewer:       "Viewer",
};

export function UsersClient({ members: initialMembers, tenantId, planUserLimit }: Props) {
  const [pending, startTransition] = useTransition();
  const [members, setMembers] = useState(initialMembers);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const atLimit = planUserLimit !== null && members.length >= planUserLimit;

  function handleRoleChange(membershipId: string, role: string) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("membershipId", membershipId);
      fd.set("role", role);
      await updateMemberRole(fd);
      setMembers((prev) =>
        prev.map((m) => m.membershipId === membershipId ? { ...m, role } : m),
      );
    });
  }

  function handleRemove(membershipId: string) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("membershipId", membershipId);
      const result = await removeMember(fd);
      if (result.ok) {
        setMembers((prev) => prev.filter((m) => m.membershipId !== membershipId));
        setConfirmRemove(null);
      }
    });
  }

  function handleInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setInviteError("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await inviteMember(fd);
      if (!result.ok) { setInviteError(result.error ?? "Error"); return; }
      setInviteOpen(false);
      // reload to get new member data
      window.location.reload();
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Equipo</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-0.5">
            {members.length} usuario{members.length !== 1 ? "s" : ""}
            {planUserLimit !== null ? ` de ${planUserLimit} disponibles` : ""}
          </p>
        </div>
        <Button
          pill
          onClick={() => setInviteOpen(true)}
          disabled={atLimit}
          title={atLimit ? "Límite de usuarios alcanzado" : undefined}
        >
          <UserPlus className="h-4 w-4" />
          Invitar usuario
        </Button>
      </div>

      {atLimit && (
        <div className="rounded-xl bg-[var(--warning-bg)] border border-[var(--warning-border)] px-4 py-3 text-2xs text-[var(--warning-fg)]">
          Llegaste al límite de usuarios de tu plan. Mejorá el plan para agregar más.
        </div>
      )}

      {/* Members list */}
      <Card>
        <CardBody className="p-2">
          {members.length === 0 ? (
            <p className="py-10 text-center text-sm text-[var(--text-tertiary)]">
              Sin miembros todavía.
            </p>
          ) : (
            <ul className="space-y-1">
              {members.map((m) => (
                <li key={m.membershipId} className="group relative flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[var(--bg-hover)]">
                  {/* Clickable area → user detail page */}
                  <Link href={`/app/users/${m.userId}`} className="absolute inset-0 rounded-xl" aria-label={`Ver perfil de ${m.name}`} />

                  <Avatar name={m.name} size="sm" />
                  <div className="flex-1 min-w-0 pointer-events-none">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {m.name}
                      {m.isCurrentUser && (
                        <span className="ml-1.5 text-2xs text-[var(--text-tertiary)]">(vos)</span>
                      )}
                    </p>
                    <p className="text-2xs text-[var(--text-tertiary)] truncate">{m.email}</p>
                  </div>

                  <Badge tone="neutral" className="shrink-0 pointer-events-none">
                    {ROLE_LABELS[m.role] ?? m.role}
                  </Badge>

                  {/* Remove button — sits above the link overlay via z-index */}
                  <div className="relative z-10 flex items-center">
                    {confirmRemove === m.membershipId ? (
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-2xs text-[var(--text-secondary)] mr-1">¿Confirmar?</span>
                        <button
                          type="button"
                          onClick={() => handleRemove(m.membershipId)}
                          className="text-[var(--danger-fg)] hover:opacity-70 p-1"
                          disabled={pending}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmRemove(null)}
                          className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmRemove(m.membershipId)}
                        disabled={m.isCurrentUser || pending}
                        className={cn(
                          "shrink-0 p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--danger-fg)] hover:bg-[var(--danger-bg)]",
                          "opacity-0 group-hover:opacity-100",
                          m.isCurrentUser && "invisible",
                        )}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <ChevronRight className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0 pointer-events-none" />
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {/* Invite modal */}
      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invitar usuario"
        size="sm"
        footer={
          <>
            <Button variant="secondary" pill onClick={() => setInviteOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="invite-user-form" pill loading={pending}>
              Invitar
            </Button>
          </>
        }
      >
        <form id="invite-user-form" onSubmit={handleInvite} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Nombre *</label>
              <Input name="name" required placeholder="Nombre completo" autoFocus />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Email *</label>
              <Input name="email" type="email" required placeholder="nombre@empresa.com" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Contraseña *</label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Contraseña de acceso"
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
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Rol</label>
              <Select name="role" defaultValue="technician">
                <option value="tenant_admin">Admin</option>
                <option value="technician">Técnico</option>
                <option value="viewer">Viewer</option>
              </Select>
            </div>
          </div>
          {inviteError && <p className="text-xs text-[var(--danger-fg)]">{inviteError}</p>}
        </form>
      </Modal>
    </div>
  );
}
