import { Prisma } from "@prisma/client";

import { roleHasPermission } from "../lib/permissions.ts";
import { prisma } from "../lib/prisma.ts";
import type { AuthenticatedUser } from "../types/auth.ts";

export class VendorParticipationError extends Error {}

async function vendorOrganization(actor: AuthenticatedUser) {
  if (actor.role !== "VENDOR" || !roleHasPermission(actor.role, "AUCTIONS:PARTICIPATE")) throw new VendorParticipationError("You are not allowed to participate in auctions.");
  const membership = await prisma.userOrganization.findFirst({ where: { userId: actor.id, isPrimary: true, organization: { type: "VENDOR", isActive: true } }, select: { organizationId: true } });
  if (!membership) throw new VendorParticipationError("Your active vendor organization is unavailable.");
  return membership.organizationId;
}

export type ParticipationEligibility = { allowed: boolean; canRequestParticipation: boolean; eligible: boolean; reason?: string; vendorOrganizationId?: string; participation?: { id: string; status: string; eligibilityStatus: string }; emdStatus?: string };

export async function getVendorAuctionEligibility(actor: AuthenticatedUser, auctionId: string, now = new Date()): Promise<ParticipationEligibility> {
  let vendorOrganizationId: string;
  try { vendorOrganizationId = await vendorOrganization(actor); } catch (error) { return { allowed: false, canRequestParticipation: false, eligible: false, reason: error instanceof VendorParticipationError ? error.message : "Participation is unavailable." }; }
  const auction = await prisma.auction.findFirst({ where: { id: auctionId, status: "PUBLISHED", visibility: "PUBLIC" }, select: { participationType: true, participationDeadlineAt: true, scheduledStartAt: true, emdRequired: true, participations: { where: { vendorOrganizationId }, select: { id: true, status: true, eligibilityStatus: true, emdRecords: { select: { status: true } } } } } });
  if (!auction) return { allowed: false, canRequestParticipation: false, eligible: false, reason: "This auction is not available for participation.", vendorOrganizationId };
  const participation = auction.participations[0];
  if (participation) { const emdStatus = participation.emdRecords[0]?.status ?? (auction.emdRequired ? "PENDING" : "NOT_REQUIRED"); const eligible = participation.status === "APPROVED" && participation.eligibilityStatus === "ELIGIBLE" && (!auction.emdRequired || emdStatus === "VERIFIED"); return { allowed: false, canRequestParticipation: false, eligible, reason: eligible ? "Eligible for future bidding." : participation.status === "REJECTED" ? "Participation was rejected." : auction.emdRequired && emdStatus !== "VERIFIED" ? "Participation approved; EMD verification is pending." : "Participation is awaiting approval.", vendorOrganizationId, participation, emdStatus }; }
  if (auction.participationType !== "OPEN") return { allowed: false, canRequestParticipation: false, eligible: false, reason: "This restricted auction has no vendor eligibility assignment yet.", vendorOrganizationId };
  if (auction.participationDeadlineAt && auction.participationDeadlineAt <= now) return { allowed: false, canRequestParticipation: false, eligible: false, reason: "The participation deadline has passed.", vendorOrganizationId };
  if (auction.scheduledStartAt <= now) return { allowed: false, canRequestParticipation: false, eligible: false, reason: "The participation window is closed.", vendorOrganizationId };
  return { allowed: true, canRequestParticipation: true, eligible: false, vendorOrganizationId };
}

export async function createVendorParticipation(actor: AuthenticatedUser, auctionId: string) {
  const eligibility = await getVendorAuctionEligibility(actor, auctionId);
  if (!eligibility.canRequestParticipation || !eligibility.vendorOrganizationId) throw new VendorParticipationError(eligibility.reason ?? "Participation is unavailable.");
  try {
    return await prisma.$transaction(async (tx) => {
      const participation = await tx.vendorParticipation.create({ data: { auctionId, vendorOrganizationId: eligibility.vendorOrganizationId!, status: "SUBMITTED", eligibilityStatus: "PENDING", appliedAt: new Date(), submittedAt: new Date() } });
      await tx.auditLog.create({ data: { actorUserId: actor.id, action: "VENDOR_PARTICIPATION_REQUESTED", entityType: "VENDOR_PARTICIPATION", entityId: participation.id, newValue: { auctionId, vendorOrganizationId: eligibility.vendorOrganizationId, status: "SUBMITTED", eligibilityStatus: "PENDING" } } });
      return participation;
    });
  } catch (error) { if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new VendorParticipationError("Participation has already been requested."); throw error; }
}

export async function getVendorDiscoverableAuctions(actor: AuthenticatedUser) {
  const organizationId = await vendorOrganization(actor);
  const now = new Date();
  return prisma.auction.findMany({ where: { status: "PUBLISHED", visibility: "PUBLIC", participationType: "OPEN", scheduledStartAt: { gt: now }, OR: [{ participationDeadlineAt: null }, { participationDeadlineAt: { gt: now } }] }, orderBy: { scheduledStartAt: "asc" }, take: 50, select: { id: true, auctionNumber: true, title: true, type: true, scheduledStartAt: true, scheduledEndAt: true, currency: true, emdRequired: true, emdAmount: true, participations: { where: { vendorOrganizationId: organizationId }, select: { status: true, eligibilityStatus: true } } } });
}

export async function getVendorAuctionView(actor: AuthenticatedUser, auctionId: string) {
  const eligibility = await getVendorAuctionEligibility(actor, auctionId);
  const auction = await prisma.auction.findFirst({ where: { id: auctionId, status: "PUBLISHED", visibility: "PUBLIC" }, select: { id: true, auctionNumber: true, title: true, description: true, type: true, scheduledStartAt: true, scheduledEndAt: true, currency: true, bidDirection: true, bidStepAmount: true, participationType: true, emdRequired: true, emdAmount: true, emdCurrency: true, items: { where: { status: "ACTIVE" }, orderBy: { lotNumber: "asc" }, select: { id: true, lotNumber: true, name: true, description: true, quantity: true, unit: true, startingPrice: true } }, documents: { where: { access: "PUBLIC" }, select: { id: true, name: true, fileName: true } }, media: { where: { access: "PUBLIC" }, select: { id: true, fileName: true, type: true } } } });
  if (!auction) return null;
  return { auction, eligibility };
}
