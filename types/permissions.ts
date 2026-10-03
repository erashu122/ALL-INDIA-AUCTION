export const ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "CLIENT",
  "VENDOR",
  "SUPPORT",
] as const;

export const PERMISSION_AREAS = [
  "PUBLIC",
  "CLIENTS",
  "VENDORS",
  "AUCTIONS",
  "BIDS",
  "PAYMENTS",
  "DOCUMENTS",
  "NOTIFICATIONS",
  "REPORTS",
  "SUPPORT",
  "SETTINGS",
] as const;

export const PERMISSION_ACTIONS = [
  "VIEW",
  "CREATE",
  "UPDATE",
  "DELETE",
  "APPROVE",
  "REJECT",
  "MANAGE",
  "EXPORT",
  "PARTICIPATE",
  "BID",
  "PAUSE",
  "CANCEL",
  "EXTEND",
] as const;

export type Role = (typeof ROLES)[number];
export type PermissionArea = (typeof PERMISSION_AREAS)[number];
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];
export type Permission = `${PermissionArea}:${PermissionAction}`;

export type RoleDefinition = {
  key: Role;
  label: string;
  description: string;
};

export type PermissionDefinition = {
  key: Permission;
  area: PermissionArea;
  action: PermissionAction;
  label: string;
  description: string;
};

export type RolePermissionMap = Record<Role, readonly Permission[]>;
