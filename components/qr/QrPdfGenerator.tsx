"use client";

import { useEffect, useRef, useState } from "react";
import { Printer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { QrTag, QrBatch } from "@/lib/types";

interface Props {
  batch: QrBatch;
  tags: QrTag[];
}

// Avery 5160 measurements in mm
const SHEET_W = 215.9;   // letter width
const SHEET_H = 279.4;   // letter height
const MARGIN_L = 4.763;
const MARGIN_T = 12.7;
const STICKER_W = 66.675;
const STICKER_H = 25.4;
const GAP_H = 3.175;
const COLS = 3;
const ROWS = 10;
const DPI = 96;
const MM_TO_PX = DPI / 25.4;

function mm(v: number) { return v * MM_TO_PX; }

export function QrPdfGenerator({ batch, tags }: Props) {
  const [generating, setGenerating] = useState(false);

  async function handlePrint() {
    setGenerating(true);
    try {
      // Dynamically import QRCode lib at runtime
      const QRCode = (await import("qrcode")).default;

      const sheetsNeeded = Math.ceil(tags.length / (COLS * ROWS));
      const canvases: HTMLCanvasElement[] = [];

      for (let sheet = 0; sheet < sheetsNeeded; sheet++) {
        const canvas = document.createElement("canvas");
        canvas.width = mm(SHEET_W);
        canvas.height = mm(SHEET_H);
        const ctx = canvas.getContext("2d")!;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let row = 0; row < ROWS; row++) {
          for (let col = 0; col < COLS; col++) {
            const idx = sheet * COLS * ROWS + row * COLS + col;
            if (idx >= tags.length) break;
            const tag = tags[idx];

            const x = mm(MARGIN_L + col * (STICKER_W + GAP_H));
            const y = mm(MARGIN_T + row * STICKER_H);
            const w = mm(STICKER_W);
            const h = mm(STICKER_H);

            // Generate QR as data URL
            const qrDataUrl = await QRCode.toDataURL(tag.url, {
              width: mm(STICKER_H * 0.8),
              margin: 0,
              errorCorrectionLevel: "M",
              color: { dark: "#000000", light: "#ffffff" },
            });

            const qrImg = await loadImage(qrDataUrl);
            const qrSize = h * 0.80;
            const qrPad = (h - qrSize) / 2;

            // Draw QR
            ctx.drawImage(qrImg, x + qrPad, y + qrPad, qrSize, qrSize);

            // Brand name
            ctx.fillStyle = "#1a1a1a";
            ctx.font = `bold ${mm(4.5)}px Arial, sans-serif`;
            ctx.fillText("Maintly", x + qrSize + qrPad * 2, y + h * 0.36);

            // Code
            ctx.font = `${mm(3.8)}px 'Courier New', monospace`;
            ctx.fillStyle = "#3b6cff";
            ctx.fillText(tag.code, x + qrSize + qrPad * 2, y + h * 0.60);

            // URL hint
            ctx.font = `${mm(2.6)}px Arial, sans-serif`;
            ctx.fillStyle = "#888888";
            ctx.fillText("maintly.app/q/…", x + qrSize + qrPad * 2, y + h * 0.83);
          }
        }

        canvases.push(canvas);
      }

      // Open print window
      const printWindow = window.open("", "_blank", "width=900,height=700");
      if (!printWindow) return;

      const html = `<!DOCTYPE html>
<html>
<head>
  <title>QR Tags — ${batch.name}</title>
  <style>
    @page { size: letter; margin: 0; }
    body { margin: 0; padding: 0; background: white; }
    canvas { display: block; width: 100%; page-break-after: always; }
    canvas:last-child { page-break-after: avoid; }
    @media print { body { background: white; } }
  </style>
</head>
<body>
  ${canvases.map((c) => `<img src="${c.toDataURL()}" style="display:block;width:100%;page-break-after:always"/>`).join("\n")}
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 400);
    };
  <\/script>
</body>
</html>`;

      printWindow.document.write(html);
      printWindow.document.close();
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Button
      onClick={handlePrint}
      variant="secondary"
      size="sm"
      pill
      loading={generating}
      leftIcon={<Printer className="h-3.5 w-3.5" />}
    >
      Imprimir PDF ({Math.ceil(tags.length / 30)} {Math.ceil(tags.length / 30) === 1 ? "hoja" : "hojas"})
    </Button>
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
