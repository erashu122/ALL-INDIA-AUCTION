import Link from "next/link";

import { Badge, Card, EmptyState, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export default async function AdminApprovalsPage() {
  const auctions = await prisma.auction.findMany({
    where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
    orderBy: { updatedAt: "asc" },
    select: { id: true, auctionNumber: true, title: true, type: true, status: true, scheduledStartAt: true, scheduledEndAt: true, clientOrganization: { select: { displayName: true, legalName: true } }, updatedBy: { select: { name: true } } },
  });
  return <section className="mx-auto max-w-6xl space-y-6"><div><h1 className="text-2xl font-semibold">Auction approvals</h1><p className="mt-1 text-sm text-[var(--color-text-muted)]">Submitted auctions awaiting review and active reviews.</p></div><Card className="overflow-x-auto p-0">{auctions.length ? <Table><TableHeader><TableRow><TableHead>Auction</TableHead><TableHead>Client</TableHead><TableHead>Type</TableHead><TableHead>Schedule</TableHead><TableHead>Reviewer</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{auctions.map((auction) => <TableRow key={auction.id}><TableCell><Link className="font-medium text-[var(--color-primary)] hover:underline" href={`/admin/auctions/${auction.id}`}>{auction.auctionNumber}</Link><p className="text-xs text-[var(--color-text-muted)]">{auction.title}</p></TableCell><TableCell>{auction.clientOrganization.displayName ?? auction.clientOrganization.legalName}</TableCell><TableCell>{auction.type}</TableCell><TableCell>{auction.scheduledStartAt.toLocaleString()}<br />{auction.scheduledEndAt.toLocaleString()}</TableCell><TableCell>{auction.status === "UNDER_REVIEW" ? auction.updatedBy?.name ?? "Assigned" : "Unassigned"}</TableCell><TableCell><Badge variant={auction.status === "UNDER_REVIEW" ? "warning" : "neutral"}>{auction.status}</Badge></TableCell></TableRow>)}</TableBody></Table> : <EmptyState description="Submitted auctions will appear here for review." title="No auctions require review" />}</Card></section>;
}
