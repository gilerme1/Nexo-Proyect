"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, type Session } from "@/lib/auth/session";
import { store } from "@/lib/data/store";

const ONE_YEAR = 60 * 60 * 24 * 365;

// ============================================================================
// LOGIN
// ============================================================================

export async function login(formData: FormData): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Completá email y contraseña." };
  }

  const user = store.users.find((u) => u.email.toLowerCase() === email);

  if (!user) {
    return { error: "Email o contraseña incorrectos." };
  }

  // Validate password — users without a password set cannot log in
  if (!user.password || user.password !== password) {
    return { error: "Email o contraseña incorrectos." };
  }

  // For tenant users, resolve tenantId and role from their membership
  let tenantId = "";
  let role: Session["role"] = "tenant_admin";

  if (!user.isPlatformAdmin) {
    const membership = store.memberships.find((m) => m.userId === user.id && m.active);
    if (!membership) {
      return { error: "Este usuario no tiene acceso a ningún tenant activo." };
    }
    tenantId = membership.tenantId;
    role = membership.role as Session["role"];
  }

  const session: Session = {
    userId: user.id,
    isLoggedIn: true,
    workspace: user.isPlatformAdmin
      ? { kind: "platform" }
      : { kind: "tenant", tenantId },
    role: user.isPlatformAdmin ? "platform_admin" : role,
  };

  (await cookies()).set(SESSION_COOKIE, JSON.stringify(session), {
    path: "/",
    maxAge: ONE_YEAR,
    httpOnly: true,
    sameSite: "lax",
  });

  redirect(user.isPlatformAdmin ? "/platform" : "/app");
}

// ============================================================================
// LOGOUT
// ============================================================================

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/");
}

// ============================================================================
// WORKSPACE SWITCHES (keep existing)
// ============================================================================

export async function switchToPlatform() {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  let base: Partial<Session> = {};
  try { base = JSON.parse(raw ?? "{}"); } catch {}

  const session: Session = {
    userId: base.userId ?? "user_admin",
    isLoggedIn: true,
    workspace: { kind: "platform" },
    role: "platform_admin",
  };
  jar.set(SESSION_COOKIE, JSON.stringify(session), { path: "/", maxAge: ONE_YEAR, httpOnly: true, sameSite: "lax" });
  redirect("/platform");
}

export async function switchToTenant(formData: FormData) {
  const tenantId = String(formData.get("tenantId") ?? "");
  if (!tenantId) redirect("/");

  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  let base: Partial<Session> = {};
  try { base = JSON.parse(raw ?? "{}"); } catch {}

  // Only platform_admin can switch into a tenant workspace
  if (base.role !== "platform_admin") redirect("/app");

  const session: Session = {
    userId: base.userId ?? "user_admin",
    isLoggedIn: true,
    workspace: { kind: "tenant", tenantId },
    role: "platform_admin",
  };
  jar.set(SESSION_COOKIE, JSON.stringify(session), { path: "/", maxAge: ONE_YEAR, httpOnly: true, sameSite: "lax" });
  redirect("/app");
}
