// ============================================================================
// Mock Session (provisional — replace with Supabase auth in delivery 5)
// ============================================================================
//
// This file simulates the currently logged-in user. In dev, you can switch
// between Super Admin and Tenant Admin using the workspace switcher in the UI.
// The choice persists in a cookie so it survives reloads.

import type { ID, AppRole } from "@/lib/types";

export interface Session {
  userId: ID;
  isLoggedIn: boolean;
  workspace:
    | { kind: "platform" }
    | { kind: "tenant"; tenantId: ID };
  role: AppRole;
}

export const SESSION_COOKIE = "maintly_session";

// Default: NOT logged in
export const defaultSession: Session = {
  userId: "",
  isLoggedIn: false,
  workspace: { kind: "platform" },
  role: "platform_admin",
};
