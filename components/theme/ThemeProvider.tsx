"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type Theme = "dark" | "light";
type ThemeMode = "dark" | "light" | "system";
type FontSize = "sm" | "md" | "lg";

interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  accentColor: string;
  setAccentColor: (hex: string) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "maintly-theme";
const ACCENT_KEY = "maintly-accent";
const FONT_KEY = "maintly-font-size";
const DEFAULT_ACCENT = "#3b6cff";

const FONT_SIZE_MAP: Record<FontSize, string> = {
  sm: "14px",
  md: "16px",
  lg: "18px",
};

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

function applyAccent(hex: string) {
  if (typeof document === "undefined") return;
  // Derive slightly lighter and darker variants
  const root = document.documentElement;
  root.style.setProperty("--accent-500", hex);
  root.style.setProperty("--accent-400", lightenHex(hex, 15));
  root.style.setProperty("--accent-600", darkenHex(hex, 15));
  root.style.setProperty("--accent-300", lightenHex(hex, 30));
  // Update info-bg/info-fg to match accent
  root.style.setProperty("--info-bg", hexToRgba(hex, 0.12));
  root.style.setProperty("--info-fg", hex);
}

function applyFontSize(size: FontSize) {
  if (typeof document === "undefined") return;
  document.documentElement.style.fontSize = FONT_SIZE_MAP[size];
}

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

// Simple color manipulation helpers — no dep needed
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const n = parseInt(clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => Math.min(255, Math.max(0, v)).toString(16).padStart(2, "0")).join("");
}

function hexToRgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function lightenHex(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + amount, g + amount, b + amount);
}

function darkenHex(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r - amount, g - amount, b - amount);
}

interface ThemeProviderProps {
  children: React.ReactNode;
  /** Tenant branding override — applied before localStorage so tenant config takes precedence */
  tenantAccentColor?: string;
}

export function ThemeProvider({ children, tenantAccentColor }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>("dark");
  const [theme, setTheme] = useState<Theme>("dark");
  const [accentColor, setAccentColorState] = useState(tenantAccentColor ?? DEFAULT_ACCENT);
  const [fontSize, setFontSizeState] = useState<FontSize>("md");

  useEffect(() => {
    // Theme
    const storedTheme = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    const initialMode = storedTheme ?? "dark";
    setModeState(initialMode);
    const resolved = initialMode === "system" ? getSystemTheme() : initialMode;
    setTheme(resolved);
    applyTheme(resolved);

    // Accent — tenant override takes priority over localStorage
    const storedAccent = localStorage.getItem(ACCENT_KEY);
    const finalAccent = tenantAccentColor ?? storedAccent ?? DEFAULT_ACCENT;
    setAccentColorState(finalAccent);
    applyAccent(finalAccent);

    // Font size
    const storedFont = localStorage.getItem(FONT_KEY) as FontSize | null;
    const initialFont = storedFont ?? "md";
    setFontSizeState(initialFont);
    applyFontSize(initialFont);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When tenantAccentColor prop changes (e.g. after saving in settings), re-apply
  useEffect(() => {
    if (tenantAccentColor) {
      setAccentColorState(tenantAccentColor);
      applyAccent(tenantAccentColor);
    }
  }, [tenantAccentColor]);

  useEffect(() => {
    if (mode !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: light)");
    const handler = () => {
      const next: Theme = mql.matches ? "light" : "dark";
      setTheme(next);
      applyTheme(next);
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    localStorage.setItem(STORAGE_KEY, next);
    const resolved = next === "system" ? getSystemTheme() : next;
    setTheme(resolved);
    applyTheme(resolved);
  }, []);

  const setAccentColor = useCallback((hex: string) => {
    setAccentColorState(hex);
    localStorage.setItem(ACCENT_KEY, hex);
    applyAccent(hex);
  }, []);

  const setFontSize = useCallback((size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem(FONT_KEY, size);
    applyFontSize(size);
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme, mode, setMode, accentColor, setAccentColor, fontSize, setFontSize }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
