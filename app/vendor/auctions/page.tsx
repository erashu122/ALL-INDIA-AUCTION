import Link from "next/link";

import { Badge, Card, EmptyState } from "@/components/ui";
import { requireAuthenticatedUser } from "@/lib/auth";
import { getVendorDiscoverableAuctions } from "@/services/vendor-participation";

export default async function VendorAuctionsPage() {
  const auctions = await getVendorDiscoverableAuctions(await requireAuthenticatedUser());
  return <section className="mx-auto max-w-6xl space-y-6"><div><h1 className="text-2xl font-semibold">Available auctions</h1><p className="mt-1 text-sm text-[var(--color-text-muted)]">Published open auctions with an active participation window.</p></div>{auctions.length ? <div className="grid gap-4 md:grid-cols-2">{auctions.map((auction) => <Card key={auction.id}><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-[var(--color-text-muted)]">{auction.auctionNumber}</p><h2 className="mt-1 text-lg font-semibold"><Link className="hover:underline" href={`/vendor/auctions/${auction.id}`}>{auction.title}</Link></h2></div><Badge variant="success">{auction.type}</Badge></div><p className="mt-4 text-sm text-[var(--color-text-muted)]">Starts {auction.scheduledStartAt.toLocaleString()}</p><p className="mt-1 text-sm text-[var(--color-text-muted)]">{auction.emdRequired ? `EMD required: ${auction.emdAmount?.toString() ?? "Pending"} ${auction.currency}` : "No EMD required"}</p></Card>)}</div> : <EmptyState description="Open published auctions will appear here while their participation window is active." title="No eligible auctions" />}</section>;
}
