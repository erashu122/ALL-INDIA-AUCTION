import { notFound } from "next/navigation";

import { DraftAuctionForm, toDraftFormData } from "@/components/portal";
import { requireAuthenticatedUser } from "@/lib/auth";
import { roleHasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getAuthorizedAuctionDraft } from "@/services/auction-drafts";

export default async function AdminEditAuctionPage({ params }: { params: Promise<{ auctionId: string }> }) {
  const user = await requireAuthenticatedUser();
  const { auctionId } = await params;
  if (!roleHasPermission(user.role, "AUCTIONS:UPDATE")) notFound();

  const [auction, clientOrganizations] = await Promise.all([
    getAuthorizedAuctionDraft(user, auctionId),
    prisma.organization.findMany({
      where: { type: "CLIENT", isActive: true },
      select: { id: true, displayName: true, legalName: true },
      orderBy: { legalName: "asc" },
    }),
  ]);

  if (!auction || auction.status !== "DRAFT") notFound();

  return <DraftAuctionForm clientOrganizations={clientOrganizations.map((organization) => ({ id: organization.id, name: organization.displayName ?? organization.legalName }))} initial={toDraftFormData(auction)} portal="admin" />;
}
