import type { getAuthorizedAuctionDraft } from "@/services/auction-drafts";

import type { DraftFormData } from "./draft-auction-form";

type AuthorizedDraft = NonNullable<Awaited<ReturnType<typeof getAuthorizedAuctionDraft>>>;

export function toDraftFormData(auction: AuthorizedDraft): DraftFormData {
  return {
    id: auction.id,
    auctionNumber: auction.auctionNumber,
    title: auction.title,
    description: auction.description,
    type: auction.type,
    status: auction.status,
    visibility: auction.visibility,
    participationType: auction.participationType,
    currency: auction.currency as DraftFormData["currency"],
    clientOrganizationId: auction.clientOrganizationId,
    clientOrganizationName: auction.clientOrganization.displayName ?? auction.clientOrganization.legalName,
    scheduledStartAt: auction.scheduledStartAt.toISOString(),
    scheduledEndAt: auction.scheduledEndAt.toISOString(),
    timezone: auction.timezone,
    tenderNumber: auction.tenderNumber,
    location: auction.location,
    bidStepAmount: auction.bidStepAmount?.toString(),
    minimumBidValue: auction.minimumBidValue?.toString(),
    maximumBidValue: auction.maximumBidValue?.toString(),
    autoExtensionEnabled: auction.autoExtensionEnabled,
    extensionDurationMinutes: auction.extensionDurationMinutes,
    emdRequired: auction.emdRequired,
    emdAmount: auction.emdAmount?.toString(),
    securityDepositRequirement: auction.securityDepositRequirement,
    updatedAt: auction.updatedAt.toISOString(),
    items: auction.items.map((item) => ({
      id: item.id,
      lotNumber: item.lotNumber,
      name: item.name,
      description: item.description,
      quantity: item.quantity.toString(),
      unit: item.unit,
      startingPrice: item.startingPrice?.toString(),
    })),
  };
}
