import assert from "node:assert/strict";
import test from "node:test";

import { prisma } from "../../lib/prisma.ts";
import type { AuthenticatedUser } from "../../types/auth.ts";
import { createDraftAuction, type DraftAuctionInput } from "../../services/auction-drafts.ts";
import { approveParticipation, rejectParticipation, verifyParticipationEmd, ParticipationReviewError } from "../../services/participation-review.ts";
import { createVendorParticipation, getVendorAuctionEligibility } from "../../services/vendor-participation.ts";

function input(emdRequired: boolean): DraftAuctionInput { const start = new Date(Date.now() + 3_600_000); return { title: "Participation review fixture", category: "Test category", type: "FORWARD", currency: "INR", visibility: "PUBLIC", participationType: "OPEN", scheduledStartAt: start, endAt: new Date(start.getTime() + 3_600_000), timezone: "Asia/Kolkata", bidStepAmount: 10, emdRequired, emdAmount: emdRequired ? 100 : undefined, autoExtensionEnabled: false, items: [{ lotNumber: "1", name: "Fixture lot", quantity: 1, unit: "unit" }] }; }

test("admin review preserves EMD gating and grants eligibility only after legitimate verification", async () => {
  const users = await prisma.user.findMany({ where: { email: { in: ["client@example.test", "vendor@example.test", "admin@example.test", "superadmin@example.test", "support@example.test"] } }, select: { id: true, name: true, email: true, role: true } }); const byEmail = new Map(users.map((user) => [user.email, user])); const client = byEmail.get("client@example.test"); const vendor = byEmail.get("vendor@example.test"); const admin = byEmail.get("admin@example.test"); const superAdmin = byEmail.get("superadmin@example.test"); const support = byEmail.get("support@example.test"); assert.ok(client && vendor && admin && superAdmin && support);
  const actor = (user: NonNullable<typeof client>): AuthenticatedUser => ({ id: user.id, name: user.name, email: user.email, role: user.role }); const auctionIds: string[] = []; const participationIds: string[] = [];
  try {
    const emdAuction = await createDraftAuction(actor(client), input(true)); auctionIds.push(emdAuction.id); await prisma.auction.update({ where: { id: emdAuction.id }, data: { status: "PUBLISHED" } }); const emdParticipation = await createVendorParticipation(actor(vendor), emdAuction.id); participationIds.push(emdParticipation.id);
    await assert.rejects(() => approveParticipation(actor(vendor), emdParticipation.id), ParticipationReviewError); await assert.rejects(() => approveParticipation(actor(support), emdParticipation.id), ParticipationReviewError); await approveParticipation(actor(admin), emdParticipation.id);
    let current = await getVendorAuctionEligibility(actor(vendor), emdAuction.id); assert.equal(current.eligible, false); assert.equal(current.emdStatus, "PENDING"); assert.equal((await prisma.emdRecord.count({ where: { auctionId: emdAuction.id } })), 1);
    await verifyParticipationEmd(actor(superAdmin), emdParticipation.id); current = await getVendorAuctionEligibility(actor(vendor), emdAuction.id); assert.equal(current.eligible, true); assert.equal(current.emdStatus, "VERIFIED");

    const noEmdAuction = await createDraftAuction(actor(client), input(false)); auctionIds.push(noEmdAuction.id); await prisma.auction.update({ where: { id: noEmdAuction.id }, data: { status: "PUBLISHED" } }); const noEmdParticipation = await createVendorParticipation(actor(vendor), noEmdAuction.id); participationIds.push(noEmdParticipation.id); await approveParticipation(actor(superAdmin), noEmdParticipation.id); assert.equal((await getVendorAuctionEligibility(actor(vendor), noEmdAuction.id)).eligible, true);
    await assert.rejects(() => rejectParticipation(actor(admin), noEmdParticipation.id, "late"), ParticipationReviewError);
    assert.ok(await prisma.auditLog.count({ where: { entityId: emdParticipation.id, action: { in: ["VENDOR_PARTICIPATION_APPROVED", "EMD_VERIFIED"] } } }));
  } finally { if (participationIds.length) { await prisma.auditLog.deleteMany({ where: { entityId: { in: participationIds } } }); await prisma.vendorParticipation.deleteMany({ where: { id: { in: participationIds } } }); } if (auctionIds.length) { await prisma.emdRecord.deleteMany({ where: { auctionId: { in: auctionIds } } }); await prisma.auction.deleteMany({ where: { id: { in: auctionIds } } }); } await prisma.$disconnect(); }
});
