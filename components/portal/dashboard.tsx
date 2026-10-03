import Link from "next/link";

import { Button, Card, EmptyState, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import type { PortalKind } from "@/config/portals";
import type { AuthenticatedUser } from "@/types/auth";

type DashboardProps = { portal: Exclude<PortalKind, "support">; user: AuthenticatedUser };

const dashboardContent = {
  client: {
    title: "Dashboard",
    intro: "Plan, publish, and oversee procurement events from one workspace.",
    action: { href: "/client/auctions/create", label: "Create new auction" },
    metrics: ["Total Auctions", "Drafts", "Upcoming Auctions", "Live Auctions", "Completed Auctions"],
    table: ["Auction", "Status", "Schedule", "Owner"],
    sideTitle: "Pending actions",
    sideDescription: "Approvals and preparation tasks will appear here when an auction needs attention.",
  },
  vendor: {
    title: "Dashboard",
    intro: "Find qualified opportunities and keep participation work moving with confidence.",
    action: { href: "/vendor/auctions", label: "Browse available auctions" },
    metrics: ["Available Auctions", "Upcoming Auctions", "Live Auctions", "My Active Bids", "Won Auctions", "Pending EMD / Payments"],
    table: ["Auction", "Participation", "Schedule", "Next step"],
    sideTitle: "Auction reminders",
    sideDescription: "Important participation deadlines and live-event reminders will appear here.",
  },
  admin: {
    title: "Operations dashboard",
    intro: "A controlled view of platform activity, approvals, and auction operations.",
    action: { href: "/admin/auctions/create", label: "Create auction" },
    metrics: ["Total Clients", "Total Vendors", "Active Auctions", "Live Auctions", "Awaiting Approval", "Pending EMD"],
    table: ["Auction", "Client", "Status", "Schedule"],
    sideTitle: "Quick actions",
    sideDescription: "Open a workflow when you are ready to manage the underlying operational records.",
  },
} as const;

export function PortalDashboard({ portal, user }: DashboardProps) {
  const content = dashboardContent[portal];
  const quickActions = portal === "admin"
    ? [
        ["Create Auction", "/admin/auctions/create"],
        ["Manage Auctions", "/admin/auctions"],
        ["Review Approvals", "/admin/approvals"],
        ["Manage Vendors", "/admin/vendors"],
        ["Manage Clients", "/admin/clients"],
      ]
    : [];

  return (
    <section className="mx-auto w-full max-w-7xl">
      <div className="flex flex-col justify-between gap-5 border-b border-[var(--color-border)] pb-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-[var(--color-primary)]">Welcome back, {user.name}</p>
          <h1 className="mt-1 text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">{content.title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">{content.intro}</p>
        </div>
        <Link href={content.action.href}><Button>{content.action.label}</Button></Link>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {content.metrics.map((metric) => (
          <Card className="p-4" key={metric}>
            <p className="text-sm font-medium text-[var(--color-text-muted)]">{metric}</p>
            <p className="mt-4 text-3xl font-semibold text-[var(--color-text)]">—</p>
            <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">Available when live platform records are connected.</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="p-0">
          <div className="flex items-center justify-between px-5 py-4">
            <div><h2 className="font-semibold">Recent auctions</h2><p className="mt-1 text-sm text-[var(--color-text-muted)]">Latest activity for your workspace.</p></div>
          </div>
          <Table>
            <TableHeader><TableRow>{content.table.map((heading) => <TableHead key={heading}>{heading}</TableHead>)}</TableRow></TableHeader>
            <TableBody><TableRow><TableCell className="p-0" colSpan={content.table.length}><EmptyState title="No auctions to show" description="Auction records will appear here once they are created or shared with your organization." /></TableCell></TableRow></TableBody>
          </Table>
        </Card>
        <div className="space-y-6">
          <Card>
            <h2 className="font-semibold">{content.sideTitle}</h2>
            {quickActions.length ? (
              <div className="mt-4 grid gap-2">{quickActions.map(([label, href]) => <Link className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2.5 text-sm font-medium hover:bg-[var(--color-surface-muted)]" href={href} key={href}>{label}</Link>)}</div>
            ) : <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">{content.sideDescription}</p>}
          </Card>
          <Card>
            <h2 className="font-semibold">Recent notifications</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">No notifications are available yet.</p>
          </Card>
        </div>
      </div>
    </section>
  );
}
