"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Keyed on pathname — React unmounts/remounts the div on every navigation,
 * which restarts the CSS animation and gives a premium page-enter feel.
 */
export function PageTransitionWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-page-enter">
      {children}
    </div>
  );
}
