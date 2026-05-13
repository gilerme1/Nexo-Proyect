"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { login } from "@/lib/auth/actions";

export function LoginForm() {
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(fd: FormData) {
    setError(null);
    setLoading(true);
    const res = await login(fd);
    setLoading(false);
    if (res?.error) setError(res.error);
    // If no error, login() does redirect() — component unmounts
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {/* Email */}
      <div>
        <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
          Email
        </label>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="tu@empresa.com"
          className="w-full h-10 px-4 text-sm bg-[var(--bg-input)] border border-[var(--border-default)] rounded-full text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-500)] focus:ring-2 focus:ring-[var(--accent-500)]/20 outline-none"
        />
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-2xs font-medium text-[var(--text-secondary)]">
            Contraseña
          </label>
          <a
            href="#"
            className="text-2xs text-[var(--accent-400)] hover:underline"
            onClick={(e) => e.preventDefault()}
          >
            ¿Olvidaste la contraseña?
          </a>
        </div>
        <div className="relative">
          <input
            name="password"
            type={showPwd ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="w-full h-10 pl-4 pr-10 text-sm bg-[var(--bg-input)] border border-[var(--border-default)] rounded-full text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-500)] focus:ring-2 focus:ring-[var(--accent-500)]/20 outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-[var(--danger-bg)] border border-[var(--danger-border)] px-4 py-3 text-sm text-[var(--danger-fg)]">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-10 rounded-full bg-[var(--accent-500)] text-white text-sm font-semibold hover:bg-[var(--accent-600)] disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
