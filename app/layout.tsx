import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { themeScript } from "@/components/theme/themeScript";
import { TooltipRoot } from "@/components/ui/Tooltip";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { LazyPwaInstallPrompt } from "@/components/pwa/LazyPwaInstallPrompt";
import { BRAND } from "@/lib/brand";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description:
    "Plataforma SaaS multi-tenant para gestión de mantenimiento técnico configurable.",
  manifest: "/manifest.json",
  applicationName: BRAND.name,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: BRAND.name,
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a1428" },
    { media: "(prefers-color-scheme: light)", color: "#f5f7fb" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${poppins.variable} ${GeistMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>
          <TooltipRoot>{children}</TooltipRoot>
        </ThemeProvider>
        <ServiceWorkerRegister />
        <LazyPwaInstallPrompt />
      </body>
    </html>
  );
}
