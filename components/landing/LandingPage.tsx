"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, QrCode, Wrench, FileText, CalendarClock,
  CheckCircle2, MapPin, Zap, Shield, BarChart3, Menu, X,
  Camera, Thermometer, Building2, Bolt,
} from "lucide-react";

// ============================================================================
// Animated background — floating orbs + grid
// ============================================================================
function Background() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--border-subtle) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      {/* Orbs */}
      <div
        className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
        style={{ background: "radial-gradient(circle, #3b6cff, transparent 70%)" }}
      />
      <div
        className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-10 blur-[100px]"
        style={{ background: "radial-gradient(circle, #5f87ff, transparent 70%)" }}
      />
      <div
        className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] rounded-full opacity-10 blur-[80px]"
        style={{ background: "radial-gradient(circle, #3b6cff, transparent 70%)" }}
      />
      {/* Noise grain */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
          backgroundSize: "160px 160px",
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
}

// ============================================================================
// Navbar
// ============================================================================
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a1428]/90 backdrop-blur-md border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#3b6cff] text-white text-sm font-bold shadow-lg shadow-[#3b6cff]/30">
            M
          </span>
          <span className="text-base font-bold text-white tracking-tight">Maintly</span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: "Producto", href: "#features" },
            { label: "Para quién", href: "#audience" },
            { label: "Precios", href: "/precios" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-white/70 hover:text-white transition-colors px-4 py-2"
          >
            Ingresar
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold text-white bg-[#3b6cff] hover:bg-[#2553f0] px-4 py-2 rounded-full transition-colors shadow-lg shadow-[#3b6cff]/30"
          >
            Empezar gratis
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white/70 hover:text-white"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0a1428]/95 backdrop-blur-md border-t border-white/5 px-5 py-4 space-y-3">
          {["Producto", "Para quién", "Precios"].map((label) => (
            <a
              key={label}
              href={label === "Precios" ? "/precios" : `#${label.toLowerCase()}`}
              className="block text-sm text-white/70 hover:text-white py-2"
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </a>
          ))}
          <Link
            href="/login"
            className="block text-center text-sm font-semibold text-white bg-[#3b6cff] px-4 py-2.5 rounded-full mt-2"
            onClick={() => setMenuOpen(false)}
          >
            Ingresar
          </Link>
        </div>
      )}
    </header>
  );
}

// ============================================================================
// Dashboard mockup — the parallax hero element
// ============================================================================
function DashboardMockup() {
  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
      style={{ background: "#0d1a35" }}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3 bg-white/5 border-b border-white/5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ef6b5a]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#34d399]" />
        <span className="ml-3 text-xs text-white/30 font-mono">maintly.app/app</span>
      </div>

      {/* App chrome */}
      <div className="flex" style={{ minHeight: 380 }}>
        {/* Sidebar */}
        <div className="w-48 bg-white/3 border-r border-white/5 p-3 flex flex-col gap-1 shrink-0">
          <div className="flex items-center gap-2 px-2 py-2 mb-2">
            <span className="h-7 w-7 rounded-xl bg-[#3b6cff] grid place-items-center text-white text-xs font-bold">M</span>
            <span className="text-xs font-semibold text-white">Maintly</span>
          </div>
          {[
            { label: "Dashboard", active: true },
            { label: "Clientes", active: false },
            { label: "Equipos", active: false },
            { label: "Reportes", active: false },
            { label: "QR Tags", active: false },
          ].map((item) => (
            <div
              key={item.label}
              className={`px-2.5 py-1.5 rounded-lg text-xs ${
                item.active
                  ? "bg-white/10 text-white font-medium"
                  : "text-white/40"
              }`}
            >
              {item.label}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 space-y-3">
          <p className="text-xs font-semibold text-white/60 mb-2">Dashboard</p>

          {/* Hero cards */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Equipos", value: "142", trend: "↑ 12%" },
              { label: "Reportes", value: "38", trend: "este mes" },
              { label: "Clientes", value: "24", trend: "activos" },
            ].map((card) => (
              <div
                key={card.label}
                className="bg-white/5 border border-white/10 rounded-xl p-3"
              >
                <p className="text-2xs text-white/40 mb-1">{card.label}</p>
                <p className="text-xl font-bold text-white tabular">{card.value}</p>
                <p className="text-2xs text-[#34d399] mt-1">{card.trend}</p>
              </div>
            ))}
          </div>

          {/* Fake chart */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <p className="text-2xs text-white/40 mb-3">Equipos en gestión</p>
            <div className="flex items-end gap-1 h-16">
              {[30, 45, 40, 60, 55, 75, 70, 85, 80, 95, 90, 100].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{
                    height: `${h}%`,
                    background: i === 11
                      ? "#3b6cff"
                      : `rgba(59,108,255,${0.1 + h / 200})`,
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1">
              {["May", "", "", "Ago", "", "", "Nov", "", "", "Feb", "", "Abr"].map((l, i) => (
                <span key={i} className="text-[10px] text-white/20 flex-1 text-center">{l}</span>
              ))}
            </div>
          </div>

          {/* Fake list */}
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <p className="text-2xs text-white/40 px-3 pt-3 pb-2">Reportes recientes</p>
            {[
              { code: "RPT-0038", client: "Supermercado Avenida", status: "Completado", tone: "#34d399" },
              { code: "RPT-0037", client: "Edificio Mirador", status: "Observado", tone: "#fbbf24" },
              { code: "RPT-0036", client: "Hotel Costa Azul", status: "Completado", tone: "#34d399" },
            ].map((r) => (
              <div
                key={r.code}
                className="flex items-center justify-between px-3 py-2 border-t border-white/5"
              >
                <div>
                  <p className="text-xs text-white font-mono">{r.code}</p>
                  <p className="text-2xs text-white/40">{r.client}</p>
                </div>
                <span
                  className="text-2xs font-medium px-2 py-0.5 rounded-full"
                  style={{ color: r.tone, background: r.tone + "20" }}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Parallax hook
// ============================================================================
function useParallax(speed = 0.3) {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const handler = () => setOffset(window.scrollY * speed);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [speed]);
  return offset;
}

// ============================================================================
// Intersection observer for fade-in-on-scroll
// ============================================================================
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

// ============================================================================
// Hero
// ============================================================================
function Hero() {
  const parallaxOffset = useParallax(0.25);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center pt-24 pb-16 px-5 overflow-hidden">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/70 text-xs px-4 py-1.5 rounded-full mb-8 backdrop-blur-sm">
        <Zap className="h-3 w-3 text-[#fbbf24]" />
        Plataforma SaaS multi-tenant para mantenimiento técnico
      </div>

      {/* Headline */}
      <h1
        className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.05] max-w-4xl mb-6"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        Gestión de{" "}
        <span
          className="relative"
          style={{
            background: "linear-gradient(135deg, #5f87ff 0%, #3b6cff 50%, #7c9fff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          mantenimiento
        </span>
        <br />
        para empresas técnicas
      </h1>

      {/* Subtitle */}
      <p className="text-lg text-white/50 max-w-2xl leading-relaxed mb-10">
        Registrá equipos con QR, generá reportes en sitio, firmá digitalmente y programá
        mantenimientos preventivos. Todo desde el celular, sin papel.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-20">
        <Link
          href="/login"
          className="flex items-center gap-2 text-sm font-semibold text-white bg-[#3b6cff] hover:bg-[#2553f0] px-6 py-3 rounded-full transition-all shadow-xl shadow-[#3b6cff]/30 hover:shadow-[#3b6cff]/50 hover:-translate-y-0.5"
        >
          Empezar ahora
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/precios"
          className="flex items-center gap-2 text-sm text-white/60 hover:text-white px-6 py-3 rounded-full border border-white/10 hover:border-white/20 transition-all"
        >
          Ver precios
        </Link>
      </div>

      {/* Dashboard mockup with parallax + 3D perspective */}
      <div
        className="w-full max-w-4xl mx-auto"
        style={{
          transform: `translateY(${parallaxOffset}px)`,
          perspective: "1200px",
        }}
      >
        <div className="relative"
          style={{
            transform: "rotateX(6deg) rotateY(-2deg) rotateZ(1deg)",
            transformStyle: "preserve-3d",
            transition: "transform 0.1s ease-out",
          }}
        >
          {/* Glow behind mockup */}
          <div
            className="absolute inset-x-10 -bottom-10 h-40 opacity-50 blur-3xl"
            style={{ background: "linear-gradient(to bottom, #3b6cff, transparent)" }}
          />
          {/* Side shadow for depth */}
          <div
            className="absolute -inset-1 rounded-2xl opacity-60 blur-xl -z-10"
            style={{ background: "linear-gradient(135deg, rgba(59,108,255,0.3), rgba(10,20,40,0.8))" }}
          />
          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Features section
// ============================================================================
const FEATURES = [
  {
    icon: QrCode,
    title: "QR pre-impresos",
    description:
      "Generá lotes de stickers QR en formato Avery 5160, pegálos en los equipos y registralos desde el celular escaneando el código.",
  },
  {
    icon: FileText,
    title: "Reportes con firma digital",
    description:
      "El técnico completa el reporte en sitio, saca fotos del problema y el cliente firma digitalmente en la pantalla del celular.",
  },
  {
    icon: CalendarClock,
    title: "Mantenimientos programados",
    description:
      "Configurá la frecuencia de cada equipo. Maintly te avisa cuando vence, genera el próximo automáticamente cuando cerrás el reporte.",
  },
  {
    icon: Wrench,
    title: "Fichas por tipo de equipo",
    description:
      "Cada tipo de equipo tiene su plantilla personalizable: cámara, AC, ascensor, generador. El form builder arrastra campos sin código.",
  },
  {
    icon: MapPin,
    title: "Mapa de cobertura",
    description:
      "Visualizá todas las ubicaciones de tus clientes en un mapa interactivo. Planificá recorridos y encontrá equipos en sitio.",
  },
  {
    icon: BarChart3,
    title: "Dashboard en tiempo real",
    description:
      "Métricas de equipos, reportes y mantenimientos. Clima del día, cotizaciones y todo lo que necesitás al arrancar la jornada.",
  },
];

function FeaturesSection() {
  const { ref, visible } = useFadeIn();
  return (
    <section id="features" className="py-24 px-5" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <div
          className={`text-center mb-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <p className="text-xs font-semibold text-[#5f87ff] uppercase tracking-widest mb-4">
            Funcionalidades
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Todo lo que necesitás
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            Construido para empresas de seguridad electrónica, aire acondicionado,
            ascensores e instalaciones eléctricas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`bg-white/3 border border-white/8 rounded-2xl p-6 hover:bg-white/5 hover:border-white/12 transition-all duration-500 ${
                  visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#3b6cff]/15 border border-[#3b6cff]/20 text-[#5f87ff] mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Audience / rubros section
// ============================================================================
const RUBROS = [
  { Icon: Camera, name: "Seguridad y CCTV", desc: "Cámaras, DVR, NVR, alarmas, controles de acceso", color: "#3b6cff" },
  { Icon: Thermometer, name: "Refrigeración y climatización", desc: "Splits, cassettes, rooftop, chillers, VRF", color: "#06b6d4" },
  { Icon: Building2, name: "Ascensores", desc: "Cabinas, motores, cuadros de maniobra", color: "#8b5cf6" },
  { Icon: Zap, name: "Electricidad", desc: "Tableros, UPS, generadores, instalaciones", color: "#eab308" },
];

function AudienceSection() {
  const { ref, visible } = useFadeIn();
  return (
    <section id="audience" className="py-24 px-5 bg-white/[0.02]" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <div
          className={`text-center mb-14 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <p className="text-xs font-semibold text-[#5f87ff] uppercase tracking-widest mb-4">
            Para quién es
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Pensado para tu rubro
          </h2>
          <p className="text-lg text-white/50 max-w-xl mx-auto">
            Las plantillas y formularios vienen pre-configurados para cada tipo de empresa técnica.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {RUBROS.map((r, i) => {
            const Icon = r.Icon;
            return (
              <div
                key={r.name}
                className={`text-center p-6 bg-white/3 border border-white/8 rounded-2xl transition-all duration-500 hover:bg-white/6 ${
                  visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div
                  className="h-12 w-12 rounded-2xl grid place-items-center mx-auto mb-4"
                  style={{ background: `${r.color}20`, border: `1px solid ${r.color}30` }}
                >
                  <Icon className="h-6 w-6" style={{ color: r.color }} />
                </div>
                <p className="text-sm font-semibold text-white mb-1.5">{r.name}</p>
                <p className="text-xs text-white/40 leading-relaxed">{r.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CTA final
// ============================================================================
function CtaSection() {
  const { ref, visible } = useFadeIn();
  return (
    <section className="py-24 px-5" ref={ref}>
      <div
        className={`max-w-3xl mx-auto text-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        <div className="relative inline-block mb-8">
          <div
            className="absolute inset-0 blur-3xl opacity-30 rounded-full"
            style={{ background: "radial-gradient(circle, #3b6cff, transparent 70%)" }}
          />
          <span className="relative grid h-20 w-20 place-items-center rounded-3xl bg-[#3b6cff] text-white text-3xl font-bold shadow-2xl shadow-[#3b6cff]/50 mx-auto">
            M
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
          Empezá hoy, sin tarjeta
        </h2>
        <p className="text-lg text-white/50 mb-10 max-w-xl mx-auto">
          14 días de prueba con todas las funcionalidades. Sin compromiso.
          Cancelás cuando quieras.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login"
            className="flex items-center gap-2 text-sm font-semibold text-white bg-[#3b6cff] hover:bg-[#2553f0] px-8 py-3.5 rounded-full transition-all shadow-xl shadow-[#3b6cff]/30 hover:-translate-y-0.5"
          >
            Crear cuenta gratis
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/precios"
            className="text-sm text-white/50 hover:text-white px-6 py-3.5 transition-colors"
          >
            Ver planes y precios →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Footer
// ============================================================================
function Footer() {
  return (
    <footer className="border-t border-white/5 py-8 px-5">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#3b6cff] text-white text-xs font-bold">M</span>
          <span className="text-sm font-semibold text-white/60">Maintly</span>
        </div>
        <div className="flex items-center gap-6 text-xs text-white/30">
          <Link href="/precios" className="hover:text-white/60 transition-colors">Precios</Link>
          <Link href="/login" className="hover:text-white/60 transition-colors">Ingresar</Link>
          <span>© {new Date().getFullYear()} Maintly</span>
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// Main export
// ============================================================================
export function LandingPage() {
  return (
    <div
      className="min-h-screen text-white"
      style={{ background: "#060d1f" }}
    >
      <Background />
      <Navbar />
      <Hero />
      <FeaturesSection />
      <AudienceSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
