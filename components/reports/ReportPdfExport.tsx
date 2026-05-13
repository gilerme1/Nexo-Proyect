"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ReportData {
  code: string;
  date: string;
  status: string;
  observations?: string;
  durationMinutes?: number;
  signatureDataUrl?: string;
  photos?: { id: string; url: string; caption?: string }[];
  checklists?: { section: string; enabled: boolean; items: { id: string; label: string; value: string | null; measurement?: string; unit?: string }[] }[];
  equipmentName: string;
  equipmentCode: string;
  equipmentTypeName: string;
  clientName: string;
  locationName?: string;
  locationAddress?: string;
  techName: string;
  tenantName: string;
}

export function ReportPdfExport({ report }: { report: ReportData }) {
  const [generating, setGenerating] = useState(false);

  function handleExport() {
    setGenerating(true);
    try {
      const dateStr = new Date(report.date).toLocaleDateString("es-UY", {
        day: "2-digit", month: "long", year: "numeric",
      });
      const timeStr = new Date(report.date).toLocaleTimeString("es-UY", {
        hour: "2-digit", minute: "2-digit",
      });

      const enabledChecklists = report.checklists?.filter((c) => c.enabled) ?? [];
      const checklistsHtml = enabledChecklists.map((section) => {
        const sectionLabel = section.section === "instalacion" ? "INSTALACIÓN" : "MANTENIMIENTO";
        const rows = section.items.map((item, idx) => {
          const hasMeasurement = item.measurement !== undefined;
          const valueCell = hasMeasurement
            ? `<td style="text-align:right;font-weight:600">${item.measurement || "—"} <span style="font-size:10px;color:#888">${item.unit ?? ""}</span></td>`
            : `<td style="text-align:center">
                <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-weight:700;font-size:10px;
                  background:${item.value === "si" ? "#d1fae5" : item.value === "no" ? "#fee2e2" : "#f3f4f6"};
                  color:${item.value === "si" ? "#065f46" : item.value === "no" ? "#991b1b" : "#6b7280"}">
                  ${item.value ? item.value.toUpperCase() : "—"}
                </span>
              </td>`;
          return `<tr style="border-bottom:1px solid #e5e7eb">
            <td style="color:#888;text-align:right;padding-right:8px">${idx + 1}</td>
            <td style="padding:4px 0">${item.label}</td>
            ${valueCell}
          </tr>`;
        }).join("");
        return `
          <div class="section-title">${sectionLabel}</div>
          <table style="width:100%;border-collapse:collapse;font-size:11px">
            <colgroup><col width="24"><col><col width="80"></colgroup>
            ${rows}
          </table>
        `;
      }).join("");

      const photosHtml = report.photos?.map((p) => `
        <div class="photo">
          <img src="${p.url}" alt="${p.caption ?? "foto"}" />
          ${p.caption ? `<p class="photo-caption">${p.caption}</p>` : ""}
        </div>
      `).join("") ?? "";

      const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<title>Reporte ${report.code}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #1a1a2e; padding: 32px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #3b6cff; padding-bottom: 16px; margin-bottom: 24px; }
  .brand { font-size: 20px; font-weight: 800; color: #3b6cff; }
  .code { font-size: 18px; font-weight: 700; font-family: monospace; }
  .meta { font-size: 11px; color: #666; margin-top: 4px; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
  .box { background: #f8f9fc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; }
  .box-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #666; margin-bottom: 8px; }
  .box-row { display: flex; gap: 6px; margin-bottom: 5px; font-size: 11px; }
  .box-label { color: #888; min-width: 80px; }
  .box-value { font-weight: 500; }
  .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #3b6cff; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin: 20px 0 12px; }
  .observations { background: #f8f9fc; border-left: 3px solid #3b6cff; padding: 12px 16px; border-radius: 0 8px 8px 0; font-size: 12px; line-height: 1.6; white-space: pre-wrap; }
  .photos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .photo img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 6px; border: 1px solid #e2e8f0; }
  .photo-caption { font-size: 10px; color: #666; margin-top: 4px; text-align: center; }
  .signature-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; display: inline-block; background: white; }
  .signature-box img { max-height: 80px; }
  .footer { margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 10px; color: #999; display: flex; justify-content: space-between; }
  @media print { body { padding: 24px; } .no-print { display: none; } }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="brand">${report.tenantName}</div>
    <div class="meta">Reporte de mantenimiento</div>
  </div>
  <div style="text-align:right">
    <div class="code">${report.code}</div>
    <div class="meta">${dateStr} · ${timeStr}</div>
    ${report.durationMinutes ? `<div class="meta">${report.durationMinutes} minutos</div>` : ""}
  </div>
</div>

<div class="grid-2">
  <div class="box">
    <div class="box-title">Equipo</div>
    <div class="box-row"><span class="box-label">Nombre</span><span class="box-value">${report.equipmentName}</span></div>
    <div class="box-row"><span class="box-label">Tipo</span><span class="box-value">${report.equipmentTypeName}</span></div>
    <div class="box-row"><span class="box-label">Código</span><span class="box-value" style="font-family:monospace">${report.equipmentCode}</span></div>
  </div>
  <div class="box">
    <div class="box-title">Cliente / Ubicación</div>
    <div class="box-row"><span class="box-label">Cliente</span><span class="box-value">${report.clientName}</span></div>
    ${report.locationName ? `<div class="box-row"><span class="box-label">Ubicación</span><span class="box-value">${report.locationName}</span></div>` : ""}
    ${report.locationAddress ? `<div class="box-row"><span class="box-label">Dirección</span><span class="box-value">${report.locationAddress}</span></div>` : ""}
    <div class="box-row"><span class="box-label">Técnico</span><span class="box-value">${report.techName}</span></div>
  </div>
</div>

${checklistsHtml ? `
<div class="section-title">Checklist de trabajo</div>
${checklistsHtml}
` : ""}

${report.observations ? `
<div class="section-title">Observaciones</div>
<div class="observations">${report.observations}</div>
` : ""}

${report.photos && report.photos.length > 0 ? `
<div class="section-title">Fotos (${report.photos.length})</div>
<div class="photos">${photosHtml}</div>
` : ""}

${report.signatureDataUrl ? `
<div class="section-title">Conformidad del cliente</div>
<div class="signature-box">
  <img src="${report.signatureDataUrl}" alt="firma" />
</div>
<p style="font-size:10px;color:#666;margin-top:8px">Firmado el ${dateStr}</p>
` : ""}

<div class="footer">
  <span>Generado por ${report.tenantName} · Maintly</span>
  <span>${report.code} · ${dateStr}</span>
</div>

<script>
window.onload = function() {
  setTimeout(function() { window.print(); }, 300);
};
</script>
</body>
</html>`;

      const win = window.open("", "_blank", "width=900,height=700");
      if (win) {
        win.document.write(html);
        win.document.close();
      }
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Button
      onClick={handleExport}
      variant="secondary"
      size="sm"
      pill
      loading={generating}
      leftIcon={<FileDown className="h-3.5 w-3.5" />}
    >
      Exportar PDF
    </Button>
  );
}
