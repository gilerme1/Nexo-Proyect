# Maintly

Plataforma SaaS multi-tenant para gestión de mantenimiento técnico de equipos.

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS |
| Iconos | Lucide React |
| QR Scanner | @zxing/browser |
| Fotos | Cloudinary |
| Mapas | Leaflet (LocationMap) |
| Auth | Session custom (cookies) |
| Deploy | Vercel |
| DB (próximo) | Supabase (PostgreSQL) |

---

## Estructura de la app

Monolito fullstack en Next.js. Un solo deploy, sin separación front/back.

```
maintly/
├── app/
│   ├── app/           → tenant: dashboard, clientes, equipos, reportes, QR
│   ├── platform/      → super admin: tenants, planes, templates, billing
│   ├── login/         → autenticación
│   └── q/[code]/      → entry point de QR scan
├── components/
│   ├── layout/        → sidebar, topbar, mobile nav
│   ├── tenant/        → componentes del área tenant
│   ├── platform/      → componentes del área platform
│   ├── mobile/        → componentes exclusivos mobile
│   ├── reports/       → formularios y listas de reportes
│   ├── ui/            → sistema de diseño (Card, Badge, Button...)
│   └── widgets/       → mapa, QR scanner, theme toggle
├── lib/
│   ├── auth/          → sesión, acciones de login/logout
│   ├── actions/       → server actions
│   ├── data/          → store.ts (mock) + seeds
│   ├── types/         → tipos TypeScript centralizados
│   └── utils/         → formatters, cn helper
└── public/
```

---

## Modelo de la plataforma

```
Maintly (plataforma)
│
├── Platform Admin
│   └── /platform/* — desktop only
│       Gestiona tenants, planes, templates, facturación, auditoría
│
└── Tenants (empresas cliente)
    └── /app/*
        ├── Desktop  → tenant_admin / supervisor
        │   Gestión: clientes, ubicaciones, equipos, reportes, QR, analytics
        └── Mobile   → técnico / operario
            Flujo: Mapa → Equipo → Reporte + fotos
            Scanner QR, historial, agenda de mantenimientos
```

### Jerarquía de datos
```
Tenant → Cliente → Ubicación → Equipo → Reporte (historial)
                                      → ScheduledMaintenance (agenda)
```

### Roles
| Rol | Acceso |
|---|---|
| `platform_admin` | Todo /platform/* |
| `tenant_admin` | Todo /app/* |
| `technician` | /app/* sin billing, users, settings, QR Tags |
| `viewer` | Solo lectura |

---

## Entornos

### Desktop (≥ 1024px)
- Sidebar colapsable (260px / 72px)
- Navegación completa con todos los módulos
- Analytics, tablas, exportaciones, mapa global

### Mobile (< 1024px)
- Bottom nav fijo con 5 tabs: Dashboard · Mapa · Scanner · Equipos · Registros
- Scanner QR central destacado → abre cámara directo
- Flujo operativo: Mapa → elegir cliente → equipos → formulario + 2 fotos
- La separación desktop/mobile es puramente CSS (`lg:hidden` / `hidden lg:block`)

---

## Cómo arrancar en local

### Requisitos
- Node.js 20 o superior → [nodejs.org](https://nodejs.org)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/maintly.git
cd maintly

# Instalar dependencias
npm install

# Variables de entorno
cp .env.example .env.local
# Completar NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME y NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

# Levantar en desarrollo
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

### Sin Git (solo zip)

**Windows:** doble click en `iniciar.bat`
**Mac:** doble click en `iniciar.command`
> En Mac, si aparece error de permisos la primera vez:
> `chmod +x iniciar.command` en terminal, luego doble click.

---

## Variables de entorno

```bash
# .env.local
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=      # cloud name de tu cuenta Cloudinary
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=   # upload preset sin firma (unsigned)
```

---

## Credenciales de demo

La autenticación es demo — cualquier contraseña funciona con estos emails.

| Rol | Email |
|---|---|
| Platform Admin | `andres@maintly.app` |
| Tenant Admin (Seguridad Norte) | `carla@seguridadnorte.uy` |
| Técnico (Seguridad Norte) | `diego@seguridadnorte.uy` |
| Tenant Admin (ClimaVisión) | `ines@climavision.uy` |
| Técnico (ClimaVisión) | `matias@climavision.uy` |

---

## Estado de la app

### Implementado
- [x] Autenticación demo multi-rol
- [x] Platform admin completo (/platform/*)
- [x] Tenant desktop completo con analytics
- [x] Mobile UX con bottom nav + flujo operativo
- [x] QR Scanner (@zxing/browser) → redirect a equipo
- [x] Fotos en reportes via Cloudinary
- [x] Mapa de ubicaciones (Leaflet)
- [x] Dark/light mode
- [x] Loading skeletons en rutas lentas
- [x] Filtrado de nav por rol

### Próximos pasos
- [ ] Supabase: reemplazar store.ts por PostgreSQL real
- [ ] Auth real (Supabase Auth o NextAuth)
- [ ] Persistencia de datos
- [ ] Push notifications (mantenimientos vencidos)
- [ ] Export PDF de reportes
- [ ] Separación NestJS + React cuando escale

---

## Deploy

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy a producción
vercel --prod
```

URL de producción: `https://maintly-lyart.vercel.app`

> El free tier de Vercel soporta tráfico de MVP sin costo.
> Límite relevante: 100k ejecuciones serverless/mes y 10s por función.

---

## Notas importantes

**Los datos no persisten** — esta versión usa `lib/data/store.ts` como mock en memoria.
Al reiniciar el servidor los datos vuelven al estado inicial del seed.
La conexión a Supabase es el siguiente paso para tener persistencia real.

**Si `.next` se corrompe en Windows:**
```bash
rm -rf .next && npm run dev
```
Ocurre cuando el antivirus o OneDrive interfiere con los archivos temporales de Turbopack.
Solución definitiva: excluir la carpeta del proyecto de Windows Defender y OneDrive.