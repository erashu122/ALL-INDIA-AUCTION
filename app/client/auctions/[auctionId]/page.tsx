import { notFound } from "next/navigation";

import { AuctionDraftDetail } from "@/components/portal";
import { requireAuthenticatedUser } from "@/lib/auth";
import { getAuthorizedAuctionDraft } from "@/services/auction-drafts";
import { getAuctionDecision } from "@/services/auction-review";
import { listAuctionFiles } from "@/services/auction-files";

export default async function ClientAuctionDetailsPage({ params }: { params: Promise<{ auctionId: string }> }) {
  const user = await requireAuthenticatedUser();
  const { auctionId } = await params;
  const auction = await getAuthorizedAuctionDraft(user, auctionId);
  if (!auction) notFound();
  const [decision, files] = await Promise.all([getAuctionDecision(user, auctionId), listAuctionFiles(user, auctionId)]);
  return <AuctionDraftDetail auction={auction} files={files} history={decision?.history} portal="client" rejectionReason={decision?.rejectionReason} />;
}
