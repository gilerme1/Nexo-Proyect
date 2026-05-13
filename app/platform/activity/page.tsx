import Link from "next/link";
import {
  Activity,
  Building2,
  UserPlus,
  FileText,
  Wrench,
  Layers,
  CheckCircle2,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { store } from "@/lib/data/store";
import { formatRelative, formatDateTime } from "@/lib/utils/format";
import type { ActivityEntry, ActivityType } from "@/lib/types";

const ICON_BY_TYPE: Record<ActivityType, LucideIcon> = {
  tenant_created: Building2,
  tenant_updated: Building2,
  vertical_created: Layers,
  template_published: FileText,
  client_created: Building2,
  location_created: Building2,
  equipment_created: Wrench,
  equipment_updated: Wrench,
  report_created: FileText,
  report_completed: CheckCircle2,
  status_changed: Activity,
  user_invited: UserPlus,
};

const TONE_BY_TYPE: Record<ActivityType, "neutral" | "success" | "info" | "warning" | "danger"> = {
  tenant_created: "info",
  tenant_updated: "neutral",
  vertical_created: "info",
  template_published: "info",
  client_created: "info",
  location_created: "neutral",
  equipment_created: "info",
  equipment_updated: "neutral",
  report_created: "info",
  report_completed: "success",
  status_changed: "warning",
  user_invited: "info",
};

function resolveLink(ev: ActivityEntry): string | null {
  const { targetType, targetId, tenantId } = ev;
  switch (targetType) {
    case "tenant":    return `/platform/tenants/${targetId}`;
    case "vertical":  return `/platform/verticals/${targetId}`;
    case "plan":      return `/platform/plans/${targetId}`;
    case "client":    return tenantId ? `/platform/tenants/${tenantId}` : null;
    case "equipment": return tenantId ? `/platform/tenants/${tenantId}` : null;
    case "report":    return tenantId ? `/platform/tenants/${tenantId}` : null;
    case "user":      return `/platform/users`;
    default:          return null;
  }
}

export default function ActivityPage() {
  const events = [...store.activity].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const groups = new Map<string, typeof events>();
  for (const ev of events) {
    const day = new Date(ev.createdAt).toISOString().slice(0, 10);
    if (!groups.has(day)) groups.set(day, []);
    groups.get(day)!.push(ev);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Actividad global"
        description="Registro cronológico de eventos cross-tenant en la plataforma."
      />

      {events.length === 0 ? (
        <Card>
          <EmptyState
            icon={Activity}
            title="Sin actividad"
            description="Los eventos aparecerán acá conforme se vaya operando la plataforma."
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {Array.from(groups.entries()).map(([day, items]) => (
            <div key={day}>
              <p className="text-2xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3 px-2">
                {new Date(day).toLocaleDateString("es", {
                  weekday: "long", day: "numeric", month: "long",
                })}
              </p>
              <Card>
                <CardBody className="p-2">
                  <ul className="space-y-1">
                    {items.map((ev) => {
                      const Icon = ICON_BY_TYPE[ev.type] ?? Activity;
                      const tone = TONE_BY_TYPE[ev.type] ?? "neutral";
                      const actor = store.users.find((u) => u.id === ev.actorId);
                      const tenant = ev.tenantId ? store.tenants.find((t) => t.id === ev.tenantId) : null;
                      const href = resolveLink(ev);

                      const iconBg =
                        tone === "success" ? "bg-[var(--success-bg)] text-[var(--success-fg)]"
                        : tone === "warning" ? "bg-[var(--warning-bg)] text-[var(--warning-fg)]"
                        : tone === "danger"  ? "bg-[var(--danger-bg)] text-[var(--danger-fg)]"
                        : "bg-[var(--info-bg)] text-[var(--info-fg)]";

                      const inner = (
                        <>
                          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${iconBg}`}>
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-[var(--text-primary)]">{ev.description}</p>
                            <div className="flex items-center flex-wrap gap-2 mt-1.5 text-2xs text-[var(--text-tertiary)]">
                              {actor && (
                                <span className="flex items-center gap-1.5">
                                  <Avatar name={actor.name} size="xs" />
                                  {actor.name}
                                </span>
                              )}
                              {tenant && (
                                <>
                                  <span>·</span>
                                  <span>{tenant.name}</span>
                                </>
                              )}
                              {ev.scope === "platform" && (
                                <>
                                  <span>·</span>
                                  <Badge tone="neutral" size="sm">Platform</Badge>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-2xs text-[var(--text-tertiary)]" title={formatDateTime(ev.createdAt)}>
                              {formatRelative(ev.createdAt)}
                            </span>
                            {href && <ArrowUpRight className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />}
                          </div>
                        </>
                      );

                      return href ? (
                        <li key={ev.id}>
                          <Link
                            href={href}
                            className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-[var(--bg-hover)]"
                          >
                            {inner}
                          </Link>
                        </li>
                      ) : (
                        <li key={ev.id} className="flex items-start gap-3 px-3 py-3 rounded-xl">
                          {inner}
                        </li>
                      );
                    })}
                  </ul>
                </CardBody>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

