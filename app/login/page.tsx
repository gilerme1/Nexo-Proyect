import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { LoginForm } from "@/components/auth/LoginForm";
import { BRAND } from "@/lib/brand";

export default async function LoginPage() {
  const session = await getSession();
  if (session.isLoggedIn) {
    if (session.workspace.kind === "platform") redirect("/platform");
    else redirect("/app");
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex flex-col">
      {/* Subtle gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,108,255,0.12), transparent 60%)",
        }}
        aria-hidden
      />

      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 relative">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--accent-500)] text-white text-lg font-bold shadow-lg">
            M
          </span>
          <span className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
            {BRAND.name}
          </span>
        </div>

        {/* Card */}
        <div className="w-full max-w-sm">
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl shadow-[var(--shadow-elevated)] px-8 py-8 space-y-6">
            <div className="text-center space-y-1">
              <h1 className="text-xl font-semibold text-[var(--text-primary)]">
                Bienvenido
              </h1>
              <p className="text-sm text-[var(--text-tertiary)]">
                Ingresá a tu cuenta
              </p>
            </div>

            <LoginForm />
          </div>

          <p className="text-center mt-6 text-2xs text-[var(--text-tertiary)]">
            ¿No tenés cuenta?{" "}
            <a
              href="mailto:hola@maintly.app"
              className="text-[var(--accent-400)] hover:underline"
            >
              Contactanos
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative py-4 text-center text-2xs text-[var(--text-tertiary)]">
        © {new Date().getFullYear()} {BRAND.name} · Todos los derechos reservados
      </footer>
    </div>
  );
}
