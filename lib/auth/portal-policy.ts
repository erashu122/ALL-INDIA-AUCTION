import { roleHasAllPermissions } from "../permissions.ts";
import type { Permission, Role } from "../../types/permissions.ts";

export const PORTAL_PERMISSIONS = {
  admin: ["AUCTIONS:MANAGE"],
  client: ["AUCTIONS:CREATE"],
  vendor: ["AUCTIONS:PARTICIPATE"],
  support: ["SUPPORT:MANAGE"],
} as const satisfies Record<string, readonly Permission[]>;

export const PORTAL_ROLES = {
  admin: ["SUPER_ADMIN", "ADMIN"],
  client: ["CLIENT"],
  vendor: ["VENDOR"],
  support: ["SUPPORT"],
} as const satisfies Record<string, readonly Role[]>;

export type PortalKey = keyof typeof PORTAL_ROLES;

export function getPortalHome(role: Role): string {
  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return "/admin";
    case "CLIENT":
      return "/client";
    case "VENDOR":
      return "/vendor";
    case "SUPPORT":
      return "/support";
  }
}

export function canAccessPortal(role: Role, portal: PortalKey): boolean {
  return (
    (PORTAL_ROLES[portal] as readonly Role[]).includes(role) &&
    roleHasAllPermissions(role, PORTAL_PERMISSIONS[portal])
  );
}
