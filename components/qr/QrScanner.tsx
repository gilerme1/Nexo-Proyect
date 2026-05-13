"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, ScanLine, Camera, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Props {
  onClose: () => void;
}

type ScanState = "requesting" | "scanning" | "found" | "error";

export function QrScanner({ onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<ScanState>("requesting");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const router = useRouter();

  const startScanning = useCallback(async () => {
    setState("requesting");
    try {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const codeReader = new BrowserMultiFormatReader();

      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      if (!devices.length) {
        setState("error");
        setErrorMsg("No se encontró ninguna cámara en este dispositivo.");
        return;
      }

      const backCamera =
        devices.find((d) =>
          /back|rear|environment/i.test(d.label),
        ) ?? devices[devices.length - 1];

      setState("scanning");

      const controls = await codeReader.decodeFromVideoDevice(
        backCamera.deviceId,
        videoRef.current!,
        (result, _err, ctrl) => {
          if (result) {
            const text = result.getText();
            const match = text.match(/\/q\/([A-Z0-9-]{9,12})$/);
            if (match) {
              setState("found");
              ctrl.stop();
              router.push(`/q/${match[1]}`);
            } else if (text.startsWith("http")) {
              setState("found");
              ctrl.stop();
              window.location.href = text;
            }
          }
        },
      );
      controlsRef.current = controls;
    } catch (err: any) {
      setState("error");
      if (err?.name === "NotAllowedError") {
        setErrorMsg("Permiso de cámara denegado. Habilitalo en la configuración del navegador.");
      } else if (err?.name === "NotFoundError") {
        setErrorMsg("No se encontró cámara disponible.");
      } else {
        setErrorMsg(`Error al iniciar la cámara: ${err?.message ?? "desconocido"}`);
      }
    }
  }, [router]);

  useEffect(() => {
    startScanning();
    return () => {
      controlsRef.current?.stop();
    };
  }, [startScanning]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-safe-top py-3 bg-black/60 backdrop-blur-sm">
        <p className="text-white text-sm font-medium flex items-center gap-2">
          <ScanLine className="h-4 w-4" />
          Escaneando QR…
        </p>
        <button
          onClick={onClose}
          className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Camera view */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />

        {/* Viewfinder overlay */}
        {state === "scanning" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-64 h-64">
              {/* Corner brackets */}
              {[
                "top-0 left-0 border-t-2 border-l-2",
                "top-0 right-0 border-t-2 border-r-2",
                "bottom-0 left-0 border-b-2 border-l-2",
                "bottom-0 right-0 border-b-2 border-r-2",
              ].map((cls, i) => (
                <div
                  key={i}
                  className={`absolute w-8 h-8 border-white rounded-sm ${cls}`}
                />
              ))}
              {/* Scanning line animation */}
              <div className="absolute inset-x-0 top-0 h-0.5 bg-[var(--accent-400)] animate-[scan_2s_linear_infinite] opacity-80" />
            </div>
            <p className="absolute bottom-24 text-white/70 text-sm text-center px-8">
              Apuntá la cámara al código QR del equipo
            </p>
          </div>
        )}

        {/* Requesting permission overlay */}
        {state === "requesting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80">
            <Camera className="h-12 w-12 text-white/50 animate-pulse" />
            <p className="text-white/70 text-sm">Iniciando cámara…</p>
          </div>
        )}

        {/* Error overlay */}
        {state === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-black/90 px-8 text-center">
            <AlertCircle className="h-12 w-12 text-[var(--danger-fg)]" />
            <div>
              <p className="text-white font-semibold">No se pudo iniciar la cámara</p>
              <p className="text-white/60 text-sm mt-2">{errorMsg}</p>
            </div>
            <Button
              onClick={startScanning}
              variant="secondary"
              pill
              size="sm"
            >
              Reintentar
            </Button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(256px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
