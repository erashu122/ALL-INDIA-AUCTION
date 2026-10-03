import type { Permission, Role } from "@/types/permissions";

export type PortalKind = "admin" | "client" | "vendor" | "support";

export type PortalNavigationItem = {
  href: string;
  label: string;
  permission: Permission;
};

export type PortalDefinition = {
  kind: PortalKind;
  label: string;
  shortLabel: string;
  roles: readonly Role[];
  navigation: readonly PortalNavigationItem[];
};

export const portalDefinitions = {
  client: {
    kind: "client",
    label: "Client workspace",
    shortLabel: "Client",
    roles: ["CLIENT"],
    navigation: [
      { href: "/client", label: "Dashboard", permission: "AUCTIONS:VIEW" },
      { href: "/client/auctions", label: "My Auctions", permission: "AUCTIONS:VIEW" },
      { href: "/client/auctions/create", label: "Create Auction", permission: "AUCTIONS:CREATE" },
      { href: "/client/drafts", label: "Drafts", permission: "AUCTIONS:UPDATE" },
      { href: "/client/documents", label: "Documents", permission: "DOCUMENTS:VIEW" },
      { href: "/client/results", label: "Results", permission: "AUCTIONS:VIEW" },
      { href: "/client/profile", label: "Profile", permission: "SETTINGS:VIEW" },
    ],
  },
  vendor: {
    kind: "vendor",
    label: "Vendor workspace",
    shortLabel: "Vendor",
    roles: ["VENDOR"],
    navigation: [
      { href: "/vendor", label: "Dashboard", permission: "AUCTIONS:VIEW" },
      { href: "/vendor/auctions", label: "Available Auctions", permission: "AUCTIONS:VIEW" },
      { href: "/vendor/live", label: "Live Auctions", permission: "AUCTIONS:PARTICIPATE" },
      { href: "/vendor/bids", label: "My Bids", permission: "BIDS:VIEW" },
      { href: "/vendor/won", label: "Won Auctions", permission: "AUCTIONS:VIEW" },
      { href: "/vendor/payments", label: "Payments", permission: "PAYMENTS:VIEW" },
      { href: "/vendor/documents", label: "Documents", permission: "DOCUMENTS:VIEW" },
      { href: "/vendor/profile", label: "Profile", permission: "SETTINGS:VIEW" },
    ],
  },
  admin: {
    kind: "admin",
    label: "Operations control center",
    shortLabel: "Admin",
    roles: ["SUPER_ADMIN", "ADMIN"],
    navigation: [
      { href: "/admin", label: "Dashboard", permission: "AUCTIONS:MANAGE" },
      { href: "/admin/clients", label: "Clients", permission: "CLIENTS:VIEW" },
      { href: "/admin/vendors", label: "Vendors", permission: "VENDORS:VIEW" },
      { href: "/admin/auctions", label: "Auctions", permission: "AUCTIONS:VIEW" },
      { href: "/admin/auctions/create", label: "Create Auction", permission: "AUCTIONS:CREATE" },
      { href: "/admin/approvals", label: "Approvals", permission: "AUCTIONS:APPROVE" },
      { href: "/admin/participations", label: "Participations", permission: "VENDORS:APPROVE" },
      { href: "/admin/bids", label: "Bids", permission: "BIDS:VIEW" },
      { href: "/admin/payments", label: "Payments / EMD", permission: "PAYMENTS:VIEW" },
      { href: "/admin/documents", label: "Documents", permission: "DOCUMENTS:VIEW" },
      { href: "/admin/notifications", label: "Notifications", permission: "NOTIFICATIONS:VIEW" },
      { href: "/admin/reports", label: "Reports", permission: "REPORTS:VIEW" },
      { href: "/admin/settings", label: "Settings", permission: "SETTINGS:VIEW" },
    ],
  },
  support: {
    kind: "support",
    label: "Support workspace",
    shortLabel: "Support",
    roles: ["SUPPORT"],
    navigation: [
      { href: "/support", label: "Support overview", permission: "SUPPORT:VIEW" },
    ],
  },
} as const satisfies Record<PortalKind, PortalDefinition>;
