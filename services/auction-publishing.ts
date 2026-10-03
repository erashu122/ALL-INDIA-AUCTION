import { roleHasPermission } from "../lib/permissions.ts";
import { prisma } from "../lib/prisma.ts";
import type { AuthenticatedUser } from "../types/auth.ts";
import { AuctionReviewError, validateAuctionCompleteness } from "./auction-review.ts";

export async function publishAuction(actor: AuthenticatedUser, auctionId: string) {
  if ((actor.role !== "ADMIN" && actor.role !== "SUPER_ADMIN") || !roleHasPermission(actor.role, "AUCTIONS:APPROVE")) throw new AuctionReviewError("You are not allowed to publish auctions.");
  const auction = await validateAuctionCompleteness(auctionId);
  await prisma.$transaction(async (tx) => {
    const updated = await tx.auction.updateMany({ where: { id: auctionId, status: "APPROVED" }, data: { status: "PUBLISHED", updatedById: actor.id } });
    if (updated.count !== 1) throw new AuctionReviewError("This auction has already changed state. Refresh the page and try again.");
    await tx.auditLog.create({ data: { actorUserId: actor.id, action: "AUCTION_PUBLISHED", entityType: "AUCTION", entityId: auctionId, newValue: { from: "APPROVED", to: "PUBLISHED", auctionNumber: auction.auctionNumber } } });
  });
}

type PublicQuery = { query?: string; type?: "FORWARD" | "REVERSE" | "RANK" };

export async function getPublicAuctions({ query, type }: PublicQuery = {}) {
  const search = query?.trim();
  return prisma.auction.findMany({
    where: { status: "PUBLISHED", visibility: "PUBLIC", ...(type ? { type } : {}), ...(search ? { OR: [{ auctionNumber: { contains: search, mode: "insensitive" } }, { title: { contains: search, mode: "insensitive" } }] } : {}) },
    orderBy: { scheduledStartAt: "asc" }, take: 50,
    select: { id: true, auctionNumber: true, title: true, type: true, status: true, scheduledStartAt: true, scheduledEndAt: true, currency: true, bidStepAmount: true },
  });
}

export async function getPublicAuction(auctionId: string) {
  return prisma.auction.findFirst({
    where: { id: auctionId, status: "PUBLISHED", visibility: "PUBLIC" },
    select: { id: true, auctionNumber: true, title: true, description: true, type: true, status: true, scheduledStartAt: true, scheduledEndAt: true, timezone: true, currency: true, bidDirection: true, bidStepAmount: true, minimumBidValue: true, maximumBidValue: true, participationType: true, items: { where: { status: "ACTIVE" }, orderBy: { lotNumber: "asc" }, select: { id: true, lotNumber: true, name: true, description: true, quantity: true, unit: true, startingPrice: true, currency: true } }, documents: { where: { access: "PUBLIC" }, select: { id: true, name: true, fileName: true, mimeType: true } }, media: { where: { access: "PUBLIC" }, select: { id: true, type: true, fileName: true, mimeType: true } } },
  });
}
