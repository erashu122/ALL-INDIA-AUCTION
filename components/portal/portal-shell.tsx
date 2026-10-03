"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { signOutAction } from "@/app/login/actions";
import { portalDefinitions, type PortalKind } from "@/config/portals";
import { roleHasPermission } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import type { AuthenticatedUser } from "@/types/auth";

type PortalShellProps = {
  children: React.ReactNode;
  portal: PortalKind;
  user: AuthenticatedUser;
};

function isActiveRoute(pathname: string, href: string) {
  return href === "/admin" || href === "/client" || href === "/vendor" || href === "/support"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function PortalShell({ children, portal, user }: PortalShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const pathname = usePathname();
  const definition = portalDefinitions[portal];
  const navigation = definition.navigation.filter((item) =>
    roleHasPermission(user.role, item.permission),
  );

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--color-text)]">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-white px-4 lg:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <button
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation"
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 text-sm font-medium lg:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            type="button"
          >
            Menu
          </button>
          <Link className="truncate text-base font-semibold text-[var(--color-secondary)]" href={portal === "admin" ? "/admin" : `/${portal}`}>
            AuctionSphere <span className="hidden font-normal text-[var(--color-text-muted)] sm:inline">/ {definition.shortLabel}</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <button
              aria-expanded={notificationsOpen}
              aria-haspopup="dialog"
              className="relative rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]"
              onClick={() => setNotificationsOpen((open) => !open)}
              type="button"
            >
              Alerts
              <span aria-label="Unread notifications" className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--color-accent)]" />
            </button>
            {notificationsOpen ? (
              <div className="absolute right-0 top-11 w-80 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-md)]">
                <p className="text-sm font-semibold">Notifications</p>
                <p className="mt-4 text-sm leading-6 text-[var(--color-text-muted)]">There are no notifications to show yet.</p>
              </div>
            ) : null}
          </div>

          <div className="relative">
            <button
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className="flex max-w-44 items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 text-left hover:bg-[var(--color-surface-muted)] sm:max-w-60"
              onClick={() => setMenuOpen((open) => !open)}
              type="button"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary)] text-xs font-semibold text-white">
                {user.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden min-w-0 sm:block">
                <span className="block truncate text-sm font-medium">{user.name}</span>
                <span className="block truncate text-xs text-[var(--color-text-muted)]">{user.role.replace("_", " ")}</span>
              </span>
            </button>
            {menuOpen ? (
              <div className="absolute right-0 top-11 w-64 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-2 shadow-[var(--shadow-md)]">
                <div className="border-b border-[var(--color-border)] px-3 py-2">
                  <p className="truncate text-sm font-medium">{user.name}</p>
                  <p className="truncate text-xs text-[var(--color-text-muted)]">{user.organizationName ?? user.email}</p>
                </div>
                <Link className="mt-1 block rounded-[var(--radius-md)] px-3 py-2 text-sm hover:bg-[var(--color-surface-muted)]" href={`/${portal}/profile`}>
                  Profile
                </Link>
                {portal === "admin" ? (
                  <Link className="block rounded-[var(--radius-md)] px-3 py-2 text-sm hover:bg-[var(--color-surface-muted)]" href="/admin/settings">
                    Settings
                  </Link>
                ) : null}
                <form action={signOutAction}>
                  <button className="mt-1 w-full rounded-[var(--radius-md)] px-3 py-2 text-left text-sm text-[var(--color-danger)] hover:bg-red-50" type="submit">
                    Sign out
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className={cn("border-b border-[var(--color-border)] bg-white lg:min-h-[calc(100vh-4rem)] lg:border-b-0 lg:border-r", mobileOpen ? "block" : "hidden lg:block")}>
          <nav aria-label={`${definition.shortLabel} navigation`} className="space-y-1 p-3">
            <p className="px-3 pb-3 pt-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">{definition.label}</p>
            {navigation.map((item) => {
              const active = isActiveRoute(pathname, item.href);
              return (
                <Link
                  className={cn("block rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors", active ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]")}
                  href={item.href}
                  key={item.href}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
