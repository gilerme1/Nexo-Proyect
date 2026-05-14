"use client";

import dynamic from "next/dynamic";

const PwaInstallPrompt = dynamic(
  () => import("./PwaInstallPrompt").then((mod) => mod.PwaInstallPrompt),
  { ssr: false },
);

export function LazyPwaInstallPrompt() {
  return <PwaInstallPrompt />;
}
