import { cookies } from "next/headers";
import { defaultSession, SESSION_COOKIE, type Session } from "./session";

export async function getSession(): Promise<Session> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return defaultSession;
  try {
    const parsed = JSON.parse(raw) as Session;
    // Legacy sessions without isLoggedIn — treat as logged in
    if (parsed.userId && parsed.isLoggedIn === undefined) {
      return { ...parsed, isLoggedIn: true };
    }
    return parsed;
  } catch {
    return defaultSession;
  }
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session.isLoggedIn) {
    const { redirect } = await import("next/navigation");
    redirect("/login");
  }
  return session;
}
