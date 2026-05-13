"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface SidebarContextValue {
  // Desktop: collapsed (icon-only) vs expanded
  collapsed: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (next: boolean) => void;

  // Mobile: drawer open/closed
  mobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;

  // Helper: are we in a desktop viewport (>= 1024px)?
  isDesktop: boolean;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

const STORAGE_KEY = "maintly-sidebar-collapsed";

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsedState] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  // Read collapsed preference from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setCollapsedState(stored === "true");
    }
  }, []);

  // Track viewport size
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  // Close mobile drawer on viewport change to desktop
  useEffect(() => {
    if (isDesktop) setMobileOpen(false);
  }, [isDesktop]);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsedState(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  }

  function setCollapsed(next: boolean) {
    setCollapsedState(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  }

  function openMobile() {
    setMobileOpen(true);
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        toggleCollapsed,
        setCollapsed,
        mobileOpen,
        openMobile,
        closeMobile,
        isDesktop,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}
