import type { AuthenticatedUser, SessionPayload } from "../../types/auth.ts";
import { ROLES, type Role } from "../../types/permissions.ts";

function isRole(value: unknown): value is Role {
  return typeof value === "string" && ROLES.includes(value as Role);
}

export function toSessionPayload(value: unknown): SessionPayload | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const payload = value as Partial<AuthenticatedUser> & {
    expiresAt?: unknown;
    iat?: unknown;
  };

  if (
    typeof payload.id !== "string" ||
    typeof payload.name !== "string" ||
    typeof payload.email !== "string" ||
    !isRole(payload.role) ||
    (payload.organizationName !== undefined &&
      typeof payload.organizationName !== "string") ||
    typeof payload.expiresAt !== "number" ||
    typeof payload.iat !== "number"
  ) {
    return null;
  }

  return {
    id: payload.id,
    name: payload.name,
    email: payload.email,
    role: payload.role,
    ...(payload.organizationName === undefined
      ? {}
      : { organizationName: payload.organizationName }),
    expiresAt: payload.expiresAt,
    issuedAt: payload.iat,
  };
}
