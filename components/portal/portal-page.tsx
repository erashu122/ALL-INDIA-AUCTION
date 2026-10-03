import Link from "next/link";

import { Button, Card, EmptyState } from "@/components/ui";
import type { PortalKind } from "@/config/portals";

type PortalPageProps = {
  action?: { href: string; label: string };
  children?: React.ReactNode;
  description: string;
  portal: PortalKind;
  title: string;
};

export function PortalPage({ action, children, description, portal, title }: PortalPageProps) {
  return (
    <section className="mx-auto w-full max-w-7xl">
      <div className="flex flex-col justify-between gap-4 border-b border-[var(--color-border)] pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-[var(--color-primary)]">{portal === "admin" ? "Platform operations" : `${portal[0].toUpperCase()}${portal.slice(1)} workspace`}</p>
          <h1 className="mt-1 text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">{description}</p>
        </div>
        {action ? (
          <Link href={action.href}>
            <Button>{action.label}</Button>
          </Link>
        ) : null}
      </div>
      <div className="pt-6">{children ?? <Card><EmptyState title={`No ${title.toLowerCase()} yet`} description="This workspace will show relevant records once they are available." /></Card>}</div>
    </section>
  );
}
