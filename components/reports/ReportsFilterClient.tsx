"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Search } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { formatRelative } from "@/lib/utils/format";

interface ReportRow {
  id: string;
  code: string;
  status: string;
  date: string;
  clientName: string;
  equipmentName: string;
  techName: string;
  technicianId: string;
  observations?: string;
}

const STATUS_CONFIG: Record<string, { label: string; tone: "success" | "warning" | "neutral" | "info"; Icon: any }> = {
  completed: { label: "Completado", tone: "success", Icon: CheckCircle2 },
  pending:   { label: "Pendiente",  tone: "warning", Icon: Clock },
  observed:  { label: "Observado",  tone: "warning", Icon: AlertCircle },
  draft:     { label: "Borrador",   tone: "neutral", Icon: FileText },
};

type Filter = "all" | "completed" | "pending" | "observed";

export function ReportsFilterClient({ reports, userId }: { reports: ReportRow[]; userId: string }) {
  const [filter, setFilter]       = useState<Filter>("all");
  const [query, setQuery]         = useState("");
  const [myOnly, setMyOnly]       = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draftFilter, setDraftFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    let list = [...reports];
    if (myOnly) list = list.filter((r) => r.technicianId === userId);
    if (filter !== "all") list = list.filter((r) => r.status === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (r) =>
          r.code.toLowerCase().includes(q) ||
          r.clientName.toLowerCase().includes(q) ||
          r.equipmentName.toLowerCase().includes(q) ||
          r.techName.toLowerCase().includes(q),
      );
    }
    return list;
  }, [reports, filter, query, myOnly, userId]);

  function openSheet() {
    setDraftFilter(filter);
    setSheetOpen(true);
  }

  function applySheet() {
    setFilter(draftFilter);
    setSheetOpen(false);
  }

  function clearSheet() {
    setDraftFilter("all");
    setFilter("all");
    setSheetOpen(false);
  }

  return (
    <div className="space-y-4">
      {/* Desktop filters */}
      <div className="hidden lg:flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-full p-0.5 self-start">
          {(["all", "completed", "pending", "observed"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 h-7 rounded-full text-xs font-medium",
                filter === f
                  ? "bg-[var(--bg-hover)] text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
              )}
            >
              {f === "all" ? "Todos" : STATUS_CONFIG[f]?.label ?? f}
            </button>
          ))}
        </div>
        <div className="flex-1 max-w-md">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leftIcon={<Search className="h-3.5 w-3.5" />}
            placeholder="Buscar por código, cliente, equipo…"
          />
        </div>
      </div>

      {/* Mobile filters */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-full p-0.5">
          <button
            onClick={() => setMyOnly(false)}
            className={cn(
              "px-3 h-7 rounded-full text-xs font-medium",
              !myOnly
                ? "bg-[var(--bg-hover)] text-[var(--text-primary)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
            )}
          >
            Todos
          </button>
          <button
            onClick={() => setMyOnly(true)}
            className={cn(
              "px-3 h-7 rounded-full text-xs font-medium",
              myOnly
                ? "bg-[var(--bg-hover)] text-[var(--text-primary)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
            )}
          >
            Mis registros
          </button>
        </div>
        <button
          type="button"
          onClick={openSheet}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium ml-auto",
            filter !== "all"
              ? "bg-[var(--accent-500)] text-white border-[var(--accent-500)]"
              : "bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)]",
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {filter !== "all" && (
            <span className="min-w-[18px] rounded-full bg-white/30 px-1 text-[10px] font-bold">1</span>
          )}
        </button>
      </div>

      {/* Mobile bottom sheet */}
      {sheetOpen && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/60 lg:hidden"
            onClick={() => setSheetOpen(false)}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-[70] lg:hidden bg-[var(--bg-canvas)] rounded-t-2xl"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[var(--border-default)]" />
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
              <p className="text-sm font-semibold text-[var(--text-primary)]">Filtros</p>
              <button type="button" onClick={() => setSheetOpen(false)}>
                <X className="h-4 w-4 text-[var(--text-tertiary)]" />
              </button>
            </div>
            <div className="px-4 py-4 space-y-4">
              <div>
                <p className="text-2xs font-medium text-[var(--text-secondary)] mb-2">Estado</p>
                <div className="flex flex-wrap gap-2">
                  {(["all", "completed", "pending", "observed"] as Filter[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setDraftFilter(f)}
                      className={cn(
                        "px-3 h-8 rounded-full text-xs font-medium border",
                        draftFilter === f
                          ? "bg-[var(--accent-500)] text-white border-[var(--accent-500)]"
                          : "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)]",
                      )}
                    >
                      {f === "all" ? "Todos" : STATUS_CONFIG[f]?.label ?? f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="secondary" size="sm" pill onClick={clearSheet} className="flex-1">
                  Limpiar
                </Button>
                <Button size="sm" pill onClick={applySheet} className="flex-1">
                  Aplicar
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      <Card>
        <CardBody className="p-2">
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[var(--text-tertiary)]">
              Sin resultados para este filtro.
            </p>
          ) : (
            <ul className="space-y-1">
              {filtered.map((r) => {
                const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.draft;
                return (
                  <li key={r.id}>
                    <Link
                      href={`/app/reports/${r.id}`}
                      className="flex items-center gap-4 px-3 py-3.5 rounded-xl hover:bg-[var(--bg-hover)]"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--bg-hover)] text-[var(--text-secondary)]">
                        <cfg.Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-[var(--text-primary)] font-mono tabular">
                            {r.code}
                          </p>
                          <Badge tone={cfg.tone} dot>{cfg.label}</Badge>
                        </div>
                        <p className="text-2xs text-[var(--text-tertiary)] truncate mt-0.5">
                          {r.equipmentName} · {r.clientName} · {formatRelative(r.date)}
                        </p>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 shrink-0">
                        <Avatar name={r.techName} size="sm" />
                      </div>
                      <ArrowUpRight className="h-3.5 w-3.5 text-[var(--text-tertiary)] shrink-0" />
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
