import { notFound } from "next/navigation";

import { DraftAuctionForm, toDraftFormData } from "@/components/portal";
import { requireAuthenticatedUser } from "@/lib/auth";
import { getAuthorizedAuctionDraft } from "@/services/auction-drafts";

export default async function ClientEditAuctionPage({ params }: { params: Promise<{ auctionId: string }> }) {
  const user = await requireAuthenticatedUser();
  const { auctionId } = await params;
  const auction = await getAuthorizedAuctionDraft(user, auctionId);

  if (!auction || auction.status !== "DRAFT") notFound();

  return <DraftAuctionForm initial={toDraftFormData(auction)} portal="client" />;
}
