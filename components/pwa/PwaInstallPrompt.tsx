"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Already installed as standalone
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // Already dismissed
    if (localStorage.getItem("pwa-dismissed")) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!prompt || dismissed) return null;

  async function handleInstall() {
    if (!prompt) return;
    await prompt.prompt();
    const result = await prompt.userChoice;
    if (result.outcome === "accepted") setDismissed(true);
  }

  function handleDismiss() {
    setDismissed(true);
    localStorage.setItem("pwa-dismissed", "1");
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-[var(--bg-card-elevated)] border border-[var(--border-default)] rounded-2xl shadow-[var(--shadow-elevated)] p-4 flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-500)] text-white">
          <Download className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            Instalar Maintly
          </p>
          <p className="text-2xs text-[var(--text-tertiary)]">
            Agregá la app a tu pantalla de inicio
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleInstall}
            className="text-xs font-semibold text-[var(--accent-400)] hover:text-[var(--accent-300)] px-2 py-1"
          >
            Instalar
          </button>
          <button
            onClick={handleDismiss}
            className="grid h-7 w-7 place-items-center rounded-full text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
