import { rolePermissions } from "../config/permissions.ts";
import type { Permission, Role } from "../types/permissions.ts";

export function getRolePermissions(role: Role): readonly Permission[] {
  return rolePermissions[role];
}

export function roleHasPermission(role: Role, permission: Permission): boolean {
  return getRolePermissions(role).includes(permission);
}

export function roleHasAnyPermission(
  role: Role,
  requiredPermissions: readonly Permission[],
): boolean {
  return requiredPermissions.some((permission) =>
    roleHasPermission(role, permission),
  );
}

export function roleHasAllPermissions(
  role: Role,
  requiredPermissions: readonly Permission[],
): boolean {
  return requiredPermissions.every((permission) =>
    roleHasPermission(role, permission),
  );
}

export function rolesWithPermission(permission: Permission): readonly Role[] {
  return (Object.keys(rolePermissions) as Role[]).filter((role) =>
    roleHasPermission(role, permission),
  );
}
