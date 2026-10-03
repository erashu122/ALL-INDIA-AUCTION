import { roleHasPermission } from "../lib/permissions.ts";
import { prisma } from "../lib/prisma.ts";
import type { AuthenticatedUser } from "../types/auth.ts";

export class AuctionReviewError extends Error {}

const directionByType = { FORWARD: "UPWARD", REVERSE: "DOWNWARD", RANK: "RANK_BASED" } as const;

async function clientOrganizationId(actor: AuthenticatedUser) {
  if (actor.role !== "CLIENT" || !roleHasPermission(actor.role, "AUCTIONS:UPDATE")) {
    throw new AuctionReviewError("You are not allowed to submit auctions for review.");
  }
  const membership = await prisma.userOrganization.findFirst({
    where: { userId: actor.id, organization: { type: "CLIENT", isActive: true } },
    select: { organizationId: true },
  });
  if (!membership) throw new AuctionReviewError("Your client organization is unavailable.");
  return membership.organizationId;
}

function assertReviewer(actor: AuthenticatedUser) {
  if ((actor.role !== "ADMIN" && actor.role !== "SUPER_ADMIN") || !roleHasPermission(actor.role, "AUCTIONS:APPROVE")) {
    throw new AuctionReviewError("You are not allowed to review auctions.");
  }
}

export async function validateAuctionCompleteness(auctionId: string) {
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    include: { items: { select: { lotNumber: true, name: true, quantity: true, unit: true } } },
  });
  if (!auction) throw new AuctionReviewError("Auction not found.");
  const errors: string[] = [];
  if (!auction.title.trim()) errors.push("an auction title");
  if (!auction.currency.trim()) errors.push("a currency");
  if (auction.bidDirection !== directionByType[auction.type]) errors.push("valid auction pricing direction");
  if (auction.scheduledEndAt <= auction.scheduledStartAt) errors.push("a valid auction schedule");
  if (auction.type !== "RANK" && (!auction.bidStepAmount || auction.bidStepAmount.lte(0))) errors.push("a positive bid increment or decrement");
  if (auction.emdRequired && (!auction.emdAmount || auction.emdAmount.lte(0))) errors.push("a positive EMD amount");
  if (auction.autoExtensionEnabled && (!auction.extensionDurationMinutes || auction.extensionDurationMinutes <= 0)) errors.push("a positive extension duration");
  if (!auction.items.length) errors.push("at least one lot");
  if (new Set(auction.items.map((item) => item.lotNumber)).size !== auction.items.length) errors.push("unique lot numbers");
  if (auction.items.some((item) => !item.lotNumber.trim() || !item.name.trim() || !item.unit.trim() || item.quantity.lte(0))) errors.push("valid lot details");
  if (errors.length) throw new AuctionReviewError(`Complete ${errors.join(", ")} before submitting this auction.`);
  return auction;
}

async function transition(auctionId: string, from: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "REJECTED", to: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED", actor: AuthenticatedUser, action: string, extra?: Record<string, string>) {
  return prisma.$transaction(async (tx) => {
    const result = await tx.auction.updateMany({
      where: { id: auctionId, status: from },
      data: { status: to, updatedById: actor.id, ...(to === "APPROVED" ? { approvedById: actor.id, approvedAt: new Date() } : {}), ...(to === "REJECTED" ? { rejectedAt: new Date() } : {}) },
    });
    if (result.count !== 1) throw new AuctionReviewError("This auction has already changed state. Refresh the page and try again.");
    await tx.auditLog.create({ data: { actorUserId: actor.id, action, entityType: "AUCTION", entityId: auctionId, newValue: { from, to, ...extra } } });
  });
}

export async function submitAuctionForReview(actor: AuthenticatedUser, auctionId: string) {
  const organizationId = await clientOrganizationId(actor);
  const auction = await validateAuctionCompleteness(auctionId);
  if (auction.clientOrganizationId !== organizationId) throw new AuctionReviewError("You cannot submit another organization’s auction.");
  await transition(auctionId, "DRAFT", "SUBMITTED", actor, "AUCTION_SUBMITTED_FOR_REVIEW", { auctionNumber: auction.auctionNumber });
}

export async function startAuctionReview(actor: AuthenticatedUser, auctionId: string) {
  assertReviewer(actor);
  await transition(auctionId, "SUBMITTED", "UNDER_REVIEW", actor, "AUCTION_REVIEW_STARTED");
}

export async function approveAuction(actor: AuthenticatedUser, auctionId: string) {
  assertReviewer(actor);
  const auction = await validateAuctionCompleteness(auctionId);
  await transition(auctionId, "UNDER_REVIEW", "APPROVED", actor, "AUCTION_APPROVED", { auctionNumber: auction.auctionNumber });
}

export async function rejectAuction(actor: AuthenticatedUser, auctionId: string, reason: string) {
  assertReviewer(actor);
  const safeReason = reason.trim();
  if (!safeReason) throw new AuctionReviewError("Provide a rejection reason.");
  if (safeReason.length > 2_000) throw new AuctionReviewError("Keep the rejection reason to 2,000 characters or fewer.");
  await transition(auctionId, "UNDER_REVIEW", "REJECTED", actor, "AUCTION_REJECTED", { reason: safeReason });
}

export async function returnRejectedAuctionToDraft(actor: AuthenticatedUser, auctionId: string) {
  const organizationId = await clientOrganizationId(actor);
  const auction = await prisma.auction.findUnique({ where: { id: auctionId }, select: { clientOrganizationId: true } });
  if (!auction || auction.clientOrganizationId !== organizationId) throw new AuctionReviewError("You cannot edit another organization’s auction.");
  await transition(auctionId, "REJECTED", "DRAFT", actor, "AUCTION_REOPENED_FOR_CORRECTION");
}

export async function getAuctionDecision(actor: AuthenticatedUser, auctionId: string) {
  if (actor.role !== "CLIENT" && actor.role !== "ADMIN" && actor.role !== "SUPER_ADMIN") return null;
  const organizationId = actor.role === "CLIENT" ? await clientOrganizationId(actor) : undefined;
  const auction = await prisma.auction.findUnique({ where: { id: auctionId }, select: { clientOrganizationId: true } });
  if (!auction || (organizationId && auction.clientOrganizationId !== organizationId) || !roleHasPermission(actor.role, "AUCTIONS:VIEW")) return null;
  const [rejection, history] = await Promise.all([
    prisma.auditLog.findFirst({ where: { entityId: auctionId, action: "AUCTION_REJECTED" }, orderBy: { createdAt: "desc" }, select: { createdAt: true, newValue: true } }),
    prisma.auditLog.findMany({ where: { entityId: auctionId, entityType: "AUCTION" }, orderBy: { createdAt: "desc" }, take: 20, select: { action: true, createdAt: true, actor: { select: { name: true } }, newValue: true } }),
  ]);
  const reason = rejection?.newValue && typeof rejection.newValue === "object" && "reason" in rejection.newValue && typeof rejection.newValue.reason === "string" ? rejection.newValue.reason : undefined;
  return { rejectionReason: reason, rejectionAt: rejection?.createdAt, history };
}
